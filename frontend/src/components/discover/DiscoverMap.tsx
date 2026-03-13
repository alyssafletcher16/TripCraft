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
  matchTerms?: string[]
}

interface Props {
  onCitySelect: (city: MapCluster | null) => void
  selectedCity: MapCluster | null
  destinationCounts: Record<string, number>
}

// ── Geography helpers ─────────────────────────────────────────────────────────
// Converts lon/lat to SVG x/y in a 500×200 viewBox (Mercator)
function geo(lon: number, lat: number): [number, number] {
  return [(lon + 180) / 360 * 500, (90 - lat) / 180 * 200]
}

// ── Continent paths (500×200 viewBox) ─────────────────────────────────────────
// Each path traces a continent outline as an SVG polygon

// North America
const PATH_NA = [
  geo(-168, 66), geo(-145, 61), geo(-135, 58), geo(-124, 48),
  geo(-124, 40), geo(-117, 33), geo(-110, 23), geo(-105, 19),
  geo(-90, 16),  geo(-80, 9),   geo(-78, 9),   geo(-76, 15),
  geo(-80, 25),  geo(-80, 32),  geo(-76, 35),  geo(-70, 42),
  geo(-63, 45),  geo(-53, 47),  geo(-55, 52),  geo(-56, 58),
  geo(-65, 62),  geo(-80, 63),  geo(-95, 62),  geo(-100, 72),
  geo(-120, 70), geo(-140, 60), geo(-158, 55),
].map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z'

// South America
const PATH_SA = [
  geo(-80, 9),   geo(-77, 8),   geo(-76, 2),   geo(-80, -2),
  geo(-80, -10), geo(-75, -14), geo(-70, -20),  geo(-70, -30),
  geo(-72, -38), geo(-70, -45), geo(-68, -55),  geo(-64, -55),
  geo(-58, -51), geo(-52, -32), geo(-40, -22),  geo(-35, -8),
  geo(-35, -5),  geo(-48, 0),   geo(-60, 8),    geo(-63, 10),
  geo(-75, 11),
].map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z'

// Europe (main body + Iberia + Italy)
const PATH_EU = [
  geo(-9, 37),   geo(-9, 44),   geo(-2, 44),   geo(2, 47),
  geo(1, 51),    geo(4, 52),    geo(8, 55),     geo(10, 58),
  geo(15, 56),   geo(18, 60),   geo(28, 64),    geo(32, 65),
  geo(30, 60),   geo(24, 56),   geo(22, 54),    geo(14, 53),
  geo(14, 47),   geo(8, 47),    geo(12, 44),    geo(16, 41),
  geo(18, 39),   geo(16, 38),   geo(12, 38),    geo(16, 37),
  geo(22, 38),   geo(26, 40),   geo(29, 41),    geo(30, 44),
  geo(26, 40),   geo(22, 38),   geo(14, 36),    geo(8, 36),
  geo(-5, 36),
].map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z'

// Scandinavia peninsula
const PATH_SC = [
  geo(5, 62),    geo(8, 58),    geo(10, 57),    geo(18, 60),
  geo(26, 64),   geo(28, 71),   geo(24, 70),    geo(18, 68),
  geo(15, 70),   geo(14, 66),   geo(8, 63),
].map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z'

// Africa
const PATH_AF = [
  geo(-6, 36),   geo(5, 37),    geo(12, 36),    geo(18, 30),
  geo(26, 30),   geo(33, 28),   geo(44, 11),    geo(51, 11),
  geo(51, 3),    geo(44, -4),   geo(39, -8),    geo(35, -20),
  geo(32, -30),  geo(18, -35),  geo(14, -34),   geo(8, -22),
  geo(8, -14),   geo(-4, 4),    geo(-8, 5),     geo(-18, 14),
  geo(-18, 20),  geo(-14, 28),  geo(-8, 36),
].map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z'

