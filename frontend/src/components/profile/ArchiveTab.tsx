'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

interface ParsedTrip {
  title: string
  destination: string
  country?: string
  startDate?: string
  endDate?: string
  budget?: number
  travelers?: number
  notes?: string
}

interface ArchivedTrip {
  id: string
  title: string
  destination: string
  country: string | null
  startDate: string | null
  endDate: string | null
  budget: number | null
  travelers: number
  coverEmoji: string | null
  status: string
}

type Stage = 'idle' | 'uploading' | 'preview' | 'saving'

function formatDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function tripDateRange(t: { startDate: string | null; endDate: string | null }) {
  const s = formatDate(t.startDate)
  const e = formatDate(t.endDate)
  if (s && e && s !== e) return `${s} – ${e}`
  return s ?? e ?? null
}

// ── Upload Zone ───────────────────────────────────────────────────────────────
function UploadZone({ onFile, disabled }: { onFile: (f: File) => void; disabled: boolean }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }, [onFile])

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-2xl p-6 md:p-10 text-center cursor-pointer transition-all select-none
        ${dragging ? 'border-ocean bg-ocean/5' : 'border-mist hover:border-ocean/50 hover:bg-foam/40'}
        ${disabled ? 'opacity-50 cursor-default' : ''}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv,.pdf,.docx"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
          e.target.value = ''
        }}
      />
      <div className="text-4xl mb-3">📂</div>
      <p className="font-medium text-ink mb-1">Drop your trip file here</p>
      <p className="text-slate text-sm">Excel (.xlsx, .xls), CSV, PDF, or Word (.docx)</p>
      <p className="text-xs text-slate/70 mt-2">Up to 15 MB</p>
      <div className="mt-5 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-ocean text-white text-sm font-medium">
        Browse file
      </div>
    </div>
  )
}


