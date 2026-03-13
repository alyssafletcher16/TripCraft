'use client'

import { useState } from 'react'
import { TripsList } from '@/components/trips/TripsList'
import { ArchiveTab } from '@/components/profile/ArchiveTab'

const TABS = ['My Trips', 'Archive'] as const
type Tab = typeof TABS[number]

export function ProfileContent() {
  const [activeTab, setActiveTab] = useState<Tab>('My Trips')

  return (
    <>
      {/* Tab bar */}
      <div className="border-b border-mist px-4 sm:px-8 md:px-12">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab
                  ? 'border-ocean text-ocean'
                  : 'border-transparent text-slate hover:text-ink'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab panels */}
      {activeTab === 'My Trips' && (
        <div className="p-4 sm:p-8 md:p-12">
          <p className="eyebrow mb-2">My Trips</p>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-ink mb-6 md:mb-8">Your itineraries</h2>
          <TripsList />
        </div>
      )}

      {activeTab === 'Archive' && <ArchiveTab />}
    </>
  )
}
