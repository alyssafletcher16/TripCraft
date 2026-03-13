'use client'

import { useState } from 'react'
import type { Trip } from '@/types'

const CHANGE_OPTIONS = [
  "Different hotel",
  "Fewer activities",
  "More downtime",
  "Different season",
  "Nothing — I'd repeat it exactly",
]
const REBOOK_OPTIONS = ["Absolutely", "Probably", "Only if cheaper", "No"]
const EXPECT_OPTIONS = [
  "Better than expected",
  "Exactly what I imagined",
  "Slightly disappointing",
  "Not what I hoped for",
]
const RANK_LABELS = [
  "Worst trip I've taken",
  "Solid but not top-tier",
  "One of my favorites",
  "Top 3 of my life",
]
const STEPS = [
  { q: "Where does this trip rank for you?",         n: "Big Picture"       },
  { q: "Did this trip match what you expected?",     n: "Expectation"       },
  { q: "What would you tell future-you about this trip?", n: "Future-You Note" },
  { q: "If you could redo this trip, what would you swap?", n: "What to Change" },
  { q: "What was the best decision you made?",       n: "Best Decision"     },
  { q: "Anything you'd skip next time?",             n: "Skip Next Time"    },
  { q: "Would you rebook these experiences?",        n: "Experience Ratings" },
  { q: "Give this trip a title",                     n: "Title & Photos"    },
]

interface Props {
  trip: Trip
  accessToken?: string
  onClose: () => void
  onSaved: () => void
}

