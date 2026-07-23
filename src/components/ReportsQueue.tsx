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
    photoUrl?: string
  }
  createdAt: string
}

export default function ReportsQueue() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

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
    setProcessingId(reportId)
    try {
      const res = await fetch(`/api/reports/${reportId}/approve`, { method: 'POST' })
      if (res.ok) {
        fetchReports()
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
      if (res.ok) {
        fetchReports()
      }
    } catch (error) {
      console.error('Failed to reject report:', error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleDelete = async (reportId: string) => {
    if (!confirm('Yakin ingin menghapus laporan ini?')) return

    setProcessingId(reportId)
    try {
      const res = await fetch(`/api/reports/${reportId}`, { method: 'DELETE' })
      if (res.ok) {
        fetchReports()
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
        <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {reports.map(report => (
            <div key={report.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {report.user.photoUrl ? (
                    <img
                      src={report.user.photoUrl}
                      alt={report.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {report.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800">{report.user.name}</p>
                    <p className="text-sm text-gray-600">{typeLabels[report.type] || report.type}</p>
                  </div>
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
                  <button
                    onClick={() => handleDelete(report.id)}
                    disabled={processingId === report.id}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Hapus"
                  >
                    {processingId === report.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
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
