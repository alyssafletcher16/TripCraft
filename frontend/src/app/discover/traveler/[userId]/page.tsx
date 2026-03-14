import { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { TravelerProfileView } from '@/components/discover/TravelerProfileView'

export const metadata: Metadata = { title: 'Traveler — TripCraft' }

export default function TravelerPage({ params }: { params: { userId: string } }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="md:grid md:grid-cols-[auto_1fr] min-h-[calc(100vh-62px)]">
        <Sidebar activeTab="discover" />
        <main className="bg-surface overflow-y-auto">
          <TravelerProfileView userId={params.userId} />
        </main>
      </div>
    </div>
  )
}