// Asia (main body)
const PATH_AS = [
  geo(26, 40),   geo(36, 36),   geo(36, 42),    geo(42, 42),
  geo(54, 42),   geo(60, 44),   geo(68, 38),    geo(72, 24),
  geo(80, 10),   geo(92, 8),    geo(100, 4),    geo(104, 2),
  geo(104, 10),  geo(116, 20),  geo(122, 30),   geo(130, 34),
  geo(140, 36),  geo(145, 44),  geo(142, 52),   geo(135, 54),
  geo(130, 60),  geo(140, 60),  geo(155, 60),   geo(162, 64),
  geo(165, 70),  geo(140, 70),  geo(108, 73),   geo(90, 72),
  geo(70, 68),   geo(54, 68),   geo(40, 62),    geo(32, 65),
  geo(30, 60),   geo(24, 56),   geo(30, 48),    geo(30, 44),
].map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z'

// India sub-continent
const PATH_IN = [
  geo(68, 24),   geo(72, 22),   geo(78, 20),    geo(80, 14),
  geo(80, 10),   geo(80, 8),    geo(78, 8),     geo(78, 16),
  geo(76, 22),
].map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z'

// Indochina / SE Asia peninsula
const PATH_SEA = [
  geo(100, 20),  geo(104, 14),  geo(100, 4),    geo(104, 2),
  geo(104, 8),   geo(108, 2),   geo(110, 1),    geo(112, 4),
  geo(108, 10),  geo(104, 14),
].map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z'

// Australia
const PATH_AU = [
  geo(114, -22), geo(122, -18), geo(130, -12),  geo(136, -12),
  geo(142, -11), geo(150, -22), geo(154, -26),  geo(152, -38),
  geo(148, -38), geo(140, -38), geo(132, -34),  geo(126, -34),
  geo(120, -34), geo(114, -34), geo(114, -28),
].map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z'

// Greenland
const PATH_GL = [
  geo(-50, 82),  geo(-30, 82),  geo(-20, 76),   geo(-20, 72),
  geo(-28, 68),  geo(-42, 66),  geo(-52, 68),   geo(-56, 74),
  geo(-56, 78),
].map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z'

// Japan (Honshu approximation)
const PATH_JP = [
  geo(130, 31),  geo(132, 33),  geo(136, 34),   geo(140, 36),
  geo(141, 40),  geo(142, 44),  geo(140, 44),   geo(136, 36),
  geo(132, 34),
].map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z'

// New Zealand (North Island)
const PATH_NZ1 = [
  geo(172, -36),  geo(176, -37),  geo(178, -38), geo(175, -41), geo(172, -38),
].map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z'

// UK/Ireland (approximate)
const PATH_UK = [
  geo(-5, 50),  geo(-3, 52), geo(0, 53), geo(2, 52), geo(1, 50), geo(-4, 50),
].map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z'

const ALL_LAND = [PATH_NA, PATH_SA, PATH_EU, PATH_SC, PATH_AF, PATH_AS, PATH_IN, PATH_SEA, PATH_AU, PATH_GL, PATH_JP, PATH_NZ1, PATH_UK]

// ── Cluster data (geo-positioned) ────────────────────────────────────────────
// Helper to get SVG [x,y] from lon/lat
function geoXY(lon: number, lat: number): { x: number; y: number } {
  const [x, y] = geo(lon, lat)
  return { x: Math.round(x), y: Math.round(y) }
}

