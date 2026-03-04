import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'

const HERO_DAYS = [
  { day: 'Day 01', title: 'Palermo Arrival', items: ['Flight booked ✓', 'Hotel booked ✓', 'Ballaro market'] },
  { day: 'Day 02', title: 'Palermo Deep Dive', items: ['Cappella Palatina', 'Ai Cascinari ✓', 'Street art walk'] },
  { day: 'Day 03', title: 'Agrigento', items: ['Morning train', 'Valley of Temples ✓'] },
]

const STATS = [
  { n: '12,400+', l: 'Itineraries built' },
  { n: '84', l: 'Countries covered' },
  { n: '3.2M+', l: 'Reviews synthesized' },
  { n: '94%', l: 'Would plan again' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-deep px-16 py-24 grid grid-cols-2 gap-18 items-center relative overflow-hidden">
        {/* Glow accents */}
        <div className="absolute top-[-100px] right-[-60px] w-[560px] h-[560px] bg-gradient-radial from-terra/13 to-transparent pointer-events-none rounded-full" />
        <div className="absolute bottom-[-60px] left-[180px] w-[380px] h-[380px] bg-gradient-radial from-gold/7 to-transparent pointer-events-none rounded-full" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-gold/12 border border-gold/25 rounded-full px-3.5 py-1.5 font-mono text-[10px] text-gold tracking-[2px] uppercase mb-6">
            ✦ Intelligent itinerary builder
          </div>

          <h1 className="font-serif text-[64px] font-bold leading-[1.03] text-white mb-6">
            Build trips<br />
            you <em className="text-terra not-italic">actually</em>{' '}
            <span className="text-gold-lt">own</span>
          </h1>

          <p className="text-white/55 text-base leading-[1.75] max-w-[420px] mb-10">
            Consolidate reviews, bookings, and community wisdom into one
            living itinerary. No more 47 browser tabs.
          </p>

          <div className="flex gap-3.5 items-center">
            <Link href="/register" className="btn-primary">
              Build your trip free
            </Link>
            <Link href="/discover" className="btn-ghost">
              Browse community trips
            </Link>
          </div>
        </div>

        {/* Hero card */}
        <div className="relative z-10 bg-white/4 border border-white/10 backdrop-blur-md rounded-3xl p-7 shadow-[0_40px_80px_rgba(0,0,0,0.4)]">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent rounded-t-3xl" />

          <div className="inline-flex items-center gap-1.5 bg-terra/20 border border-terra/40 rounded-full px-3 py-1 text-[10px] font-semibold text-terra-lt tracking-[0.5px] uppercase mb-4">
            ✈ Active trip
          </div>
          <h2 className="font-serif text-2xl font-bold text-white mb-0.5">Sicily, Italy</h2>
          <p className="font-mono text-[10px] text-slate tracking-[0.5px] uppercase mb-5">
            May 12–19 · 2 Travelers · 7 Days
          </p>

          <div className="flex flex-col gap-2">
            {HERO_DAYS.map((d, i) => (
              <div
                key={i}
                className="flex gap-3 px-3.5 py-2.5 rounded-xl bg-white/4 border border-white/6 items-start"
              >
                <span className="font-mono text-[10px] text-terra-lt font-medium min-w-[34px] mt-0.5">
                  {d.day}
                </span>
                <div className="flex-1">
                  <div className="text-xs font-medium text-white/85 mb-1.5">{d.title}</div>
                  <div className="flex flex-wrap gap-1">
                    {d.items.map((item, j) => (
                      <span
                        key={j}
                        className={`rounded-full px-2 py-0.5 text-[10px] ${
                          item.includes('✓')
                            ? 'bg-gold/15 text-gold-lt'
                            : 'bg-white/7 text-white/45'
                        }`}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-ocean px-16 py-5 flex gap-14 border-b border-white/6">
        {STATS.map((s, i) => (
          <div key={i}>
            <div className="font-serif text-[30px] font-bold text-gold">{s.n}</div>
            <div className="text-[11px] text-slate mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Feature teaser */}
      <section className="px-16 py-20 bg-surface">
        <div className="max-w-5xl mx-auto text-center">
          <p className="eyebrow mb-3">Why TripCraft</p>
          <h2 className="font-serif text-5xl font-bold text-ink mb-4">
            Your trip. All in one place.
          </h2>
          <p className="text-slate text-base leading-relaxed max-w-xl mx-auto mb-16">
            From first bookmark to final reflection — TripCraft keeps every booking,
            insight, and memory connected.
          </p>

          <div className="grid grid-cols-3 gap-8 text-left">
            {[
              {
                icon: '◈',
                title: 'Structured itineraries',
                desc: 'Day-by-day blocks for flights, hotels, activities, and restaurants — with confirmation numbers and cancel dates.',
              },
              {
                icon: '◎',
                title: 'Synthesized intelligence',
                desc: 'We surface what matters from thousands of reviews so you know what to book, skip, or watch out for.',
              },
              {
                icon: '◇',
                title: 'Community wisdom',
                desc: 'Browse real itineraries from real travelers. Upvote what resonates, remix what works.',
              },
            ].map((f, i) => (
              <div key={i} className="card p-7">
                <div className="text-terra text-2xl mb-4">{f.icon}</div>
                <h3 className="font-serif text-xl font-bold text-ink mb-2">{f.title}</h3>
                <p className="text-slate text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-deep px-16 py-20 text-center">
        <h2 className="font-serif text-5xl font-bold text-white mb-4">
          Ready to plan smarter?
        </h2>
        <p className="text-white/50 text-base mb-10 max-w-md mx-auto">
          Join thousands of travelers who build itineraries they actually use.
        </p>
        <Link href="/register" className="btn-primary">
          Start building free
        </Link>
      </section>
    </div>
  )
}
