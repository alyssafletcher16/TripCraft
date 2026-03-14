import { Router, Response } from 'express'
import { body, validationResult } from 'express-validator'
import multer from 'multer'
import * as XLSX from 'xlsx'
import * as pdfParseLib from 'pdf-parse'
import mammoth from 'mammoth'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

export const tripsRouter = Router()

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } })

interface ParsedBlock {
  type: 'TRANSPORT' | 'STAY' | 'ACTIVITY' | 'FOOD' | 'NOTE'
  title: string
  detail?: string
  price?: string
  status?: 'BOOKED' | 'PENDING' | 'CANCELLED'
  confCode?: string
  cancelPolicy?: string
  bookingUrl?: string
}

interface ParsedDay {
  dayNum: number
  name?: string
  theme?: string
  blocks?: ParsedBlock[]
}

interface ParsedTrip {
  title: string
  destination: string
  country?: string
  startDate?: string
  endDate?: string
  budget?: number
  travelers?: number
  notes?: string
  days?: ParsedDay[]
}

function colVal(row: Record<string, unknown>, candidates: string[]): string | undefined {
  const keys = Object.keys(row)
  for (const c of candidates) {
    const found = keys.find((k) => k.toLowerCase().replace(/[\s_-]/g, '') === c.toLowerCase().replace(/[\s_-]/g, ''))
    if (found && row[found] != null && String(row[found]).trim() !== '') return String(row[found]).trim()
  }
  return undefined
}

// POST /api/trips/import — parse file, return preview (no DB write)
tripsRouter.post('/import', requireAuth, upload.single('file'), async (req: AuthRequest, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  const ext = (req.file.originalname.split('.').pop() ?? '').toLowerCase()

  try {
    let trips: ParsedTrip[] = []

    if (ext === 'pdf' || ext === 'docx') {
      let text: string
      if (ext === 'pdf') {
        const pdfParse = (pdfParseLib as unknown as { default: (buf: Buffer) => Promise<{ text: string }> }).default ?? pdfParseLib
        const parsed = await pdfParse(req.file.buffer)
        text = parsed.text.slice(0, 12000)
      } else {
        const result = await mammoth.extractRawText({ buffer: req.file.buffer })
        text = result.value.slice(0, 12000)
      }
      const anthropic = new Anthropic()
      const msg = await anthropic.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: `Extract every trip mentioned in this document. Return a JSON array where each element has:
- title (string, descriptive trip name)
- destination (string, city or region)
- country (string, optional)
- startDate (string, YYYY-MM-DD, optional)
- endDate (string, YYYY-MM-DD, optional)
- budget (number, optional total budget)
- travelers (number, optional)
- notes (string, one-sentence summary, optional)
- days (array, optional): the day-by-day itinerary. Each day has:
  - dayNum (number, 1-based)
  - name (string, e.g. "Arrival Day", "Day 1", optional)
  - theme (string, short description of the day's theme, optional)
  - blocks (array): individual activities/bookings. Each block has:
    - type (one of: TRANSPORT, STAY, ACTIVITY, FOOD, NOTE)
    - title (string, concise name e.g. "Flight AA123", "Check in at Hotel XYZ")
    - detail (string, extra info like address, operator, notes, optional)
    - price (string, display price e.g. "$142/nt", optional)
    - status (one of: BOOKED, PENDING — use BOOKED if confirmation code or booking ref exists, else PENDING)
    - confCode (string, confirmation/booking reference if present, optional)
    - cancelPolicy (string, cancellation terms if mentioned, optional)
    - bookingUrl (string, URL if present, optional)

Block type guide: TRANSPORT for flights/trains/transfers, STAY for hotels/accommodation, ACTIVITY for tours/attractions/experiences, FOOD for restaurants/dining, NOTE for reminders/free text.

If the document does not have a structured day-by-day itinerary, omit the days field entirely.

Document:
${text}

Return ONLY valid JSON array. No markdown, no explanation.`,
        }],
      })
      const content = msg.content[0]
      if (content.type === 'text') {
        const jsonText = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        trips = JSON.parse(jsonText)
      }
    } else {
      // Excel / CSV
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: true })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { raw: false })

      trips = rows.map((row) => ({
        title: colVal(row, ['title', 'tripname', 'name', 'trip']) ?? 'Untitled Trip',
        destination: colVal(row, ['destination', 'city', 'place', 'location']) ?? '',
        country: colVal(row, ['country']),
        startDate: colVal(row, ['startdate', 'start', 'from', 'departure', 'startdate', 'starteddate']),
        endDate: colVal(row, ['enddate', 'end', 'to', 'return', 'returndate', 'endeddate']),
        budget: parseFloat(colVal(row, ['budget', 'cost', 'total']) ?? '') || undefined,
        travelers: parseInt(colVal(row, ['travelers', 'people', 'groupsize', 'guests', 'pax']) ?? '') || undefined,
        notes: colVal(row, ['notes', 'description', 'memo', 'comments', 'summary']),
      })).filter((t) => t.destination !== '')
    }

    return res.json({ trips })
  } catch (err) {
    console.error('Import parse error:', err)
    return res.status(500).json({ error: 'Failed to parse file' })
  }
})

