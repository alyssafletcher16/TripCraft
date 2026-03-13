'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

// ── Geo helpers ───────────────────────────────────────────────────────────────
function geo(lon: number, lat: number): [number, number] {
  return [(lon + 180) / 360 * 500, (90 - lat) / 180 * 200]
}

// Continent outlines (500×200 viewBox, same as DiscoverMap)
const PATH_NA  = [geo(-168,66),geo(-145,61),geo(-135,58),geo(-124,48),geo(-124,40),geo(-117,33),geo(-110,23),geo(-105,19),geo(-90,16),geo(-80,9),geo(-78,9),geo(-76,15),geo(-80,25),geo(-80,32),geo(-76,35),geo(-70,42),geo(-63,45),geo(-53,47),geo(-55,52),geo(-56,58),geo(-65,62),geo(-80,63),geo(-95,62),geo(-100,72),geo(-120,70),geo(-140,60),geo(-158,55)].map((p,i)=>`${i===0?'M':'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')+'Z'
const PATH_SA  = [geo(-80,9),geo(-77,8),geo(-76,2),geo(-80,-2),geo(-80,-10),geo(-75,-14),geo(-70,-20),geo(-70,-30),geo(-72,-38),geo(-70,-45),geo(-68,-55),geo(-64,-55),geo(-58,-51),geo(-52,-32),geo(-40,-22),geo(-35,-8),geo(-35,-5),geo(-48,0),geo(-60,8),geo(-63,10),geo(-75,11)].map((p,i)=>`${i===0?'M':'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')+'Z'
const PATH_EU  = [geo(-9,37),geo(-9,44),geo(-2,44),geo(2,47),geo(1,51),geo(4,52),geo(8,55),geo(10,58),geo(15,56),geo(18,60),geo(28,64),geo(32,65),geo(30,60),geo(24,56),geo(22,54),geo(14,53),geo(14,47),geo(8,47),geo(12,44),geo(16,41),geo(18,39),geo(16,38),geo(12,38),geo(16,37),geo(22,38),geo(26,40),geo(29,41),geo(30,44),geo(26,40),geo(22,38),geo(14,36),geo(8,36),geo(-5,36)].map((p,i)=>`${i===0?'M':'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')+'Z'
const PATH_SC  = [geo(5,62),geo(8,58),geo(10,57),geo(18,60),geo(26,64),geo(28,71),geo(24,70),geo(18,68),geo(15,70),geo(14,66),geo(8,63)].map((p,i)=>`${i===0?'M':'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')+'Z'
const PATH_AF  = [geo(-6,36),geo(5,37),geo(12,36),geo(18,30),geo(26,30),geo(33,28),geo(44,11),geo(51,11),geo(51,3),geo(44,-4),geo(39,-8),geo(35,-20),geo(32,-30),geo(18,-35),geo(14,-34),geo(8,-22),geo(8,-14),geo(-4,4),geo(-8,5),geo(-18,14),geo(-18,20),geo(-14,28),geo(-8,36)].map((p,i)=>`${i===0?'M':'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')+'Z'
const PATH_AS  = [geo(26,40),geo(36,36),geo(36,42),geo(42,42),geo(54,42),geo(60,44),geo(68,38),geo(72,24),geo(80,10),geo(92,8),geo(100,4),geo(104,2),geo(104,10),geo(116,20),geo(122,30),geo(130,34),geo(140,36),geo(145,44),geo(142,52),geo(135,54),geo(130,60),geo(140,60),geo(155,60),geo(162,64),geo(165,70),geo(140,70),geo(108,73),geo(90,72),geo(70,68),geo(54,68),geo(40,62),geo(32,65),geo(30,60),geo(24,56),geo(30,48),geo(30,44)].map((p,i)=>`${i===0?'M':'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')+'Z'
const PATH_IN  = [geo(68,24),geo(72,22),geo(78,20),geo(80,14),geo(80,10),geo(80,8),geo(78,8),geo(78,16),geo(76,22)].map((p,i)=>`${i===0?'M':'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')+'Z'
const PATH_SEA = [geo(100,20),geo(104,14),geo(100,4),geo(104,2),geo(104,8),geo(108,2),geo(110,1),geo(112,4),geo(108,10),geo(104,14)].map((p,i)=>`${i===0?'M':'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')+'Z'
const PATH_AU  = [geo(114,-22),geo(122,-18),geo(130,-12),geo(136,-12),geo(142,-11),geo(150,-22),geo(154,-26),geo(152,-38),geo(148,-38),geo(140,-38),geo(132,-34),geo(126,-34),geo(120,-34),geo(114,-34),geo(114,-28)].map((p,i)=>`${i===0?'M':'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')+'Z'
const PATH_GL  = [geo(-50,82),geo(-30,82),geo(-20,76),geo(-20,72),geo(-28,68),geo(-42,66),geo(-52,68),geo(-56,74),geo(-56,78)].map((p,i)=>`${i===0?'M':'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')+'Z'
const PATH_JP  = [geo(130,31),geo(132,33),geo(136,34),geo(140,36),geo(141,40),geo(142,44),geo(140,44),geo(136,36),geo(132,34)].map((p,i)=>`${i===0?'M':'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')+'Z'
const PATH_UK  = [geo(-5,50),geo(-3,52),geo(0,53),geo(2,52),geo(1,50),geo(-4,50)].map((p,i)=>`${i===0?'M':'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')+'Z'

const ALL_LAND = [PATH_NA,PATH_SA,PATH_EU,PATH_SC,PATH_AF,PATH_AS,PATH_IN,PATH_SEA,PATH_AU,PATH_GL,PATH_JP,PATH_UK]

// ── Known city → lon/lat ──────────────────────────────────────────────────────
const CITY_COORDS: Record<string, [number, number]> = {
  'paris': [2, 49], 'france': [2, 47], 'rome': [12, 42], 'italy': [12, 42],
  'amalfi': [14, 40], 'amalfi coast': [14, 40], 'cinque terre': [10, 44],
  'barcelona': [2, 41], 'spain': [-4, 40], 'lisbon': [-9, 39], 'portugal': [-9, 39],
  'prague': [14, 50], 'london': [0, 51], 'uk': [0, 51], 'amsterdam': [5, 52],
  'berlin': [13, 52], 'vienna': [16, 48], 'athens': [24, 38], 'greece': [22, 38],
  'kyoto': [136, 35], 'tokyo': [140, 36], 'japan': [138, 36],
  'bangkok': [101, 14], 'thailand': [101, 14],
  'bali': [115, -8], 'indonesia': [118, -2],
  'singapore': [104, 1], 'vietnam': [108, 14], 'cambodia': [105, 12],
  'india': [78, 22], 'nepal': [84, 28],
  'new york': [-74, 41], 'nyc': [-74, 41], 'usa': [-98, 38], 'miami': [-80, 26],
  'los angeles': [-118, 34], 'mexico': [-99, 23], 'oaxaca': [-97, 17],
  'canada': [-95, 55],
  'peru': [-76, -10], 'lima': [-77, -12], 'salkantay': [-72, -13],
  'machu picchu': [-72, -13], 'colombia': [-74, 4],
  'argentina': [-65, -35], 'patagonia': [-70, -45],
  'brazil': [-53, -10], 'chile': [-71, -30],
  'morocco': [-8, 32], 'marrakech': [-8, 32], 'egypt': [31, 27],
  'kenya': [37, 0], 'tanzania': [35, -6], 'south africa': [25, -29],
  'australia': [135, -25], 'sydney': [151, -34], 'new zealand': [174, -41],
}

function destinationToCoords(destination: string): [number, number] | null {
  const lower = destination.toLowerCase()
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (lower.includes(key)) return coords
  }
  return null
}

// ── Profile World Map ─────────────────────────────────────────────────────────
interface TripPin { destination: string; title: string; coords: [number, number] }

function ProfileWorldMap({ trips }: { trips: TripPin[] }) {
  const [hovered, setHovered] = useState<{ label: string; x: number; y: number } | null>(null)

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 500 200"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {/* Grid lines */}
      {Array.from({ length: 18 }).map((_, i) => (
        <line key={`v${i}`} x1={(i + 1) * 500 / 18} y1={0} x2={(i + 1) * 500 / 18} y2={200} stroke="#fff" strokeWidth={0.3} opacity={0.06} />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={`h${i}`} x1={0} y1={(i + 1) * 200 / 8} x2={500} y2={(i + 1) * 200 / 8} stroke="#fff" strokeWidth={0.3} opacity={0.06} />
      ))}

      {/* Continents */}
      {ALL_LAND.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="rgba(255,255,255,0.05)"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={0.7}
          strokeLinejoin="round"
        />
      ))}

      {/* Trip destination dots — one per itinerary */}
      {trips.map((trip, i) => {
        const [x, y] = geo(trip.coords[0], trip.coords[1])
        return (
          <g
            key={i}
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHovered({ label: trip.destination, x, y })}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Hit area (invisible, larger for easy hover) */}
            <circle cx={x} cy={y} r={10} fill="transparent" />
            {/* Outer glow */}
            <circle cx={x} cy={y} r={6} fill="rgba(201,168,76,0.15)" />
            <circle cx={x} cy={y} r={3} fill="rgba(201,168,76,0.55)" />
            <circle cx={x} cy={y} r={1.8} fill="rgba(201,168,76,1)" />
          </g>
        )
      })}

      {/* Tooltip */}
      {hovered && (() => {
        const label = hovered.label
        const charW = 5.5
        const padX = 6
        const padY = 4
        const boxW = Math.min(label.length * charW + padX * 2, 120)
        const boxH = 14
        const tx = Math.max(2, Math.min(hovered.x - boxW / 2, 498 - boxW))
        const ty = hovered.y - boxH - 10
        return (
          <g style={{ pointerEvents: 'none' }}>
            <rect x={tx} y={ty} width={boxW} height={boxH} rx={3} fill="rgba(7,24,37,0.92)" stroke="rgba(201,168,76,0.5)" strokeWidth={0.6} />
            <text
              x={tx + boxW / 2}
              y={ty + boxH - padY}
              textAnchor="middle"
              fontSize={6}
              fill="rgba(201,168,76,1)"
              fontFamily="DM Mono, monospace"
              letterSpacing={0.5}
            >
              {label.toUpperCase()}
            </text>
          </g>
        )
      })()}
    </svg>
  )
}

