import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'

// Exact SVG grain from tripcraft-v5.jsx
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`

const HERO_DAYS = [
  { day: 'Day 01', title: 'Palermo Arrival',   items: ['Flight booked ✓', 'Hotel booked ✓', 'Ballaro market']        },
  { day: 'Day 02', title: 'Palermo Deep Dive', items: ['Cappella Palatina', 'Ai Cascinari ✓', 'Street art walk']     },
  { day: 'Day 03', title: 'Agrigento',          items: ['Morning train', 'Valley of Temples ✓']                       },
]

const STATS = [
  { n: '12,400+', l: 'Itineraries built'   },
  { n: '84',      l: 'Countries covered'   },
  { n: '3.2M+',   l: 'Reviews synthesized' },
  { n: '94%',     l: 'Would plan again'    },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      {/* padding: 88px 64px 100px  |  gap: 72px  (matches .hero CSS exactly) */}
      <section className="bg-deep pt-[88px] pb-[100px] px-16 grid grid-cols-2 gap-[72px] items-center relative overflow-hidden">

        {/* Grain overlay — opacity:0.5, SVG fractal noise at 0.035 opacity */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: 0.5, backgroundImage: GRAIN_SVG }}
        />

        {/* Glow 1 — terra radial, top-right  (.hero-glow) */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            top: -100, right: -60,
            width: 560, height: 560,
            background: 'radial-gradient(circle, rgba(196,96,58,0.13) 0%, transparent 65%)',
          }}
        />

        {/* Glow 2 — gold radial, bottom-center  (.hero-glow2) */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            bottom: -60, left: 180,
            width: 380, height: 380,
            background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 65%)',
          }}
        />

        {/* ── Left column ─────────────────────────────────────────────────── */}
        <div className="relative z-10">

          {/* Eyebrow pill  (.hero-eyebrow) */}
          <div className="inline-flex items-center gap-2 bg-gold/12 border border-gold/25 rounded-full px-[14px] py-[5px] font-mono text-[10px] text-gold tracking-[2px] uppercase mb-6">
            ✦ Intelligent Itinerary Builder
          </div>

          {/* Headline  (.hero-h1)
              em  → terra + italic (em is italic by default)
              span → gold-lt */}
          <h1 className="font-serif text-[64px] font-bold leading-[1.03] text-white mb-[22px]">
            Build trips<br />
            you <em className="text-terra">own.</em><br />
            <span className="text-gold-lt">Own every</span> decision.
          </h1>

          {/* Sub-copy  (.hero-p) */}
          <p className="text-white/55 text-base leading-[1.75] max-w-[420px] mb-10">
            Structured templates powered by consolidated internet wisdom.
            Research, plan, book, reflect — the full journey in one place.
          </p>

          {/* CTAs  (.hero-btns) */}
          <div className="flex gap-[14px] items-center">
            {/* .btn-hero: padding 15px 32px, font-size 15px */}
            <Link
              href="/register"
              className="bg-terra text-white py-[15px] px-8 rounded-full text-[15px] font-semibold transition-all duration-200 hover:bg-terra-lt hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(196,96,58,0.4)]"
            >
              Build your trip free →
            </Link>
            {/* .btn-ghost: padding 14px 26px, font-size 14px */}
            <Link
              href="/discover"
              className="text-white/60 text-sm border border-white/15 py-[14px] px-[26px] rounded-full transition-all duration-200 hover:border-white/35 hover:text-white"
            >
              Browse community trips
            </Link>
          </div>
        </div>

        {/* ── Right column — hero card  (.hero-card) ──────────────────────── */}
        <div
          className="relative z-10 border border-white/10 backdrop-blur-[12px] rounded-[24px] p-7 shadow-[0_40px_80px_rgba(0,0,0,0.4)]"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          {/* Gold shimmer line on top edge  (.hero-card::before) */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(201,168,76,0.4)] to-transparent" />

          {/* Badge  (.hero-card-badge): mb 14px */}
          <div className="inline-flex items-center gap-1.5 bg-terra/20 border border-terra/40 rounded-full px-3 py-1 text-[10px] font-semibold text-terra-lt tracking-[0.5px] uppercase mb-[14px]">
            🌿 Active · 7 days
          </div>

          {/* Title  (.hero-card-title): mb 3px */}
          <h2 className="font-serif text-2xl font-bold text-white mb-[3px]">Sicily, Italy</h2>

          {/* Meta  (.hero-card-meta): mb 18px */}
          <p className="font-mono text-[10px] text-slate tracking-[0.5px] uppercase mb-[18px]">
            MAY 12–19 · 2 TOTAL TRAVELERS · $3,200 BUDGET
          </p>

          {/* Day rows  (.hday)
              gap 12px, padding 10px 14px, border-radius 12px
              mb-2 on each row (gap-2 on container = 8px) */}
          <div className="flex flex-col gap-2">
            {HERO_DAYS.map((d, i) => (
              <div
                key={i}
                className="flex gap-3 px-[14px] py-[10px] rounded-xl items-start border border-white/6"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                {/* .hday-num: min-width 34px, mt 1px */}
                <span className="font-mono text-[10px] text-terra-lt font-medium min-w-[34px] mt-px flex-shrink-0">
                  {d.day}
                </span>

                <div className="flex-1">
                  {/* .hday-title: font-size 12px, mb 5px */}
                  <div className="text-[12px] font-medium text-white/85 mb-[5px]">{d.title}</div>

                  {/* .hpill rows: gap 5px, px 9px py 2px */}
                  <div className="flex flex-wrap gap-[5px]">
                    {d.items.map((item, j) => (
                      <span
                        key={j}
                        className={`rounded-full px-[9px] py-0.5 text-[10px] ${
                          item.includes('✓')
                            ? 'bg-gold/15 text-gold-lt'        // .hpill.done
                            : 'bg-white/7 text-white/45'       // .hpill
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

      {/* ── Stats bar  (.stats-bar) ───────────────────────────────────────── */}
      {/* padding: 22px 64px  |  gap: 56px */}
      <div className="bg-ocean px-16 py-[22px] flex gap-14 border-b border-white/6">
        {STATS.map((s, i) => (
          <div key={i}>
            <div className="font-serif text-[30px] font-bold text-gold">{s.n}</div>
            <div className="text-[11px] text-slate mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── Feature highlights (additional landing content) ───────────────── */}
      <section className="px-16 py-20 bg-surface">
        <div className="max-w-5xl mx-auto text-center">
          <p className="font-mono text-[10px] text-slate tracking-[2px] uppercase mb-3">Why TripCraft</p>
          <h2 className="font-serif text-[48px] font-bold text-ink leading-tight mb-4">
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
              <div key={i} className="bg-white rounded-2xl border border-mist p-7">
                <div className="text-terra text-2xl mb-4">{f.icon}</div>
                <h3 className="font-serif text-xl font-bold text-ink mb-2">{f.title}</h3>
                <p className="text-slate text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ─────────────────────────────────────────────────────── */}
      <section className="bg-deep px-16 py-20 text-center">
        <h2 className="font-serif text-[48px] font-bold text-white mb-4">
          Ready to plan smarter?
        </h2>
        <p className="text-white/50 text-base mb-10 max-w-md mx-auto">
          Join thousands of travelers who build itineraries they actually use.
        </p>
        <Link
          href="/register"
          className="bg-terra text-white py-[15px] px-8 rounded-full text-[15px] font-semibold transition-all duration-200 hover:bg-terra-lt hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(196,96,58,0.4)]"
        >
          Start building free →
        </Link>
      </section>
    </div>
  )
}
