'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
export interface MapCluster {
  x: number
  y: number
  count: number
  label: string
  zoom: string
  region: string
  itins?: number[]
}

interface Props {
  onCitySelect: (city: MapCluster | null) => void
  selectedCity: MapCluster | null
}

// ── Data ──────────────────────────────────────────────────────────────────────
// Simplified continent outline path (same as prototype)
const CONT = `M 60,95 L 75,80 L 90,78 L 105,82 L 120,75 L 135,78 L 145,90 L 148,105 L 140,118 L 125,125 L 108,128 L 90,125 L 72,118 Z M 160,65 L 175,58 L 195,55 L 210,58 L 225,52 L 240,55 L 255,60 L 265,68 L 270,80 L 268,95 L 260,108 L 245,115 L 225,118 L 205,115 L 188,108 L 172,98 L 162,85 Z M 265,108 L 278,105 L 290,110 L 295,120 L 292,132 L 280,138 L 268,132 L 263,120 Z M 285,55 L 300,48 L 318,45 L 338,48 L 355,52 L 370,58 L 382,68 L 388,80 L 385,95 L 375,108 L 358,115 L 338,118 L 315,115 L 298,105 L 287,92 L 283,78 Z M 390,60 L 402,55 L 418,52 L 432,55 L 445,62 L 452,72 L 448,85 L 438,95 L 422,100 L 405,98 L 393,88 L 388,75 Z M 430,95 L 442,92 L 455,98 L 462,110 L 458,125 L 445,132 L 432,128 L 425,115 Z`

const CLUSTERS: MapCluster[] = [
  { x: 105, y: 100, count: 248, label: 'Americas',  zoom: 'out',      region: 'americas' },
  { x: 215, y:  82, count: 512, label: 'Europe',    zoom: 'out',      region: 'europe'   },
  { x: 340, y:  78, count: 381, label: 'Asia',      zoom: 'out',      region: 'asia'     },
  { x: 158, y: 135, count:  87, label: 'S. America',zoom: 'out',      region: 'sameric', itins: [2, 5] },
  { x: 248, y: 145, count:  62, label: 'Africa',    zoom: 'out',      region: 'africa',  itins: [1, 4] },
  { x: 195, y:  88, count:  89, label: 'Lisbon',    zoom: 'europe',   region: 'europe',  itins: [4] },
  { x: 210, y:  78, count: 124, label: 'Paris',     zoom: 'europe',   region: 'europe',  itins: [0, 4] },
  { x: 225, y:  82, count:  98, label: 'Rome',      zoom: 'europe',   region: 'europe',  itins: [0] },
  { x: 238, y:  70, count:  67, label: 'Prague',    zoom: 'europe',   region: 'europe',  itins: [0, 4] },
  { x: 220, y:  92, count:  55, label: 'Barcelona', zoom: 'europe',   region: 'europe',  itins: [0, 4] },
  { x: 295, y:  85, count:  76, label: 'Bangkok',   zoom: 'asia',     region: 'asia',    itins: [3] },
  { x: 338, y:  72, count: 112, label: 'Tokyo',     zoom: 'asia',     region: 'asia',    itins: [3] },
  { x: 318, y:  80, count:  88, label: 'Bali',      zoom: 'asia',     region: 'asia',    itins: [3] },
  { x:  92, y:  88, count: 134, label: 'NYC',       zoom: 'americas', region: 'americas',itins: [2, 5] },
  { x: 108, y: 105, count:  93, label: 'Lima',      zoom: 'americas', region: 'americas',itins: [2] },
]

const REGION_LABELS: Record<string, string> = {
  out: 'World', europe: 'Europe', asia: 'Asia & Pacific',
  americas: 'The Americas', sameric: 'South America', africa: 'Africa',
}

// Regions that drill-down to a city view when clicked in "out" zoom
const CITY_REGIONS = ['europe', 'asia', 'americas']

