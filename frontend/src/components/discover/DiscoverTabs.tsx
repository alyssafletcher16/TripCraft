'use client'

import { useState } from 'react'
import { DiscoverFeed } from './DiscoverFeed'
import { TravelersList } from './TravelersList'

const TABS = ['Community', 'Find Travelers'] as const
type Tab = typeof TABS[number]

export function DiscoverTabs() {
  const [activeTab, setActiveTab] = useState<Tab>('Community')

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-mist mb-8">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? 'border-ocean text-ocean'
                : 'border-transparent text-slate hover:text-ink'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Community' && <DiscoverFeed />}
      {activeTab === 'Find Travelers' && <TravelersList />}
    </div>
  )
}
