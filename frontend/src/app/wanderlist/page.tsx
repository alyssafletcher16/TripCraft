import { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { WanderlistView } from '@/components/wanderlist/WanderlistView'

export const metadata: Metadata = { title: 'Wanderlist — TripCraft' }

export default function WanderlistPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="md:grid md:grid-cols-[auto_1fr] min-h-[calc(100vh-62px)]">
        <Sidebar />
        <main>
          <WanderlistView />
        </main>
      </div>
    </div>
  )
}
