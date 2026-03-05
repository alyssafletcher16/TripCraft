import { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { TripsList } from '@/components/trips/TripsList'

export const metadata: Metadata = { title: 'My Trips — TripCraft' }

export default function TripsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="grid grid-cols-[272px_1fr] min-h-[calc(100vh-62px)]">
        <Sidebar activeTab="trips" />
        <main className="p-12 bg-surface">
          <p className="eyebrow mb-2">My Itineraries</p>
          <h1 className="page-title mb-8">Your trips</h1>
          <TripsList />
        </main>
      </div>
    </div>
  )
}
