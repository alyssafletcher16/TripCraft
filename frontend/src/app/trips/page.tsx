import { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { TripCard } from '@/components/trips/TripCard'

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
          {/* TripCard list will be populated once API is connected */}
          <div className="grid grid-cols-2 gap-6">
            <TripCard
              title="Sicily, Italy"
              destination="Sicily"
              status="ACTIVE"
              coverEmoji="🌋"
              startDate="May 12"
              endDate="May 19"
              travelers={2}
              id="placeholder"
            />
          </div>
        </main>
      </div>
    </div>
  )
}
