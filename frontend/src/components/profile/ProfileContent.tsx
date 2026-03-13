'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { UpcomingTab } from '@/components/profile/UpcomingTab'
import { CompletedTab } from '@/components/profile/CompletedTab'

const TABS = ['Active', 'Completed'] as const
type Tab = typeof TABS[number]

export function ProfileContent() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') === 'Completed' ? 'Completed' : 'Active'
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)
  const [completedRefreshKey, setCompletedRefreshKey] = useState(0)

  function handleTripCompleted() {
    setCompletedRefreshKey((k) => k + 1)
  }

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

      {activeTab === 'Active' && (
        <UpcomingTab onTripCompleted={handleTripCompleted} />
      )}

      {activeTab === 'Completed' && (
        <CompletedTab refreshKey={completedRefreshKey} />
      )}
    </>
  )
}
