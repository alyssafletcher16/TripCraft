import { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileContent } from '@/components/profile/ProfileContent'

export const metadata: Metadata = { title: 'Profile — TripCraft' }

export default function ProfilePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="md:grid md:grid-cols-[auto_1fr] min-h-[calc(100vh-62px)]">
        <Sidebar activeTab="profile" />
        <main className="bg-surface overflow-y-auto">
          <ProfileHeader />
          <ProfileContent />
        </main>
      </div>
    </div>
  )
}