export function ReflectionModal({ trip, accessToken, onClose, onSaved }: Props) {
  const existing = trip.reflection
  const [step, setStep] = useState(0)
  const [rank, setRank] = useState(existing?.rank ?? 50)
  const [expect, setExpect] = useState<string | null>(existing?.expectation ?? null)
  const [sentence, setSentence] = useState(existing?.sentence ?? '')
  const [change, setChange] = useState<string[]>(existing?.changes ?? [])
  const [changeCustom, setChangeCustom] = useState('')
  const [bestDecision, setBestDecision] = useState(existing?.bestDecision ?? '')
  const [regret, setRegret] = useState(existing?.regret ?? '')
  const [rebook, setRebook] = useState<Record<string, string>>(
    (existing?.rebook as Record<string, string>) ?? {}
  )
  const [title, setTitle] = useState(existing?.tripTitle ?? '')
  const [saving, setSaving] = useState(false)

  // Bookable blocks from real trip data (STAY + ACTIVITY only, up to 6)
  const rebookBlocks = trip.days
    .flatMap((d) => d.blocks)
    .filter((b) => b.type === 'STAY' || b.type === 'ACTIVITY')
    .map((b) => b.title)
    .slice(0, 6)

  const getRankLabel = (v: number) =>
    v < 25 ? RANK_LABELS[0] : v < 50 ? RANK_LABELS[1] : v < 75 ? RANK_LABELS[2] : RANK_LABELS[3]

  const canNext = () => {
    if (step === 1 && !expect) return false
    return true
  }

  async function handleSave() {
    setSaving(true)
    const allChanges = [...change, ...(changeCustom.trim() ? [changeCustom.trim()] : [])]
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/trips/${trip.id}/reflection`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            rank,
            expectation: expect,
            sentence,
            changes: allChanges,
            bestDecision,
            regret,
            rebook,
            tripTitle: title,
          }),
        }
      )
      onSaved()
    } catch {
      // ignore network errors silently — user can retry
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[1000] bg-[rgba(7,24,37,0.82)] backdrop-blur-[5px] flex items-center justify-center p-3 sm:p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface rounded-[24px] w-full max-w-[620px] max-h-[92vh] overflow-hidden flex flex-col shadow-[0_48px_96px_rgba(0,0,0,0.5)] border border-white/[0.08]">

        {/* ── Header ── */}
        <div className="flex items-start justify-between px-4 sm:px-7 py-4 sm:py-5 border-b border-mist">
          <div>
            <div className="font-serif text-xl font-bold text-ink">
              Trip Reflection — {trip.destination}
            </div>
            {/* Step pills */}
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {STEPS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-[0.5px] transition-colors"
                  style={{
                    background: i === step ? '#C4603A' : i < step ? '#0D2B45' : '#D6E4EE',
                    color: i <= step ? '#fff' : '#5B7A8E',
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate hover:text-ink text-lg leading-none ml-4 mt-0.5"
          >
            ✕
          </button>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1 px-4 sm:px-7 py-5 sm:py-7">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-5">
            <span className="bg-ocean text-white font-mono text-[10px] px-2.5 py-0.5 rounded-full tracking-[1px]">
              {step + 1} of {STEPS.length}
            </span>
            <span className="text-[12px] text-slate font-mono tracking-[1px] uppercase">
              {STEPS[step].n}
            </span>
          </div>

          <div className="font-serif text-[26px] font-bold text-ink mb-5 leading-tight">
            {STEPS[step].q}
          </div>

          {/* STEP 0: Ranking slider */}
          {step === 0 && (
            <div>
              <div className="font-serif text-2xl font-bold text-terra text-center mb-3">
                {getRankLabel(rank)}
              </div>
              <div className="relative my-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={rank}
                  onChange={(e) => setRank(+e.target.value)}
                  className="reflect-slider"
                />
                <div className="flex justify-between text-[10px] text-slate font-mono mt-1.5">
                  <span>Worst ever</span>
                  <span>Solid</span>
                  <span>Favorite</span>
                  <span>Top 3</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Expectation */}
          {step === 1 && (
            <div className="flex flex-col gap-2.5">
              {EXPECT_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setExpect(opt)}
                  className="px-5 py-3.5 rounded-2xl border text-left text-sm transition-all"
                  style={{
                    borderColor: expect === opt ? '#C4603A' : '#D6E4EE',
                    background: expect === opt ? 'rgba(196,96,58,0.06)' : '#fff',
                    color: expect === opt ? '#C4603A' : '#0A1F30',
                    fontWeight: expect === opt ? 600 : 400,
                  }}
                >
                  {expect === opt ? '✓ ' : ''}{opt}
                </button>
              ))}
            </div>
          )}

          {/* STEP 2: Future-you note */}
          {step === 2 && (
            <>
              <textarea
                value={sentence}
                onChange={(e) => setSentence(e.target.value)}
                placeholder={`e.g. "Worth it for the views — skip the breakfast." or "Book the early tour, not the afternoon."`}
                className="w-full min-h-[120px] px-4 py-3.5 rounded-2xl border border-mist bg-foam text-sm text-ink outline-none resize-y leading-relaxed focus:border-terra"
              />
              <p className="text-[11px] text-slate mt-2 italic">
                This becomes a personal note visible only to you — and anonymized insight for future travelers.
              </p>
            </>
          )}

          {/* STEP 3: What to change */}
          {step === 3 && (
            <>
              <div className="flex flex-wrap gap-2 mb-3.5">
                {CHANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() =>
                      setChange((p) =>
                        p.includes(opt) ? p.filter((x) => x !== opt) : [...p, opt]
                      )
                    }
                    className="px-4 py-2 rounded-full border text-sm transition-all"
                    style={{
                      borderColor: change.includes(opt) ? '#0D2B45' : '#D6E4EE',
                      background: change.includes(opt) ? '#0D2B45' : '#fff',
                      color: change.includes(opt) ? '#fff' : '#0A1F30',
                    }}
                  >
                    {change.includes(opt) ? '✓ ' : ''}{opt}
                  </button>
                ))}
              </div>
              <input
                value={changeCustom}
                onChange={(e) => setChangeCustom(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-mist bg-foam text-sm text-ink outline-none focus:border-terra"
                placeholder="Or describe in your own words..."
              />
            </>
          )}

          {/* STEP 4: Best decision */}
          {step === 4 && (
            <textarea
              value={bestDecision}
              onChange={(e) => setBestDecision(e.target.value)}
              placeholder={`e.g. "Booking the small-group tour instead of the big bus." or "Staying in the old town center."`}
              className="w-full min-h-[100px] px-4 py-3.5 rounded-2xl border border-mist bg-foam text-sm text-ink outline-none resize-y leading-relaxed focus:border-terra"
            />
          )}

          {/* STEP 5: Skip next time */}
          {step === 5 && (
            <textarea
              value={regret}
              onChange={(e) => setRegret(e.target.value)}
              placeholder={`e.g. "The 3-hour boat tour — rough seas and not worth the price." Keep it casual.`}
              className="w-full min-h-[100px] px-4 py-3.5 rounded-2xl border border-mist bg-foam text-sm text-ink outline-none resize-y leading-relaxed focus:border-terra"
            />
          )}

          {/* STEP 6: Rebook ratings */}
          {step === 6 && (
            <div className="flex flex-col gap-3">
              {(rebookBlocks.length > 0 ? rebookBlocks : ['Your top experience']).map((b) => (
                <div key={b} className="bg-white rounded-2xl border border-mist px-4 py-3.5">
                  <div className="text-sm font-medium text-ink mb-2.5">{b}</div>
                  <div className="flex gap-2 flex-wrap">
                    {REBOOK_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setRebook((p) => ({ ...p, [b]: opt }))}
                        className="px-3.5 py-1.5 rounded-full border text-[12px] transition-all"
                        style={{
                          borderColor: rebook[b] === opt ? '#0D2B45' : '#D6E4EE',
                          background: rebook[b] === opt ? '#0D2B45' : '#fff',
                          color: rebook[b] === opt ? '#fff' : '#5B7A8E',
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 7: Title + photos */}
          {step === 7 && (
            <>
              <div className="mb-4">
                <label className="block text-slate text-[10px] font-mono uppercase tracking-wider mb-1.5">
                  Trip title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-mist bg-foam text-sm text-ink outline-none focus:border-terra"
                  placeholder={`e.g. "September Sicily Food Sprint" or "The Trip That Changed Everything"`}
                />
                <p className="text-[11px] text-slate mt-1.5 italic">
                  A great title makes it easier to find, share, and feel proud of.
                </p>
              </div>

              <div className="mb-5">
                <label className="block text-slate text-[10px] font-mono uppercase tracking-wider mb-1.5">
                  Add photos from your trip
                </label>
                <div className="flex gap-2.5 flex-wrap">
                  {['🌅', '🏛', '🍝', '🌊'].map((p, i) => (
                    <div
                      key={i}
                      className="w-20 h-16 rounded-xl bg-foam border-2 border-mist flex items-center justify-center text-3xl cursor-pointer"
                    >
                      {p}
                    </div>
                  ))}
                  <button className="w-20 h-16 rounded-xl border-[1.5px] border-dashed border-mist flex flex-col items-center justify-center gap-1 text-slate text-[11px] hover:border-terra/40 transition-colors">
                    <span className="text-xl">+</span>Upload
                  </button>
                </div>
              </div>

              {/* Gold summary preview */}
              <div className="p-4 rounded-xl bg-gold/[0.08] border border-gold/20">
                <div className="text-[13px] font-semibold text-ink mb-1.5">Your reflection summary</div>
                <div className="text-[12px] text-slate leading-relaxed space-y-0.5">
                  <div>🏆 Ranked: <strong className="text-terra">{getRankLabel(rank)}</strong></div>
                  {expect && <div>💭 Expectation: <strong>{expect}</strong></div>}
                  {sentence && (
                    <div>
                      📝 Note: <em>"{sentence.slice(0, 60)}{sentence.length > 60 ? '...' : ''}"</em>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Nav footer ── */}
        <div className="flex justify-between items-center px-4 sm:px-7 py-4 sm:py-5 border-t border-mist">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="px-5 py-2.5 rounded-full border border-mist text-sm text-slate disabled:opacity-40 hover:enabled:border-slate/40 transition-colors"
          >
            ← Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => canNext() && setStep((s) => s + 1)}
              disabled={!canNext()}
              className="px-7 py-2.5 rounded-full text-sm font-semibold transition-all disabled:cursor-not-allowed"
              style={{
                background: canNext() ? '#C4603A' : '#D6E4EE',
                color: canNext() ? '#fff' : '#5B7A8E',
              }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-7 py-2.5 rounded-full bg-ocean text-white text-sm font-semibold hover:bg-tide transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save reflection ✓'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
