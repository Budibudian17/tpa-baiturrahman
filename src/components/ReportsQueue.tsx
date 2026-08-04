'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, X, ZoomIn, ChevronUp, ChevronDown, Check, Trash2 } from 'lucide-react'
import ConfirmModal from '@/components/ConfirmModal'
import { collection, query, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface Report {
  id: string
  type: string
  location?: string
  prayerTime?: string
  category?: string
  surahName?: string
  startVerse?: string
  endVerse?: string
  description?: string
  photoUrl?: string
  stars: number
  status: string
  userId: string
  user: {
    name: string
    photoUrl?: string
    id?: string
  }
  createdAt: string
  rejectionReason?: string
}

export default function ReportsQueue() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING')
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set())
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const reportsData = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const reportData = docSnapshot.data()
          const userDoc = await getDoc(doc(db, 'users', reportData.userId))
          const userData = userDoc.data() as any

          return {
            id: docSnapshot.id,
            type: reportData.type,
            location: reportData.location,
            prayerTime: reportData.prayerTime,
            category: reportData.category,
            surahName: reportData.surahName,
            startVerse: reportData.startVerse,
            endVerse: reportData.endVerse,
            description: reportData.description,
            photoUrl: reportData.photoUrl,
            stars: reportData.stars,
            status: reportData.status,
            userId: reportData.userId,
            createdAt: reportData.createdAt,
            rejectionReason: reportData.rejectionReason,
            user: userData ? {
              id: reportData.userId,
              name: userData.name,
              photoUrl: userData.photoUrl || null
            } : null
          } as Report
        })
      )

      setReports(reportsData)
      setLoading(false)
    }, (error) => {
      console.error('Realtime listener error:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const toggleStudentExpand = (userId: string) => {
    const newExpanded = new Set(expandedStudents)
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId)
    } else {
      newExpanded.add(userId)
    }
    setExpandedStudents(newExpanded)
  }

  const getFilteredReports = () => {
    if (activeTab === 'ALL') return reports
    return reports.filter(r => r.status === activeTab)
  }

  const groupReportsByStudent = (reportsToGroup: Report[]) => {
    const grouped: Record<string, Report[]> = {}
    reportsToGroup.forEach(report => {
      if (!grouped[report.userId]) {
        grouped[report.userId] = []
      }
      grouped[report.userId].push(report)
    })
    return grouped
  }

  const handleApprove = async (reportId: string) => {
    setProcessingId(reportId)
    try {
      const res = await fetch(`/api/reports/${reportId}/approve`, { method: 'POST' })
      if (!res.ok) {
        console.error('Failed to approve report')
      }
    } catch (error) {
      console.error('Failed to approve report:', error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (reportId: string) => {
    const reason = prompt('Alasan penolakan:')
    if (!reason) return

    setProcessingId(reportId)
    try {
      const res = await fetch(`/api/reports/${reportId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })
      if (!res.ok) {
        console.error('Failed to reject report')
      }
    } catch (error) {
      console.error('Failed to reject report:', error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleDelete = (reportId: string) => {
    setDeleteConfirm(reportId)
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    setProcessingId(deleteConfirm)
    setDeleteConfirm(null)
    try {
      const res = await fetch(`/api/reports/${deleteConfirm}`, { method: 'DELETE' })
      if (!res.ok) {
        console.error('Failed to delete report')
      }
    } catch (error) {
      console.error('Failed to delete report:', error)
    } finally {
      setProcessingId(null)
    }
  }

  const openLightbox = (photoUrl: string) => {
    setLightboxPhoto(photoUrl)
  }

  const closeLightbox = () => {
    setLightboxPhoto(null)
  }

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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    )
  }

  const filteredReports = getFilteredReports()
  const groupedReports = groupReportsByStudent(filteredReports)
  const studentIds = Object.keys(groupedReports)

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Laporan Siswa</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === tab
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab === 'ALL' ? 'Semua' : statusLabels[tab]}
            {tab !== 'ALL' && ` (${reports.filter(r => r.status === tab).length})`}
          </button>
        ))}
      </div>

      {filteredReports.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Tidak ada laporan</p>
      ) : (
        <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {studentIds.map(userId => {
            const studentReports = groupedReports[userId]
            const firstReport = studentReports[0]
            const isExpanded = expandedStudents.has(userId)

            return (
              <div key={userId} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Student Header */}
                <button
                  onClick={() => toggleStudentExpand(userId)}
                  className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    {firstReport.user?.photoUrl ? (
                      <img
                        src={firstReport.user.photoUrl}
                        alt={firstReport.user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {firstReport.user?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">{firstReport.user?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">{studentReports.length} laporan</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                </button>

                {/* Student Reports */}
                {isExpanded && (
                  <div className="p-4 space-y-3">
                    {studentReports.map(report => (
                      <div key={report.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-gray-800">{typeLabels[report.type] || report.type}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(report.createdAt).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[report.status]}`}>
                              {statusLabels[report.status] || report.status}
                            </span>
                            <span className="font-bold text-green-600">+{report.stars} bintang</span>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 mb-3 space-y-1">
                          {report.location && <p>Lokasi: {report.location}</p>}
                          {report.prayerTime && <p>Waktu: {report.prayerTime}</p>}
                          {report.category && <p>Kategori: {report.category}</p>}
                          {report.surahName && (
                            <p>
                              Surah: {report.surahName} (Ayat {report.startVerse} - {report.endVerse})
                            </p>
                          )}
                          {report.description && (
                            <p className="text-gray-700 mt-2 italic">"{report.description}"</p>
                          )}
                          {report.photoUrl && (
                            <div className="mt-2">
                              <button
                                onClick={() => openLightbox(report.photoUrl!)}
                                className="text-green-600 hover:text-green-700 font-medium underline text-sm"
                              >
                                Lihat Foto
                              </button>
                            </div>
                          )}
                        </div>

                        {report.status === 'REJECTED' && report.rejectionReason && (
                          <p className="text-xs text-red-600 mt-2 mb-3">
                            Alasan: {report.rejectionReason}
                          </p>
                        )}

                        <div className="flex gap-2">
                          {report.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(report.id)}
                                disabled={processingId === report.id}
                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Setujui"
                              >
                                {processingId === report.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleReject(report.id)}
                                disabled={processingId === report.id}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Tolak"
                              >
                                {processingId === report.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                ) : (
                                  <X className="w-4 h-4" />
                                )}
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(report.id)}
                            disabled={processingId === report.id}
                            className="ml-auto p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Hapus"
                          >
                            {processingId === report.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={lightboxPhoto}
              alt="Foto bukti"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 bg-white text-gray-800 hover:bg-gray-100 p-2 rounded-full shadow-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm !== null}
        title="Hapus Laporan"
        message="Yakin ingin menghapus laporan ini?"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        confirmText="Ya, Hapus"
        cancelText="Batal"
      />
    </div>
  )
}
