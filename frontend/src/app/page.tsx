'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'

// Exact SVG grain from tripcraft-v5.jsx
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`

const HERO_DAYS = [
  { day: 'Day 01', title: 'Palermo Arrival',   items: ['Flight booked ✓', 'Hotel booked ✓', 'Ballaro market']        },
  { day: 'Day 02', title: 'Palermo Deep Dive', items: ['Cappella Palatina', 'Ai Cascinari ✓', 'Street art walk']     },
  { day: 'Day 03', title: 'Agrigento',          items: ['Morning train', 'Valley of Temples ✓']                       },
]


export default function HomePage() {
  const { data: session } = useSession()
  const isLoggedIn = !!session

  return (
    <div className="min-h-screen">
      <Navbar />
      {isLoggedIn ? (
        <div className="md:grid md:grid-cols-[272px_1fr] min-h-[calc(100vh-62px)]">
          <Sidebar />
          <main className="overflow-y-auto">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-deep pt-12 pb-16 sm:pt-16 sm:pb-20 md:pt-[88px] md:pb-[100px] px-4 sm:px-8 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-[72px] items-center relative overflow-hidden">

        {/* Grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: 0.5, backgroundImage: GRAIN_SVG }}
        />

        {/* Glow 1 */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            top: -100, right: -60,
            width: 560, height: 560,
            background: 'radial-gradient(circle, rgba(196,96,58,0.13) 0%, transparent 65%)',
          }}
        />

        {/* Glow 2 */}
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

          {/* Eyebrow pill */}
          <div className="inline-flex items-center gap-2 bg-gold/12 border border-gold/25 rounded-full px-[14px] py-[5px] font-mono text-[10px] text-gold tracking-[2px] uppercase mb-6">
            ✦ Intelligent Itinerary Builder
          </div>

          {/* Headline */}
          <h1 className="font-serif text-[42px] sm:text-[52px] md:text-[64px] font-bold leading-[1.03] text-white mb-[22px]">
            Build trips<br />
            you <em className="text-terra">own.</em><br />
            <span className="text-gold-lt">Own every</span> decision.
          </h1>

          {/* Sub-copy */}
          <p className="text-white/55 text-base leading-[1.75] max-w-[420px] mb-10">
            Structured templates powered by consolidated internet wisdom.
            Research, plan, book, reflect — the full journey in one place.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 items-center">
            <Link
              href="/register"
              className="bg-terra text-white py-[15px] px-8 rounded-full text-[15px] font-semibold transition-all duration-200 hover:bg-terra-lt hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(196,96,58,0.4)]"
            >
              Build your trip free →
            </Link>
            <Link
              href="/discover"
              className="text-white/60 text-sm border border-white/15 py-[14px] px-[26px] rounded-full transition-all duration-200 hover:border-white/35 hover:text-white"
            >
              Browse community trips
            </Link>
          </div>
        </div>

        {/* ── Right column — hero card ──────────────────────────────────────── */}
        <div
          className="relative z-10 border border-white/10 backdrop-blur-[12px] rounded-[24px] p-5 sm:p-7 shadow-[0_40px_80px_rgba(0,0,0,0.4)]"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          {/* Gold shimmer line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(201,168,76,0.4)] to-transparent" />

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-terra/20 border border-terra/40 rounded-full px-3 py-1 text-[10px] font-semibold text-terra-lt tracking-[0.5px] uppercase mb-[14px]">
            🌿 Active · 7 days
          </div>

          {/* Title */}
          <h2 className="font-serif text-2xl font-bold text-white mb-[3px]">Sicily, Italy</h2>

          {/* Meta */}
          <p className="font-mono text-[10px] text-slate tracking-[0.5px] uppercase mb-[18px]">
            MAY 12–19 · 2 TOTAL TRAVELERS · $3,200 BUDGET
          </p>

          {/* Day rows */}
          <div className="flex flex-col gap-2">
            {HERO_DAYS.map((d, i) => (
              <div
                key={i}
                className="flex gap-3 px-[14px] py-[10px] rounded-xl items-start border border-white/6"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <span className="font-mono text-[10px] text-terra-lt font-medium min-w-[34px] mt-px flex-shrink-0">
                  {d.day}
                </span>
                <div className="flex-1">
                  <div className="text-[12px] font-medium text-white/85 mb-[5px]">{d.title}</div>
                  <div className="flex flex-wrap gap-[5px]">
                    {d.items.map((item, j) => (
                      <span
                        key={j}
                        className={`rounded-full px-[9px] py-0.5 text-[10px] ${
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

      {/* ── Stats bar ─── hidden until real data is available ──────────────── */}

      {/* ── Feature highlights ────────────────────────────────────────────── */}
      <section className="px-4 sm:px-8 md:px-16 py-12 md:py-20 bg-surface">
        <div className="max-w-5xl mx-auto text-center">
          <p className="font-mono text-[10px] text-slate tracking-[2px] uppercase mb-3">Why TripCraft</p>
          <h2 className="font-serif text-[36px] sm:text-[44px] md:text-[48px] font-bold text-ink leading-tight mb-4">
            Your trip. All in one place.
          </h2>
          <p className="text-slate text-base leading-relaxed max-w-xl mx-auto mb-10 md:mb-16">
            From first bookmark to final reflection — TripCraft keeps every booking,
            insight, and memory connected.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 text-left">
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
              <div key={i} className="bg-white rounded-2xl border border-mist p-6 sm:p-7">
                <div className="text-terra text-2xl mb-4">{f.icon}</div>
                <h3 className="font-serif text-xl font-bold text-ink mb-2">{f.title}</h3>
                <p className="text-slate text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ──────────────────────────────────────────────────────── */}
      <section className="bg-deep px-4 sm:px-8 md:px-16 py-14 md:py-20 text-center">
        <h2 className="font-serif text-[36px] sm:text-[44px] md:text-[48px] font-bold text-white mb-4">
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
