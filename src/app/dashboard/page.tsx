'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { LogOut, Plus, Clock, CheckCircle, XCircle, Handshake, Book, Brain, Building, Star, X, Settings } from 'lucide-react'
import ActivityForm from '@/components/ActivityForm'
import ReportsQueue from '@/components/ReportsQueue'
import MemorizationForm from '@/components/MemorizationForm'
import Leaderboard from '@/components/Leaderboard'
import SettingsModal from '@/components/SettingsModal'

interface User {
  id: string
  name: string
  username: string
  role: string
  stars: number
  photoUrl?: string
  nameChangeCount?: number
  lastNameChangeAt?: string
  additionalPassword?: string
}

interface Report {
  id: string
  type: string
  status: string
  stars: number
  createdAt: string
  rejectionReason?: string
  photoUrl?: string
  location?: string
  prayerTime?: string
  category?: string
  surahName?: string
  startVerse?: string
  endVerse?: string
  description?: string
  isFromTeacher?: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (!res.ok) {
          router.push('/login')
          return
        }
        const userData = await res.json()
        setUser(userData)
        await fetchReports(userData.id)
      } catch (error) {
        console.error('Failed to fetch user data:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const fetchReports = async (userId: string) => {
    try {
      const res = await fetch(`/api/reports?userId=${userId}`)
      const data = await res.json()
      console.log('API Response:', data)
      console.log('Reports array:', data.reports)
      console.log('Reports length:', data.reports?.length)
      setReports(data.reports || [])
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    localStorage.removeItem('session')
    // Clear cookie
    document.cookie = 'session=; path=/; max-age=0; SameSite=Lax'
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const isTeacher = user.role === 'TEACHER'

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/img/tpabaiturrahmanlogo.webp"
              alt="TPA Baiturrahman Logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <div>
              <h1 className="font-bold text-gray-800">TPA Baiturrahman</h1>
              <p className="text-sm text-gray-600">{user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
            >
              <Settings className="w-5 h-5" />
              <span className="hidden sm:inline">Pengaturan</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Stars Card - Only for students */}
        {!isTeacher && (
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white mb-6 shadow-lg relative overflow-hidden">
            {/* Background star icons */}
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
              <Star className="w-full h-full fill-white" />
            </div>
            <div className="absolute bottom-0 left-0 w-48 h-48 opacity-10 -translate-x-1/4 translate-y-1/4">
              <Star className="w-full h-full fill-white" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Bintang</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-4xl font-bold">{user.stars}</p>
                    <Star className="w-8 h-8 fill-yellow-300 text-yellow-300" />
                  </div>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(user.stars, 5) }).map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-yellow-300 text-yellow-300" />
                  ))}
                  {user.stars > 5 && (
                    <span className="text-yellow-300 font-bold">+{user.stars - 5}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {isTeacher ? (
          <TeacherDashboard />
        ) : (
          <StudentDashboard user={user} reports={reports} onReportSubmitted={() => fetchReports(user.id)} />
        )}
      </main>

      {/* Settings Modal */}
      {user && (
        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          user={user}
          onUpdate={(updatedUser) => setUser(updatedUser)}
        />
      )}
    </div>
  )
}