// ── ProfileHeader ─────────────────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export function ProfileHeader() {
  const { data: session } = useSession()
  const [tripPins, setTripPins] = useState<TripPin[]>([])
  const [tripCount, setTripCount] = useState(0)
  const [countryCount, setCountryCount] = useState(0)
  const [dayCount, setDayCount] = useState(0)

  useEffect(() => {
    if (!session?.accessToken) return
    fetch(`${API}/api/trips`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const trips: Array<{ title: string; destination: string; status: string; days?: number; startDate?: string; endDate?: string }> =
          Array.isArray(data) ? data : Array.isArray(data.trips) ? data.trips : []

        const completed = trips.filter((t) => t.status === 'COMPLETED')
        setTripCount(completed.length)

        const pins: TripPin[] = []
        const countriesSet = new Set<string>()

        for (const t of trips) {
          const c = destinationToCoords(t.destination)
          if (c) {
            pins.push({ destination: t.destination, title: t.title, coords: c })
            const lower = t.destination.toLowerCase()
            for (const key of Object.keys(CITY_COORDS)) {
              if (lower.includes(key)) { countriesSet.add(key); break }
            }
          }
        }

        setTripPins(pins)
        setCountryCount(countriesSet.size)

        // Approximate days from completed trips
        let days = 0
        for (const t of completed) {
          if (t.startDate && t.endDate) {
            const d = Math.round((new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / 86400000)
            days += d
          } else if (t.days) {
            days += t.days
          }
        }
        setDayCount(days)
      })
      .catch(() => {})
  }, [session])

  const initials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?'

  return (
    <div className="relative overflow-hidden" style={{ background: '#071825' }}>
      {/* World map background */}
      <div className="absolute inset-0">
        <ProfileWorldMap trips={tripPins} />
      </div>

      {/* Gradient overlay so text stays readable */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to right, rgba(7,24,37,0.92) 0%, rgba(7,24,37,0.75) 50%, rgba(7,24,37,0.45) 100%)',
        }}
      />

      <div className="relative z-10 px-12 py-14">
        <div className="flex items-center gap-7">
          <div className="w-20 h-20 rounded-full bg-terra/20 border-2 border-terra/30 flex items-center justify-center text-2xl font-serif font-bold text-terra-lt">
            {initials}
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-white mb-1">
              {session?.user?.name ?? 'Traveler'}
            </h1>
            <p className="text-slate text-sm">{session?.user?.email}</p>
            {tripPins.length > 0 && (
              <p className="text-[11px] mt-1" style={{ color: 'rgba(201,168,76,0.8)', fontFamily: 'DM Mono, monospace', letterSpacing: '1px' }}>
                {tripPins.length} ITINERAR{tripPins.length !== 1 ? 'IES' : 'Y'} ON THE MAP
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-8 mt-10">
          {[
            { n: tripCount,   l: 'Trips completed' },
            { n: countryCount,l: 'Countries visited' },
            { n: dayCount,    l: 'Days traveled' },
          ].map((s, i) => (
            <div key={i}>
              <div className="font-serif text-2xl font-bold text-gold">{s.n}</div>
              <div className="text-[11px] text-slate mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
