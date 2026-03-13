'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

interface ParsedBlock {
  type: string
  title: string
  detail: string
  price: number | null
  status: string
  confirmationNo: string | null
  time: string | null
}

interface ParsedDay {
  dayNumber: number
  date: string | null
  name: string
  blocks: ParsedBlock[]
}

interface ParsedItinerary {
  destination: string
  startDate: string | null
  endDate: string | null
  totalTravelers: number | null
  estimatedBudget: number | null
  currency: string
  theme: string | null
  vibes: string[]
  days: ParsedDay[]
  confidence: number
  parseNotes: string
}

interface UploadItineraryModalProps {
  onClose: () => void
}

type Step = 'upload' | 'parsing' | 'review' | 'status' | 'saving' | 'done'
type TripStatus = 'ACTIVE' | 'COMPLETED'

export function UploadItineraryModal({ onClose }: UploadItineraryModalProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const token = (session as { accessToken?: string })?.accessToken

  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [parsed, setParsed] = useState<ParsedItinerary | null>(null)
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [showAllDays, setShowAllDays] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<TripStatus | null>(null)

  const handleFile = useCallback((f: File) => {
    setFile(f)
    setFileName(f.name)
    setError('')
  }, [])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleUpload = async () => {
    if (!file) return
    setStep('parsing')
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`${API}/api/itinerary/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await res.json()
      setParsed(data.parsed)
      setFileName(data.fileName)
      setStep('review')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setStep('upload')
    }
  }

  const handleSave = async () => {
    if (!parsed || !selectedStatus) return
    setStep('saving')

    try {
      const res = await fetch(`${API}/api/itinerary/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ parsed, fileName, status: selectedStatus }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Save failed')
      }

      setStep('done')
      const tab = selectedStatus === 'ACTIVE' ? 'Active' : 'Completed'
      setTimeout(() => {
        router.push(`/profile?tab=${tab}`)
        router.refresh()
        onClose()
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setStep('status')
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(10,31,48,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 24
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 560,
        maxHeight: '90vh', overflowY: 'auto', padding: 36, position: 'relative'
      }}>
        {step !== 'review' && step !== 'status' && (
          <button onClick={onClose} style={{
            position: 'absolute', top: 20, right: 20, background: 'none',
            border: 'none', fontSize: 20, color: '#5B7A8E', cursor: 'pointer'
          }}>x</button>
        )}

        {step === 'upload' && (
          <>
            <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: '#C4603A', letterSpacing: 2, marginBottom: 8 }}>IMPORT</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 700, color: '#0A1F30', marginBottom: 8 }}>
              Upload your itinerary
            </div>
            <div style={{ fontSize: 14, color: '#5B7A8E', marginBottom: 28 }}>
              Works with any format — Word, PDF, Excel, Google Doc exports, plain text. Your layout does not need to match anything.
            </div>

            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('itinerary-file-input')?.click()}
              style={{
                border: `2px dashed ${dragOver ? '#C4603A' : file ? '#2E7D4F' : '#D6E4EE'}`,
                borderRadius: 14, padding: '40px 24px', textAlign: 'center',
                cursor: 'pointer', marginBottom: 20, transition: 'all 0.2s',
                background: dragOver ? 'rgba(196,96,58,0.04)' : file ? 'rgba(46,125,79,0.04)' : '#EEF4F8'
              }}
            >
              <input
                id="itinerary-file-input"
                type="file"
                accept=".pdf,.docx,.xlsx,.xls,.txt,.csv"
                style={{ display: 'none' }}
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              {file ? (
                <>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#2E7D4F', marginBottom: 4 }}>{file.name}</div>
                  <div style={{ fontSize: 12, color: '#5B7A8E' }}>Ready to import — click to change file</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#0A1F30', marginBottom: 4 }}>Drop your file here or click to browse</div>
                  <div style={{ fontSize: 12, color: '#5B7A8E' }}>PDF, Word (.docx), Excel (.xlsx), CSV, TXT</div>
                </>
              )}
            </div>

            {error && (
              <div style={{ background: 'rgba(192,64,64,0.08)', border: '1px solid rgba(192,64,64,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#C04040', marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 12,
                background: file ? '#C4603A' : '#D6E4EE',
                color: file ? '#fff' : '#5B7A8E',
                border: 'none', fontSize: 14, fontWeight: 600, cursor: file ? 'pointer' : 'not-allowed'
              }}
            >
              Parse itinerary
            </button>
          </>
        )}

        {step === 'parsing' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{
              width: 40, height: 40, border: '3px solid #D6E4EE',
              borderTopColor: '#C4603A', borderRadius: '50%',
              margin: '0 auto 24px',
              animation: 'spin 0.8s linear infinite'
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#0A1F30', marginBottom: 8 }}>Reading your itinerary...</div>
            <div style={{ fontSize: 13, color: '#5B7A8E' }}>This usually takes 10 to 20 seconds.</div>
          </div>
        )}

        {step === 'review' && parsed && (
          <>
            <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: '#C4603A', letterSpacing: 2, marginBottom: 8 }}>REVIEW</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 700, color: '#0A1F30', marginBottom: 4 }}>
              {parsed.destination}
            </div>
            <div style={{ fontSize: 13, color: '#5B7A8E', marginBottom: 20 }}>
              {parsed.startDate && parsed.endDate ? `${parsed.startDate} – ${parsed.endDate}` : ''}
              {parsed.totalTravelers ? `  ·  ${parsed.totalTravelers} traveler${parsed.totalTravelers > 1 ? 's' : ''}` : ''}
              {parsed.estimatedBudget ? `  ·  $${parsed.estimatedBudget.toLocaleString()} ${parsed.currency}` : ''}
            </div>

            {(showAllDays ? parsed.days : parsed.days.slice(0, 3)).map(day => (
              <div key={day.dayNumber} style={{ marginBottom: 16, borderLeft: '2px solid #D6E4EE', paddingLeft: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0A1F30', marginBottom: 6 }}>
                  Day {day.dayNumber}{day.name ? ` — ${day.name}` : ''}
                </div>
                {day.blocks.slice(0, 3).map((block, i) => (
                  <div key={i} style={{ fontSize: 12, color: '#5B7A8E', marginBottom: 3 }}>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#C4603A', marginRight: 6 }}>{block.type.toUpperCase()}</span>
                    {block.title}
                  </div>
                ))}
                {day.blocks.length > 3 && (
                  <div style={{ fontSize: 11, color: '#5B7A8E' }}>+{day.blocks.length - 3} more blocks</div>
                )}
              </div>
            ))}

            {parsed.days.length > 3 && (
              <button
                onClick={() => setShowAllDays(prev => !prev)}
                style={{
                  background: 'none', border: 'none', padding: '4px 0', marginBottom: 16,
                  fontSize: 12, color: '#C4603A', cursor: 'pointer', textDecoration: 'underline'
                }}
              >
                {showAllDays ? 'Show less' : `+ ${parsed.days.length - 3} more days — click to expand`}
              </button>
            )}

            {parsed.parseNotes && (
              <div style={{ background: '#EEF4F8', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#5B7A8E', marginBottom: 20 }}>
                {parsed.parseNotes}
              </div>
            )}

            <div style={{ height: 1, background: '#D6E4EE', margin: '20px 0' }} />

            <button
              onClick={() => setStep('status')}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 12, marginTop: 20,
                background: '#C4603A', color: '#fff',
                border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer'
              }}
            >
              Looks good — continue
            </button>
          </>
        )}

        {step === 'status' && (
          <>
            <button onClick={() => setStep('review')} style={{
              position: 'absolute', top: 20, left: 20, background: 'none',
              border: 'none', fontSize: 13, color: '#5B7A8E', cursor: 'pointer', padding: 0
            }}>← Back</button>
            <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: '#C4603A', letterSpacing: 2, marginBottom: 8 }}>IMPORT</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 700, color: '#0A1F30', marginBottom: 8 }}>
              Is this trip active or completed?
            </div>
            <div style={{ fontSize: 14, color: '#5B7A8E', marginBottom: 28 }}>
              This determines where it appears on your profile.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
              {(['ACTIVE', 'COMPLETED'] as TripStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedStatus(s)}
                  style={{
                    padding: '18px 20px', borderRadius: 14, textAlign: 'left', cursor: 'pointer',
                    border: `2px solid ${selectedStatus === s ? '#C4603A' : '#D6E4EE'}`,
                    background: selectedStatus === s ? 'rgba(196,96,58,0.06)' : '#EEF4F8',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0A1F30', marginBottom: 3 }}>
                    {s === 'ACTIVE' ? 'Active' : 'Completed'}
                  </div>
                  <div style={{ fontSize: 12, color: '#5B7A8E' }}>
                    {s === 'ACTIVE' ? 'Trip is upcoming or in progress — appears in your Active tab' : 'Trip has already happened — appears in your Completed tab'}
                  </div>
                </button>
              ))}
            </div>

            {error && (
              <div style={{ background: 'rgba(192,64,64,0.08)', border: '1px solid rgba(192,64,64,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#C04040', marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={!selectedStatus}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 12,
                background: selectedStatus ? '#C4603A' : '#D6E4EE',
                color: selectedStatus ? '#fff' : '#5B7A8E',
                border: 'none', fontSize: 14, fontWeight: 600, cursor: selectedStatus ? 'pointer' : 'not-allowed'
              }}
            >
              Save to my trips
            </button>
          </>
        )}

        {step === 'saving' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{
              width: 40, height: 40, border: '3px solid #D6E4EE',
              borderTopColor: '#C4603A', borderRadius: '50%',
              margin: '0 auto 24px',
              animation: 'spin 0.8s linear infinite'
            }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: '#0A1F30', marginBottom: 8 }}>Saving your trip...</div>
          </div>
        )}

        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#2E7D4F', marginBottom: 8 }}>Saved to your profile.</div>
          </div>
        )}
      </div>
    </div>
  )
}
