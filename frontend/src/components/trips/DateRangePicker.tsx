'use client'

import { useState, useRef, useEffect } from 'react'

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function toDateStr(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseLocal(s: string): Date {
  return new Date(s + 'T00:00:00')
}

function formatDisplay(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

interface Props {
  startDate: string
  endDate: string
  onChange: (start: string, end: string) => void
}

function MonthGrid({
  year,
  month,
  start,
  end,
  hoverDate,
  selecting,
  onDayClick,
  onDayHover,
}: {
  year: number
  month: number
  start: Date | null
  end: Date | null
  hoverDate: Date | null
  selecting: 'start' | 'end'
  onDayClick: (d: Date) => void
  onDayHover: (d: Date | null) => void
}) {
  const today = new Date()
  const monthName = new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
  const firstDay = firstDayOfMonth(year, month)
  const numDays = daysInMonth(year, month)
  const effectiveEnd = selecting === 'end' && hoverDate ? hoverDate : end

  function isStart(d: Date) { return start ? isSameDay(d, start) : false }
  function isEnd(d: Date) { return effectiveEnd ? isSameDay(d, effectiveEnd) : false }
  function inRange(d: Date) {
    if (!start || !effectiveEnd) return false
    const lo = start < effectiveEnd ? start : effectiveEnd
    const hi = start < effectiveEnd ? effectiveEnd : start
    return d > lo && d < hi
  }

  const blanks = Array(firstDay).fill(null)
  const days: (Date | null)[] = [
    ...blanks,
    ...Array.from({ length: numDays }, (_, i) => new Date(year, month, i + 1)),
  ]

  return (
    <div className="flex-1 min-w-0">
      <div className="text-center text-sm font-semibold text-ink mb-3">{monthName}</div>
      <div className="grid grid-cols-7 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-[10px] text-slate/50 py-1.5 font-medium uppercase tracking-wide">
            {d}
          </div>
        ))}
        {days.map((date, i) => {
          if (!date) return <div key={`b-${i}`} />
          const _start = isStart(date)
          const _end = isEnd(date)
          const _range = inRange(date)
          const _today = isSameDay(date, today)

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onDayClick(date)}
              onMouseEnter={() => onDayHover(date)}
              onMouseLeave={() => onDayHover(null)}
              className={[
                'relative h-9 w-full text-xs font-medium transition-all select-none',
                _start || _end
                  ? 'bg-terra text-white rounded-full font-bold shadow-sm z-10'
                  : _range
                  ? 'bg-terra/12 text-ink rounded-none'
                  : 'text-ink hover:bg-terra/10 rounded-full hover:text-terra',
                _today && !_start && !_end ? 'ring-1 ring-terra/40 rounded-full' : '',
              ].join(' ').trim()}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function DateRangePicker({ startDate, endDate, onChange }: Props) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [open, setOpen] = useState(false)
  const [hoverDate, setHoverDate] = useState<Date | null>(null)
  const [selecting, setSelecting] = useState<'start' | 'end'>('start')
  const ref = useRef<HTMLDivElement>(null)

  const start = startDate ? parseLocal(startDate) : null
  const end = endDate ? parseLocal(endDate) : null

  const totalNights =
    start && end ? Math.round((end.getTime() - start.getTime()) / 86400000) : null

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  function handleDayClick(date: Date) {
    if (selecting === 'start' || !start || date < start) {
      onChange(toDateStr(date), '')
      setSelecting('end')
    } else {
      onChange(startDate, toDateStr(date))
      setSelecting('start')
      setOpen(false)
    }
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  const nextMonthNum = viewMonth === 11 ? 0 : viewMonth + 1
  const nextYearNum = viewMonth === 11 ? viewYear + 1 : viewYear

  const displayText =
    start && end
      ? `${formatDisplay(start)} – ${formatDisplay(end)}${totalNights ? ` · ${totalNights} nights` : ''}`
      : start
      ? `${formatDisplay(start)} – pick return date`
      : 'Select date range'

  return (
    <div className="relative" ref={ref}>
      {/* Trigger field */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          'w-full border rounded-xl px-4 py-3 text-sm text-left bg-white flex items-center justify-between gap-3 transition-colors',
          open ? 'border-terra ring-1 ring-terra/30' : 'border-mist hover:border-slate/40',
        ].join(' ')}
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className={start ? 'text-ink' : 'text-slate/40'}>{displayText}</span>
        </div>
        {(start || end) && (
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onChange('', ''); setSelecting('start') }}
            className="text-xs text-slate/50 hover:text-terra transition-colors"
          >
            ✕
          </span>
        )}
      </button>

      {/* Dropdown calendar */}
      {open && (
        <div className="absolute z-50 top-full left-0 mt-2 bg-white border border-mist rounded-2xl shadow-xl overflow-hidden w-[calc(100vw-2rem)] sm:w-max max-w-[calc(100vw-2rem)]">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 px-4 py-3 border-b border-mist bg-foam/40 text-sm">
            <div>
              <span className="text-[10px] text-slate/50 uppercase tracking-wide font-medium block mb-0.5">Departure</span>
              <span className={start ? 'text-ink font-semibold' : 'text-slate/40'}>
                {start ? formatDisplay(start) : 'Pick a date'}
              </span>
            </div>
            <span className="text-mist">→</span>
            <div>
              <span className="text-[10px] text-slate/50 uppercase tracking-wide font-medium block mb-0.5">Return</span>
              <span className={end ? 'text-ink font-semibold' : 'text-slate/40'}>
                {end ? formatDisplay(end) : 'Pick a date'}
              </span>
            </div>
            {totalNights !== null && totalNights > 0 && (
              <span className="ml-auto text-xs font-semibold text-terra bg-terra/10 px-2.5 py-1 rounded-full">
                {totalNights} {totalNights === 1 ? 'night' : 'nights'}
              </span>
            )}
          </div>

          {/* Calendar grids */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <button type="button" onClick={prevMonth}
                className="p-2 hover:bg-foam rounded-lg text-slate hover:text-ink transition-colors leading-none">
                ‹
              </button>
              <div className="flex gap-6 flex-1">
                <MonthGrid year={viewYear} month={viewMonth} start={start} end={end}
                  hoverDate={hoverDate} selecting={selecting}
                  onDayClick={handleDayClick} onDayHover={setHoverDate} />
                <div className="hidden sm:block w-px bg-mist self-stretch" />
                <div className="hidden sm:block flex-1 min-w-0">
                  <MonthGrid year={nextYearNum} month={nextMonthNum} start={start} end={end}
                    hoverDate={hoverDate} selecting={selecting}
                    onDayClick={handleDayClick} onDayHover={setHoverDate} />
                </div>
              </div>
              <button type="button" onClick={nextMonth}
                className="p-2 hover:bg-foam rounded-lg text-slate hover:text-ink transition-colors leading-none">
                ›
              </button>
            </div>

            <div className="text-xs text-slate/60 text-center pt-3 border-t border-mist">
              {selecting === 'end' && start ? 'Now click your return date' : 'Click your departure date'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