const CLUSTERS: MapCluster[] = [
  // World overview
  { ...geoXY(-100, 45), count: 248, label: 'Americas', zoom: 'out',      region: 'americas' },
  { ...geoXY(15,   48), count: 512, label: 'Europe',   zoom: 'out',      region: 'europe'   },
  { ...geoXY(95,   40), count: 381, label: 'Asia',     zoom: 'out',      region: 'asia'     },
  { ...geoXY(-60, -20), count:  87, label: 'S. America',zoom: 'out',     region: 'sameric', matchTerms: ['brazil','argentina','chile','colombia','venezuela','peru','bolivia','ecuador','paraguay','uruguay'], itins: [2, 5] },
  { ...geoXY(20,    5), count:  62, label: 'Africa',   zoom: 'out',      region: 'africa',  matchTerms: ['kenya','nigeria','south africa','egypt','ethiopia','ghana','tanzania','morocco','senegal','uganda'], itins: [1, 4] },
  // Europe cities
  { ...geoXY(-9,  39),  count:  89, label: 'Lisbon',   zoom: 'europe',   region: 'europe',  itins: [4] },
  { ...geoXY(2,   49),  count: 124, label: 'Paris',    zoom: 'europe',   region: 'europe',  itins: [0, 4] },
  { ...geoXY(12,  42),  count:  98, label: 'Rome',     zoom: 'europe',   region: 'europe',  itins: [0] },
  { ...geoXY(14,  50),  count:  67, label: 'Prague',   zoom: 'europe',   region: 'europe',  itins: [0, 4] },
  { ...geoXY(2,   41),  count:  55, label: 'Barcelona',zoom: 'europe',   region: 'europe',  itins: [0, 4] },
  // Asia cities
  { ...geoXY(101, 14),  count:  76, label: 'Bangkok',  zoom: 'asia',     region: 'asia',    itins: [3], matchTerms: ['thailand','cambodia','vietnam','laos','myanmar','ho chi minh','hanoi','phuket','chiang mai','phnom penh','siem reap'] },
  { ...geoXY(140, 36),  count: 112, label: 'Tokyo',    zoom: 'asia',     region: 'asia',    itins: [3], matchTerms: ['tokyo','japan','osaka','kyoto','hiroshima','hokkaido'] },
  { ...geoXY(115, -8),  count:  88, label: 'Bali',     zoom: 'asia',     region: 'asia',    itins: [3], matchTerms: ['bali','indonesia','jakarta','lombok'] },
  // Americas cities
  { ...geoXY(-74, 41),  count: 134, label: 'New York',  zoom: 'americas', region: 'americas',itins: [2, 5], matchTerms: ['new york','nyc','manhattan'] },
  { ...geoXY(-115, 36), count:  80, label: 'Las Vegas', zoom: 'americas', region: 'americas', matchTerms: ['las vegas','nevada','arizona','grand canyon'] },
  { ...geoXY(-77,-12),  count:  93, label: 'Lima',     zoom: 'americas', region: 'americas',itins: [2], matchTerms: ['lima','peru','machu picchu','cusco'] },
]

const REGION_LABELS: Record<string, string> = {
  out: 'World', europe: 'Europe', asia: 'Asia & Pacific',
  americas: 'The Americas', sameric: 'South America', africa: 'Africa',
}

const CITY_REGIONS = ['europe', 'asia', 'americas']

// Maps region cluster labels to the zoom level whose city children belong to them
const REGION_TO_ZOOM: Record<string, string> = {
  'Americas': 'americas',
  'Europe':   'europe',
  'Asia':     'asia',
}

// ── Component ─────────────────────────────────────────────────────────────────
// Sum destination counts for all DB destinations that match a cluster label or its matchTerms.
function countForCluster(label: string, counts: Record<string, number>, matchTerms?: string[]): number {
  const terms = [label.toLowerCase(), ...(matchTerms ?? []).map((t) => t.toLowerCase())]
  return Object.entries(counts)
    .filter(([dest]) => {
      const d = dest.toLowerCase()
      return terms.some((t) => d.includes(t) || t.includes(d))
    })
    .reduce((sum, [, n]) => sum + n, 0)
}

// Sum real counts for a region by aggregating its city children
function countForRegion(cluster: MapCluster, counts: Record<string, number>): number {
  const childZoom = REGION_TO_ZOOM[cluster.label]
  if (childZoom) {
    return CLUSTERS
      .filter((c) => c.zoom === childZoom)
      .reduce((sum, c) => sum + countForCluster(c.label, counts), 0)
  }
  // For regions with no city children (S. America, Africa), match via matchTerms or label
  if (cluster.matchTerms) {
    return cluster.matchTerms.reduce((sum, term) => sum + countForCluster(term, counts), 0)
  }
  return countForCluster(cluster.label, counts)
}

