'use client'

import Link from 'next/link'

type Tab = 'trips' | 'discover' | 'new' | 'profile'

const ITEMS = [
  { id: 'trips',    icon: '◻', label: 'My Trips',      href: '/trips'     },
  { id: 'discover', icon: '◎', label: 'Discover',       href: '/discover'  },
  { id: 'new',      icon: '◈', label: 'New Trip',       href: '/trips/new' },
  { id: 'profile',  icon: '◇', label: 'Profile',        href: '/profile'   },
]

export function Sidebar({ activeTab }: { activeTab?: Tab }) {
  return (
    <aside className="bg-deep border-r border-white/6 py-7 px-4 flex flex-col gap-1">
      <span className="font-mono text-[9px] text-slate tracking-[2px] uppercase px-2.5 pb-2 pt-4">
        Navigation
      </span>
      {ITEMS.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={`sidebar-item ${activeTab === item.id ? 'sidebar-item-active' : ''}`}
        >
          <span className="text-[15px] w-5 text-center flex-shrink-0">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </aside>
  )
}