// POST /api/trips/import/confirm — bulk-create trips as COMPLETED
tripsRouter.post('/import/confirm', requireAuth, async (req: AuthRequest, res) => {
  const { trips } = req.body as { trips: ParsedTrip[] }
  if (!Array.isArray(trips) || trips.length === 0) return res.status(400).json({ error: 'No trips provided' })

  try {
    const created = await prisma.$transaction(
      trips.map((t) =>
        prisma.trip.create({
          data: {
            userId: req.userId!,
            title: t.title,
            destination: t.destination,
            country: t.country ?? null,
            startDate: t.startDate ? new Date(t.startDate) : null,
            endDate: t.endDate ? new Date(t.endDate) : null,
            travelers: t.travelers ?? 1,
            budget: t.budget ?? null,
            status: (t.startDate && new Date(t.startDate) < new Date()) ? 'COMPLETED' : 'PLANNING',
            coverEmoji: '✈️',
            days: t.days && t.days.length > 0 ? {
              create: t.days.map((d) => ({
                dayNum: d.dayNum,
                name: d.name ?? `Day ${d.dayNum}`,
                theme: d.theme ?? null,
                blocks: d.blocks && d.blocks.length > 0 ? {
                  create: d.blocks.map((b, i) => ({
                    type: b.type,
                    title: b.title,
                    detail: b.detail ?? null,
                    price: b.price ?? null,
                    status: b.status ?? 'PENDING',
                    confCode: b.confCode ?? null,
                    cancelPolicy: b.cancelPolicy ?? null,
                    bookingUrl: b.bookingUrl ?? null,
                    sortOrder: i,
                  })),
                } : undefined,
              })),
            } : undefined,
          },
        })
      )
    )
    return res.status(201).json({ trips: created })
  } catch (err) {
    console.error('Import confirm error:', err)
    return res.status(500).json({ error: 'Failed to save trips' })
  }
})

