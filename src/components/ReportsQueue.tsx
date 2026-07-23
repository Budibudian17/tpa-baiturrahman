'use client'

import { useState, useEffect } from 'react'
import { Check, X, Edit2, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react'

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
  }
  createdAt: string
}

export default function ReportsQueue() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      console.log('Fetching pending reports...')
      const res = await fetch('/api/reports?status=PENDING')
      const data = await res.json()
      console.log('Pending reports response:', data)
      setReports(data.reports || [])
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (reportId: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/approve`, { method: 'POST' })
      if (res.ok) {
        fetchReports()
      }
    } catch (error) {
      console.error('Failed to approve report:', error)
    }
  }

  const handleReject = async (reportId: string) => {
    const reason = prompt('Alasan penolakan:')
    if (!reason) return

    try {
      const res = await fetch(`/api/reports/${reportId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })
      if (res.ok) {
        fetchReports()
      }
    } catch (error) {
      console.error('Failed to reject report:', error)
    }
  }

  const handleDelete = async (reportId: string) => {
    if (!confirm('Yakin ingin menghapus laporan ini?')) return
    
    try {
      const res = await fetch(`/api/reports/${reportId}`, { method: 'DELETE' })
      if (res.ok) {
        fetchReports()
      }
    } catch (error) {
      console.error('Failed to delete report:', error)
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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Laporan Menunggu Persetujuan</h2>

      {reports.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Tidak ada laporan yang menunggu</p>
      ) : (
        <div className="space-y-4">
          {reports.map(report => (
            <div key={report.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-800">{report.user.name}</p>
                  <p className="text-sm text-gray-600">{typeLabels[report.type] || report.type}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(report.createdAt).toLocaleDateString('id-ID')}
                </span>
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

              <div className="flex items-center justify-between">
                <span className="font-bold text-green-600">+{report.stars} bintang</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(report.id)}
                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                    title="Setujui"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReject(report.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                    title="Tolak"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
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
    </div>
  )
}
