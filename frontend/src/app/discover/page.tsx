import { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { DiscoverTabs } from '@/components/discover/DiscoverTabs'

export const metadata: Metadata = { title: 'Discover — TripCraft' }

export default function DiscoverPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="md:grid md:grid-cols-[auto_1fr] min-h-[calc(100vh-62px)]">
        <Sidebar activeTab="discover" />
        <main className="p-4 sm:p-8 md:p-12 bg-surface">
          <p className="eyebrow mb-2">Explore</p>
          <h1 className="page-title mb-2">Discover</h1>
          <p className="text-slate text-sm mb-8">
            Browse real itineraries or find travelers to follow.
          </p>
          <DiscoverTabs />
        </main>
      </div>
    </div>
  )
}