export function DiscoverMap({ onCitySelect, selectedCity, destinationCounts }: Props) {
  const [zoom, setZoom] = useState('out')
  const [scale, setScale] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

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

  const hasRealData = Object.keys(destinationCounts).length > 0

  // Hide clusters with no real itineraries; show real counts when data is available
  const visible = CLUSTERS.filter((c) => {
    if (c.zoom !== zoom) return false
    if (!hasRealData) return true
    if (CITY_REGIONS.includes(c.zoom)) {
      // City-level: hide if no trips in DB for this city
      return countForCluster(c.label, destinationCounts) > 0
    }
    if (c.zoom === 'out') {
      // Region-level: hide if no trips across all cities in this region
      return countForRegion(c, destinationCounts) > 0
    }
    return true
  }).map((c) => {
    if (!hasRealData) return c
    if (CITY_REGIONS.includes(c.zoom)) {
      return { ...c, count: countForCluster(c.label, destinationCounts) }
    }
    if (c.zoom === 'out') {
      return { ...c, count: countForRegion(c, destinationCounts) }
    }
    return c
  })

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
    <div
      ref={containerRef}
      className="relative rounded-[20px] overflow-hidden select-none mb-0"
      style={{ height: 300, cursor: 'grab', background: 'linear-gradient(160deg, #071825 0%, #0d2b45 60%, #0a2238 100%)' }}
    >
      {/* Latitude/longitude grid */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.06 }}
        viewBox="0 0 500 200"
        preserveAspectRatio="xMidYMid slice"
      >
        {Array.from({ length: 18 }).map((_, i) => (
          <line key={`v${i}`} x1={(i + 1) * 500 / 18} y1={0} x2={(i + 1) * 500 / 18} y2={200} stroke="#fff" strokeWidth={0.4} />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={(i + 1) * 200 / 8} x2={500} y2={(i + 1) * 200 / 8} stroke="#fff" strokeWidth={0.4} />
        ))}
      </svg>

      {/* World map SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 500 200"
        preserveAspectRatio="xMidYMid meet"
      >
        <g
          transform={`scale(${scale})`}
          style={{ transformOrigin: '250px 100px' }}
        >
          {/* Ocean tint behind continents */}
          <rect x={0} y={0} width={500} height={200} fill="rgba(13,43,69,0)" />

          {/* Continent land masses */}
          {ALL_LAND.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="rgba(196,96,58,0.13)"
              stroke="rgba(196,96,58,0.38)"
              strokeWidth={0.9 / scale}
              strokeLinejoin="round"
            />
          ))}

          {/* Cluster bubbles */}
          {visible.map((c, i) => {
            const r = c.count > 200 ? 18 : c.count > 80 ? 14 : 11
            const isSelected = selectedCity?.label === c.label
            return (
              <g key={i} style={{ cursor: 'pointer' }} onClick={() => handleClusterClick(c)}>
                <circle
                  cx={c.x} cy={c.y}
                  r={(r + 9) / scale}
                  fill="rgba(196,96,58,0.07)"
                />
                <circle
                  cx={c.x} cy={c.y}
                  r={r / scale}
                  fill={
                    isSelected
                      ? 'rgba(201,168,76,0.92)'
                      : zoom === 'out'
                      ? 'rgba(196,96,58,0.88)'
                      : 'rgba(13,43,69,0.88)'
                  }
                  stroke={isSelected ? 'rgba(201,168,76,0.55)' : 'rgba(255,255,255,0.3)'}
                  strokeWidth={1.5 / scale}
                />
                <text
                  x={c.x} y={c.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize={7 / scale}
                  fontWeight={600}
                  fontFamily="DM Mono, monospace"
                >
                  {hasRealData ? c.count : '—'}
                </text>
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

      {/* Region label */}
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

      {/* Hint */}
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