// POST /api/trips/reorder — bulk-update rank positions
tripsRouter.post('/reorder', requireAuth, async (req: AuthRequest, res) => {
  const { order } = req.body as { order: { id: string; rank: number }[] }
  if (!Array.isArray(order)) return res.status(400).json({ error: 'order array required' })
  try {
    await prisma.$transaction(
      order.map(({ id, rank }) =>
        prisma.trip.updateMany({ where: { id, userId: req.userId }, data: { rank } })
      )
    )
    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/trips  — current user's trips
tripsRouter.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { userId: req.userId },
      include: {
        vibes: true,
        _count: { select: { days: true, upvotes: true } },
        community: { select: { isPublic: true, friendsOnly: true, isAnonymous: true } },
        itineraryImport: { select: { id: true } },
        reflection: { select: { id: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })
    return res.json(trips)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/trips
tripsRouter.post(
  '/',
  requireAuth,
  [
    body('title').trim().notEmpty(),
    body('destination').trim().notEmpty(),
    body('travelers').optional().isInt({ min: 1 }),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { title, destination, country, startDate, endDate, travelers, budget, budgetType, vibes, coverEmoji } =
      req.body
    try {
      const trip = await prisma.trip.create({
        data: {
          userId: req.userId!,
          title,
          destination,
          country,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          travelers: travelers ?? 1,
          budget,
          budgetType: budgetType ?? 'total',
          coverEmoji,
          vibes: {
            create: (vibes as string[] ?? []).map((vibe) => ({ vibe })),
          },
        },
        include: { vibes: true },
      })
      return res.status(201).json(trip)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
)

// GET /api/trips/:id
tripsRouter.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: {
        vibes: true,
        days: {
          include: { blocks: { orderBy: { sortOrder: 'asc' } }, photos: { orderBy: { sortOrder: 'asc' } } },
          orderBy: { dayNum: 'asc' },
        },
        reflection: true,
        insights: true,
        checklist: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { upvotes: true } },
      },
    })
    if (!trip) return res.status(404).json({ error: 'Trip not found' })
    return res.json(trip)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /api/trips/:id
tripsRouter.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  const { title, destination, country, startDate, endDate, travelers, budget, budgetType, status, isPublic, rank, coverEmoji, vibes } =
    req.body
  try {
    const trip = await prisma.trip.updateMany({
      where: { id: req.params.id, userId: req.userId },
      data: {
        title,
        destination,
        country,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        travelers,
        budget,
        budgetType,
        status,
        isPublic,
        rank: rank !== undefined ? (rank === null ? null : Number(rank)) : undefined,
        coverEmoji,
      },
    })
    if (trip.count === 0) return res.status(404).json({ error: 'Trip not found' })

    if (vibes) {
      await prisma.tripVibe.deleteMany({ where: { tripId: req.params.id } })
      await prisma.tripVibe.createMany({
        data: (vibes as string[]).map((vibe) => ({ tripId: req.params.id, vibe })),
      })
    }

    const updated = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: { vibes: true },
    })
    return res.json(updated)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /api/trips/:id/community — upsert share visibility
tripsRouter.patch('/:id/community', requireAuth, async (req: AuthRequest, res) => {
  const { isPublic, friendsOnly, isAnonymous } = req.body
  try {
    const trip = await prisma.trip.findFirst({ where: { id: req.params.id, userId: req.userId } })
    if (!trip) return res.status(404).json({ error: 'Trip not found' })
    const updateData: Record<string, unknown> = {}
    if (isPublic !== undefined) updateData.isPublic = Boolean(isPublic)
    if (friendsOnly !== undefined) updateData.friendsOnly = Boolean(friendsOnly)
    if (isAnonymous !== undefined) updateData.isAnonymous = Boolean(isAnonymous)
    const community = await prisma.community.upsert({
      where: { tripId: req.params.id },
      create: { tripId: req.params.id, isPublic: Boolean(isPublic), friendsOnly: Boolean(friendsOnly), isAnonymous: Boolean(isAnonymous), upvotes: 0 },
      update: updateData,
    })
    return res.json(community)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/trips/:id/checklist
tripsRouter.post('/:id/checklist', requireAuth, async (req: AuthRequest, res) => {
  const { label, deadline } = req.body
  if (!label?.trim()) return res.status(400).json({ error: 'label required' })
  try {
    const trip = await prisma.trip.findFirst({ where: { id: req.params.id, userId: req.userId } })
    if (!trip) return res.status(404).json({ error: 'Trip not found' })
    const count = await prisma.checklistItem.count({ where: { tripId: req.params.id } })
    const item = await prisma.checklistItem.create({
      data: { tripId: req.params.id, label: label.trim(), deadline: deadline ?? null, done: false, sortOrder: count },
    })
    return res.status(201).json(item)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /api/trips/:id/checklist/:itemId
tripsRouter.patch('/:id/checklist/:itemId', requireAuth, async (req: AuthRequest, res) => {
  const { done } = req.body
  try {
    const trip = await prisma.trip.findFirst({ where: { id: req.params.id, userId: req.userId } })
    if (!trip) return res.status(404).json({ error: 'Trip not found' })
    const item = await prisma.checklistItem.update({
      where: { id: req.params.itemId },
      data: { done: Boolean(done) },
    })
    return res.json(item)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /api/trips/:id/checklist/:itemId
tripsRouter.delete('/:id/checklist/:itemId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const trip = await prisma.trip.findFirst({ where: { id: req.params.id, userId: req.userId } })
    if (!trip) return res.status(404).json({ error: 'Trip not found' })
    await prisma.checklistItem.delete({ where: { id: req.params.itemId } })
    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /api/trips/:id
tripsRouter.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const result = await prisma.trip.deleteMany({
      where: { id: req.params.id, userId: req.userId },
    })
    if (result.count === 0) return res.status(404).json({ error: 'Trip not found' })
    return res.status(204).send()
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})
