import { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { DiscoverFeed } from '@/components/discover/DiscoverFeed'

export const metadata: Metadata = { title: 'Discover — TripCraft' }

export default function DiscoverPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="grid grid-cols-[272px_1fr] min-h-[calc(100vh-62px)]">
        <Sidebar activeTab="discover" />
        <main className="p-12 bg-surface">
          <p className="eyebrow mb-2">Explore</p>
          <h1 className="page-title mb-2">Discover Itineraries</h1>
          <p className="text-slate text-sm mb-8">
            Real trips built by real travelers. Fork any itinerary and make it yours.
          </p>
          <DiscoverFeed />
        </main>
      </div>
    </div>
  )
}
