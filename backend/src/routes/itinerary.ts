import { Router, Response } from 'express'
import multer from 'multer'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { extractText } from '../lib/extractText'
import { parseItinerary, ParsedBlock } from '../lib/parseItinerary'
import { BlockType, BookingStatus } from '@prisma/client'

export const itineraryRouter = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } })

function mapBlockType(type: string): BlockType {
  switch (type) {
    case 'flight': return BlockType.TRANSPORT
    case 'hotel': return BlockType.STAY
    case 'activity': return BlockType.ACTIVITY
    case 'food': return BlockType.FOOD
    default: return BlockType.NOTE
  }
}

function mapBookingStatus(status: string): BookingStatus {
  return status === 'booked' ? BookingStatus.BOOKED : BookingStatus.PENDING
}

// POST /api/itinerary/upload
// Extracts text from file, sends to Claude, returns parsed JSON for user review
itineraryRouter.post('/upload', requireAuth, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' })

    const rawText = await extractText(req.file.buffer, req.file.originalname)

    if (!rawText || rawText.trim().length < 50) {
      return res.status(422).json({ error: 'Could not extract readable text from this file' })
    }

    const parsed = await parseItinerary(rawText, req.file.originalname)

    return res.json({
      parsed,
      fileName: req.file.originalname,
      rawTextLength: rawText.length
    })
  } catch (err) {
    console.error('Upload parse error:', err)
    return res.status(500).json({ error: 'Failed to parse itinerary' })
  }
})

// POST /api/itinerary/save
// Saves the confirmed parsed itinerary to the database, always private.
// Status is auto-assigned: COMPLETED if start date is in the past, PLANNING otherwise.
itineraryRouter.post('/save', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { parsed, fileName } = req.body
    const userId = req.userId!

    const status = parsed.startDate && new Date(parsed.startDate) < new Date()
      ? 'COMPLETED'
      : 'PLANNING'

    const trip = await prisma.trip.create({
      data: {
        userId,
        title: parsed.destination,
        destination: parsed.destination,
        startDate: parsed.startDate ? new Date(parsed.startDate) : null,
        endDate: parsed.endDate ? new Date(parsed.endDate) : null,
        travelers: parsed.totalTravelers ?? 1,
        budget: parsed.estimatedBudget ?? null,
        status,
        isPublic: false,
        vibes: parsed.vibes?.length
          ? { create: [...new Set<string>(parsed.vibes.map((v: string) => v.toLowerCase()))].map(vibe => ({ vibe })) }
          : undefined,
        days: {
          create: parsed.days
            .filter((day: any, idx: number, arr: any[]) => arr.findIndex(d => d.dayNumber === day.dayNumber) === idx)
            .map((day: any) => ({
              dayNum: day.dayNumber,
              name: day.name || `Day ${day.dayNumber}`,
              date: day.date ? new Date(day.date) : null,
              blocks: {
                create: day.blocks.map((block: ParsedBlock) => ({
                  type: mapBlockType(block.type),
                  title: block.title,
                  detail: block.detail || '',
                  priceValue: block.price,
                  price: block.price != null ? `$${block.price}` : null,
                  status: mapBookingStatus(block.status),
                  confCode: block.confirmationNo,
                }))
              }
            }))
        },
        community: {
          create: { isPublic: false, friendsOnly: false, upvotes: 0 }
        },
        itineraryImport: {
          create: {
            fileName,
            sourceFormat: fileName.split('.').pop() || 'unknown',
            confidence: parsed.confidence,
            parseNotes: parsed.parseNotes || ''
          }
        }
      },
      include: { days: { include: { blocks: true } }, community: true, itineraryImport: true }
    })

    return res.status(201).json({ tripId: trip.id, trip })
  } catch (err) {
    console.error('Save error:', err)
    return res.status(500).json({ error: 'Failed to save itinerary' })
  }
})

// GET /api/itinerary/:tripId/import
// Returns import metadata for a trip (used on profile to show source badge)
itineraryRouter.get('/:tripId/import', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const importData = await prisma.itineraryImport.findUnique({
      where: { tripId: req.params.tripId }
    })
    return res.json(importData)
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch import data' })
  }
})