// ── Component ─────────────────────────────────────────────────────────────────
export function DiscoverMap({ onCitySelect, selectedCity }: Props) {
  const [zoom, setZoom] = useState('out')
  const [scale, setScale] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  // Add non-passive wheel listener so preventDefault() works
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      const factor = e.deltaY < 0 ? 1.18 : 0.85
      setScale((s) => Math.min(Math.max(s * factor, 1), 5))
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  const handleReset = useCallback(() => {
    setZoom('out')
    setScale(1)
    onCitySelect(null)
  }, [onCitySelect])

  const visible = CLUSTERS.filter((c) => c.zoom === zoom)
  const totalCount = visible.reduce((a, c) => a + c.count, 0)

  function handleClusterClick(c: MapCluster) {
    const isSelected = selectedCity?.label === c.label
    if (zoom === 'out' && CITY_REGIONS.includes(c.region)) {
      setZoom(c.region)
      onCitySelect(null)
    } else {
      onCitySelect(isSelected ? null : c)
    }
  }

  return (
    // .map-outer
    <div
      ref={containerRef}
      className="relative bg-ocean rounded-[20px] overflow-hidden select-none mb-0"
      style={{ height: 300, cursor: 'grab' }}
    >
      {/* Grid lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.06 }}
        viewBox="0 0 840 300"
        preserveAspectRatio="xMidYMid slice"
      >
        {Array.from({ length: 22 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={300} stroke="#fff" strokeWidth={0.5} />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 32} x2={840} y2={i * 32} stroke="#fff" strokeWidth={0.5} />
        ))}
      </svg>

      {/* Interactive map SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 500 200"
        preserveAspectRatio="xMidYMid meet"
      >
        <g
          transform={`scale(${scale}) translate(0,0)`}
          style={{ transformOrigin: '250px 100px' }}
        >
          {/* Continent shape */}
          <path
            d={CONT}
            fill="rgba(196,96,58,0.1)"
            stroke="rgba(196,96,58,0.28)"
            strokeWidth={1.2 / scale}
          />

          {/* Cluster bubbles */}
          {visible.map((c, i) => {
            const r = c.count > 200 ? 18 : c.count > 80 ? 14 : 11
            const isSelected = selectedCity?.label === c.label
            return (
              <g key={i} style={{ cursor: 'pointer' }} onClick={() => handleClusterClick(c)}>
                {/* Outer glow ring */}
                <circle
                  cx={c.x} cy={c.y}
                  r={(r + 8) / scale}
                  fill="rgba(196,96,58,0.08)"
                />
                {/* Main bubble */}
                <circle
                  cx={c.x} cy={c.y}
                  r={r / scale}
                  fill={
                    isSelected
                      ? 'rgba(201,168,76,0.9)'
                      : zoom === 'out'
                      ? 'rgba(196,96,58,0.82)'
                      : 'rgba(13,43,69,0.85)'
                  }
                  stroke={isSelected ? 'rgba(201,168,76,0.6)' : 'rgba(255,255,255,0.35)'}
                  strokeWidth={1.5 / scale}
                />
                {/* Count label */}
                <text
                  x={c.x} y={c.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize={7 / scale}
                  fontWeight={600}
                  fontFamily="DM Mono, monospace"
                >
                  {c.count}
                </text>
                {/* City label below bubble */}
                <text
                  x={c.x} y={c.y + r / scale + 8 / scale}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.55)"
                  fontSize={6.5 / scale}
                  fontFamily="DM Sans, sans-serif"
                >
                  {c.label}
                </text>
              </g>
            )
          })}
        </g>
      </svg>

      {/* Top-left region label */}
      <div
        className="absolute top-3.5 left-[18px] flex items-center gap-2.5 rounded-lg px-3.5 py-1.5"
        style={{
          background: 'rgba(7,24,37,0.8)',
          backdropFilter: 'blur(4px)',
          fontFamily: 'DM Mono, monospace',
          fontSize: 10,
          color: 'rgba(255,255,255,0.8)',
          letterSpacing: '1.5px',
        }}
      >
        <span>
          {REGION_LABELS[zoom]?.toUpperCase()} · {totalCount.toLocaleString()} ITINERARIES
        </span>
        {zoom !== 'out' && (
          <button
            onClick={handleReset}
            className="rounded-full px-2.5 py-0.5 text-[9px] transition-colors"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
            }}
          >
            ← WORLD
          </button>
        )}
      </div>

      {/* Bottom-right hint */}
      <div
        className="absolute bottom-3 right-4 rounded-lg px-3 py-1.5 pointer-events-none"
        style={{
          background: 'rgba(7,24,37,0.75)',
          backdropFilter: 'blur(4px)',
          fontFamily: 'DM Mono, monospace',
          fontSize: 9,
          color: 'rgba(255,255,255,0.5)',
          letterSpacing: '1px',
        }}
      >
        SCROLL TO ZOOM · CLICK REGION TO EXPLORE
      </div>
    </div>
  )
}