// ── Preview card ──────────────────────────────────────────────────────────────
function PreviewCard({
  trip, index, onChange, onRemove,
}: {
  trip: ParsedTrip
  index: number
  onChange: (i: number, field: keyof ParsedTrip, val: string) => void
  onRemove: (i: number) => void
}) {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <input
            className="w-full font-serif font-bold text-ink text-base bg-transparent border-b border-transparent hover:border-mist focus:border-ocean focus:outline-none pb-0.5 transition-colors"
            value={trip.title}
            onChange={(e) => onChange(index, 'title', e.target.value)}
          />
        </div>
        <button onClick={() => onRemove(index)} className="text-slate hover:text-danger text-lg leading-none mt-0.5 flex-shrink-0">×</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <Field label="Destination" value={trip.destination} onChange={(v) => onChange(index, 'destination', v)} />
        <Field label="Country" value={trip.country ?? ''} onChange={(v) => onChange(index, 'country', v)} placeholder="optional" />
        <Field label="Start date" value={trip.startDate ?? ''} onChange={(v) => onChange(index, 'startDate', v)} placeholder="YYYY-MM-DD" />
        <Field label="End date" value={trip.endDate ?? ''} onChange={(v) => onChange(index, 'endDate', v)} placeholder="YYYY-MM-DD" />
        <Field label="Budget ($)" value={trip.budget != null ? String(trip.budget) : ''} onChange={(v) => onChange(index, 'budget', v)} placeholder="optional" />
        <Field label="Travelers" value={trip.travelers != null ? String(trip.travelers) : ''} onChange={(v) => onChange(index, 'travelers', v)} placeholder="optional" />
      </div>

      {trip.notes && (
        <p className="text-xs text-slate bg-foam/60 rounded-lg px-3 py-2">{trip.notes}</p>
      )}
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-slate/70 font-medium">{label}</span>
      <input
        className="bg-foam/40 border border-mist rounded-lg px-2 py-2 text-xs text-ink focus:outline-none focus:border-ocean transition-colors"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

// ── Archived trip row ─────────────────────────────────────────────────────────
function ArchivedRow({ trip }: { trip: ArchivedTrip }) {
  const range = tripDateRange(trip)
  return (
    <div className="card px-4 py-3 sm:px-5 sm:py-4 flex items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow">
      <div className="text-xl sm:text-2xl w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-foam flex items-center justify-center flex-shrink-0">
        {trip.coverEmoji ?? '✈️'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-ink text-sm truncate">{trip.title}</p>
        <p className="text-slate text-xs truncate">
          {trip.destination}{trip.country ? `, ${trip.country}` : ''}
          {range ? <span className="ml-2 opacity-60">{range}</span> : null}
        </p>
        {trip.budget ? (
          <span className="text-xs text-slate font-mono sm:hidden">${trip.budget.toLocaleString()}</span>
        ) : null}
      </div>
      {trip.budget ? (
        <span className="hidden sm:inline text-xs text-slate font-mono flex-shrink-0">${trip.budget.toLocaleString()}</span>
      ) : null}
      <span className="px-2 py-0.5 rounded-full bg-green/10 text-green text-xs font-medium flex-shrink-0">Done</span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function ArchiveTab() {
  const { data: session } = useSession()
  const token = (session as { accessToken?: string })?.accessToken

  const [stage, setStage] = useState<Stage>('idle')
  const [parsedTrips, setParsedTrips] = useState<ParsedTrip[]>([])
  const [archivedTrips, setArchivedTrips] = useState<ArchivedTrip[]>([])
  const [error, setError] = useState<string | null>(null)

  // Load completed trips
  useEffect(() => {
    if (!token) return
    fetch(`${API}/api/trips`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        const all: ArchivedTrip[] = Array.isArray(data) ? data : data.trips ?? []
        setArchivedTrips(all.filter((t) => t.status === 'COMPLETED').sort((a, b) => {
          const da = a.endDate ?? a.startDate ?? ''
          const db = b.endDate ?? b.startDate ?? ''
          return db.localeCompare(da)
        }))
      })
      .catch(() => {})
  }, [token])

  const handleFile = useCallback(async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!['xlsx', 'xls', 'csv', 'pdf', 'docx'].includes(ext)) {
      setError('Please upload an Excel (.xlsx, .xls), CSV, PDF, or Word (.docx) file.')
      return
    }
    setError(null)
    setStage('uploading')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`${API}/api/trips/import`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (!res.ok) throw new Error('parse failed')
      const data = await res.json()
      if (!data.trips?.length) throw new Error('No trips found in file')
      setParsedTrips(data.trips)
      setStage('preview')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to read file. Check the format and try again.')
      setStage('idle')
    }
  }, [token])

  const handleFieldChange = (i: number, field: keyof ParsedTrip, val: string) => {
    setParsedTrips((prev) => prev.map((t, idx) => idx === i ? { ...t, [field]: val || undefined } : t))
  }

  const handleRemove = (i: number) => {
    setParsedTrips((prev) => prev.filter((_, idx) => idx !== i))
  }

  const handleConfirm = async () => {
    if (!parsedTrips.length) return
    setStage('saving')
    try {
      const res = await fetch(`${API}/api/trips/import/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ trips: parsedTrips }),
      })
      if (!res.ok) throw new Error('save failed')
      const data = await res.json()
      const newTrips: ArchivedTrip[] = data.trips ?? []
      setArchivedTrips((prev) => [...newTrips, ...prev])
      setParsedTrips([])
      setStage('idle')
    } catch {
      setError('Failed to save trips. Please try again.')
      setStage('preview')
    }
  }

  const handleCancel = () => {
    setParsedTrips([])
    setError(null)
    setStage('idle')
  }

  return (
    <div className="p-4 sm:p-8 md:p-12 max-w-3xl">
      <p className="eyebrow mb-2">Trip Archive</p>
      <h2 className="font-serif text-2xl md:text-3xl font-bold text-ink mb-2">Your journey</h2>
      <p className="text-slate text-sm mb-6 md:mb-8">Upload an old trip spreadsheet or PDF to import it into TripCraft.</p>

      {/* ── Upload or Preview ── */}
      {stage === 'idle' && (
        <>
          <p className="text-sm font-semibold text-ink mb-3">Import itinerary</p>
          <UploadZone onFile={handleFile} disabled={false} />
        </>
      )}

      {stage === 'uploading' && (
        <div className="card p-10 flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-ocean border-t-transparent rounded-full animate-spin" />
          <p className="text-slate text-sm">Reading your file…</p>
        </div>
      )}

      {stage === 'preview' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-ink">{parsedTrips.length} trip{parsedTrips.length !== 1 ? 's' : ''} found — review before importing</p>
            <button onClick={handleCancel} className="text-xs text-slate hover:text-ink underline">Cancel</button>
          </div>
          <div className="flex flex-col gap-3 mb-6">
            {parsedTrips.map((t, i) => (
              <PreviewCard key={i} trip={t} index={i} onChange={handleFieldChange} onRemove={handleRemove} />
            ))}
          </div>
          {parsedTrips.length === 0 ? (
            <p className="text-slate text-sm text-center py-4">All trips removed. <button onClick={handleCancel} className="underline">Start over</button></p>
          ) : (
            <button
              onClick={handleConfirm}
              className="btn-primary w-full py-3 rounded-xl font-semibold"
            >
              Import {parsedTrips.length} trip{parsedTrips.length !== 1 ? 's' : ''} to archive
            </button>
          )}
        </div>
      )}

      {stage === 'saving' && (
        <div className="card p-10 flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-ocean border-t-transparent rounded-full animate-spin" />
          <p className="text-slate text-sm">Saving trips…</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
          {error}
        </div>
      )}

      {/* ── Archived trips list ── */}
      {archivedTrips.length > 0 && stage === 'idle' && (
        <div className="mt-8 md:mt-12">
          <p className="font-semibold text-ink mb-4">{archivedTrips.length} archived trip{archivedTrips.length !== 1 ? 's' : ''}</p>
          <div className="flex flex-col gap-3">
            {archivedTrips.map((t) => (
              <ArchivedRow key={t.id} trip={t} />
            ))}
          </div>
        </div>
      )}

      {archivedTrips.length === 0 && stage === 'idle' && (
        <div className="mt-10 text-center text-slate text-sm opacity-60">
          No archived trips yet — import one above.
        </div>
      )}
    </div>
  )
}