function StudentDashboard({ user, reports, onReportSubmitted }: { user: User, reports: Report[], onReportSubmitted: () => void }) {
  const [showForm, setShowForm] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)

  const pendingReports = reports.filter(r => r.status === 'PENDING')
  const approvedReports = reports.filter(r => r.status === 'APPROVED')
  const rejectedReports = reports.filter(r => r.status === 'REJECTED')

  if (showForm && selectedActivity) {
    return (
      <ActivityForm
        type={selectedActivity}
        userId={user.id}
        onCancel={() => {
          setShowForm(false)
          setSelectedActivity(null)
        }}
        onSubmit={() => {
          setShowForm(false)
          setSelectedActivity(null)
          onReportSubmitted()
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Activity Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => {
            setSelectedActivity('SHALAT')
            setShowForm(true)
          }}
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition text-center"
        >
          <Building className="w-10 h-10 mx-auto mb-2 text-green-600" />
          <p className="font-semibold text-gray-800">Shalat</p>
          <p className="text-sm text-gray-500">1-2 bintang</p>
        </button>

        <button
          onClick={() => {
            setSelectedActivity('AMALAN_BAIK')
            setShowForm(true)
          }}
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition text-center"
        >
          <Handshake className="w-10 h-10 mx-auto mb-2 text-green-600" />
          <p className="font-semibold text-gray-800">Amalan Baik</p>
          <p className="text-sm text-gray-500">1-2 bintang</p>
        </button>

        <button
          onClick={() => {
            setSelectedActivity('BACA_QURAN')
            setShowForm(true)
          }}
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition text-center"
        >
          <Book className="w-10 h-10 mx-auto mb-2 text-green-600" />
          <p className="font-semibold text-gray-800">Baca Quran</p>
          <p className="text-sm text-gray-500">1-2 bintang</p>
        </button>

        <div className="bg-gray-100 p-6 rounded-xl text-center opacity-60">
          <Brain className="w-10 h-10 mx-auto mb-2 text-gray-600" />
          <p className="font-semibold text-gray-600">Hafalan</p>
          <p className="text-sm text-gray-500">Oleh Guru</p>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Laporan Terbaru</h2>

        {reports.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Belum ada laporan</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {pendingReports.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-yellow-600 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Menunggu Persetujuan ({pendingReports.length})
                </p>
                {pendingReports.map(report => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            )}

            {approvedReports.length > 0 && (
              <div className="space-y-2 mt-4">
                <p className="text-sm font-medium text-green-600 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Disetujui ({approvedReports.length})
                </p>
                {approvedReports.slice(0, 3).map(report => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            )}

            {rejectedReports.length > 0 && (
              <div className="space-y-2 mt-4">
                <p className="text-sm font-medium text-red-600 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Ditolak ({rejectedReports.length})
                </p>
                {rejectedReports.slice(0, 3).map(report => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState<'reports' | 'memorization' | 'leaderboard'>('reports')

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-2 flex gap-2">
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
            activeTab === 'reports'
              ? 'bg-green-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Laporan Masuk
        </button>
        <button
          onClick={() => setActiveTab('memorization')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
            activeTab === 'memorization'
              ? 'bg-green-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Input Hafalan
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
            activeTab === 'leaderboard'
              ? 'bg-green-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Leaderboard
        </button>
      </div>

      {activeTab === 'reports' && <ReportsQueue />}
      {activeTab === 'memorization' && <MemorizationForm />}
      {activeTab === 'leaderboard' && <Leaderboard />}
    </div>
  )
}

function ReportCard({ report }: { report: Report }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const typeLabels: Record<string, string> = {
    SHALAT: 'Shalat',
    AMALAN_BAIK: 'Amalan Baik',
    BACA_QURAN: 'Baca Quran',
    HAFALAN: 'Hafalan'
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700'
  }

  const statusLabels: Record<string, string> = {
    PENDING: 'Menunggu',
    APPROVED: 'Disetujui',
    REJECTED: 'Ditolak'
  }

  console.log('ReportCard rendering:', report)

  return (
    <>
      <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">{typeLabels[report.type] || report.type}</p>
            <p className="text-xs text-gray-500">
              {new Date(report.createdAt).toLocaleDateString('id-ID')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[report.status]}`}>
              {statusLabels[report.status] || report.status}
            </span>
            <span className="font-bold text-green-600">+{report.stars}</span>
          </div>
        </div>

        {/* Report Details */}
        <div className="text-xs text-gray-600 space-y-1">
          {report.location && <p>Lokasi: {report.location}</p>}
          {report.prayerTime && <p>Waktu: {report.prayerTime}</p>}
          {report.category && <p>Kategori: {report.category}</p>}
          {report.surahName && (
            <p>Surah: {report.surahName} (Ayat {report.startVerse} - {report.endVerse})</p>
          )}
          {report.description && (
            <p className="text-gray-700 mt-2 italic">"{report.description}"</p>
          )}
        </div>

        {/* Photo Toggle */}
        {report.photoUrl && (
          <div className="mt-2">
            <button
              onClick={() => setLightboxOpen(true)}
              className="text-xs text-green-600 hover:text-green-700 font-medium underline"
            >
              Lihat Foto
            </button>
          </div>
        )}

        {report.status === 'REJECTED' && report.rejectionReason && (
          <p className="text-xs text-red-600 mt-1">
            Alasan: {report.rejectionReason}
          </p>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && report.photoUrl && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={report.photoUrl}
              alt="Foto bukti"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 bg-white text-gray-800 hover:bg-gray-100 p-2 rounded-full shadow-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
