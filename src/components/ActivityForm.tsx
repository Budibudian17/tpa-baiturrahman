'use client'

import { useState, useRef } from 'react'
import { Camera, X, Building, Home, Heart, Smile, Users, Gift, Plus, Upload } from 'lucide-react'

interface ActivityFormProps {
  type: string
  userId: string
  onCancel: () => void
  onSubmit: () => void
}

export default function ActivityForm({ type, userId, onCancel, onSubmit }: ActivityFormProps) {
  const [formData, setFormData] = useState({
    location: '',
    prayerTime: '',
    category: '',
    surahName: '',
    startVerse: '',
    endVerse: '',
    description: '',
    hasPhoto: false,
    photoFile: null as File | null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const typeLabels: Record<string, string> = {
    SHALAT: 'Shalat',
    AMALAN_BAIK: 'Amalan Baik',
    BACA_QURAN: 'Baca Quran'
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Limit file size to 750KB to avoid Firestore document size limit (1MB)
      const maxSize = 750 * 1024 // 750KB (Firestore limit is 1MB per document, base64 adds ~33%)
      if (file.size > maxSize) {
        setError(
          `Ukuran foto terlalu besar (${(file.size / 1024).toFixed(0)} KB). Maksimal 750 KB. ` +
          `<a href="https://www.iloveimg.com/resize-image" target="_blank" rel="noopener noreferrer" class="text-green-600 underline font-medium">Resize foto di sini</a>`
        )
        return
      }
      setFormData({ ...formData, photoFile: file, hasPhoto: true })
    }
  }

  const uploadPhoto = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        resolve(base64String)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let photoUrl = null
      let stars = 0

      // Upload photo if provided
      if (formData.photoFile) {
        setUploading(true)
        try {
          photoUrl = await uploadPhoto(formData.photoFile)
          stars = 1.5 // 1.5 stars with photo
        } catch (uploadError) {
          console.error('Photo upload failed:', uploadError)
          setError('Gagal upload foto. Silakan coba lagi.')
          return
        }
      } else {
        stars = 1 // 1 star without photo
      }

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          userId,
          location: formData.location,
          prayerTime: formData.prayerTime,
          category: formData.category,
          surahName: formData.surahName,
          startVerse: formData.startVerse,
          endVerse: formData.endVerse,
          description: formData.description,
          photoUrl,
          stars
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to submit report')
        return
      }

      onSubmit()
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Laporan {typeLabels[type]}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {type === 'SHALAT' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Lokasi Shalat
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, location: 'Rumah' })}
                  className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                    formData.location === 'Rumah'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-400'
                  }`}
                >
                  <Home className="w-8 h-8 text-gray-700" />
                  <span className="font-medium text-gray-800">Rumah</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, location: 'Masjid' })}
                  className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                    formData.location === 'Masjid'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-400'
                  }`}
                >
                  <Building className="w-8 h-8 text-gray-700" />
                  <span className="font-medium text-gray-800">Masjid</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Waktu Shalat
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Subuh', 'Juhur', 'Ashar', 'Magrib', 'Isya'].map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setFormData({ ...formData, prayerTime: time })}
                    className={`p-3 rounded-lg border-2 transition text-sm font-medium ${
                      formData.prayerTime === time
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-green-400 text-gray-700'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {type === 'AMALAN_BAIK' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Kategori Amalan
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, category: 'Membantu orang tua' })}
                className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                  formData.category === 'Membantu orang tua'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-400'
                }`}
              >
                <Heart className="w-8 h-8 text-gray-700" />
                <span className="font-medium text-gray-800 text-sm">Membantu orang tua</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, category: 'Berakhlak baik' })}
                className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                  formData.category === 'Berakhlak baik'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-400'
                }`}
              >
                <Smile className="w-8 h-8 text-gray-700" />
                <span className="font-medium text-gray-800 text-sm">Berakhlak baik</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, category: 'Menolong teman' })}
                className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                  formData.category === 'Menolong teman'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-400'
                }`}
              >
                <Users className="w-8 h-8 text-gray-700" />
                <span className="font-medium text-gray-800 text-sm">Menolong teman</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, category: 'Sedekah' })}
                className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                  formData.category === 'Sedekah'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-400'
                }`}
              >
                <Gift className="w-8 h-8 text-gray-700" />
                <span className="font-medium text-gray-800 text-sm">Sedekah</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, category: 'Lainnya' })}
                className={`col-span-2 p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                  formData.category === 'Lainnya'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-400'
                }`}
              >
                <Plus className="w-8 h-8 text-gray-700" />
                <span className="font-medium text-gray-800 text-sm">Lainnya</span>
              </button>
            </div>
          </div>
        )}

        {type === 'BACA_QURAN' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Surah
              </label>
              <input
                type="text"
                value={formData.surahName}
                onChange={(e) => setFormData({ ...formData, surahName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-800 placeholder-gray-400"
                placeholder="Contoh: Al-Fatihah"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ayat Mulai
                </label>
                <input
                  type="text"
                  value={formData.startVerse}
                  onChange={(e) => setFormData({ ...formData, startVerse: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-800 placeholder-gray-400"
                  placeholder="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ayat Akhir
                </label>
                <input
                  type="text"
                  value={formData.endVerse}
                  onChange={(e) => setFormData({ ...formData, endVerse: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-800 placeholder-gray-400"
                  placeholder="7"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Description (Required for all types) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deskripsi Singkat <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none text-gray-800 placeholder-gray-400"
            placeholder="Ceritakan sedikit tentang aktivitas ini..."
            rows={3}
            required
          />
        </div>

        {/* Photo Upload (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Foto Bukti (Opsional - +0.5 Bintang)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`w-full p-4 border-2 border-dashed rounded-lg transition flex items-center justify-center gap-2 ${
              formData.photoFile
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-300 hover:border-green-400 text-gray-600'
            }`}
          >
            <Camera className="w-5 h-5" />
            {formData.photoFile ? formData.photoFile.name : 'Tambah Foto'}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Maksimal 750 KB.
          </p>
          {formData.photoFile && (
            <p className="text-xs text-gray-500 mt-1">
              {formData.photoFile.name} ({(formData.photoFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        {error && (
          <div 
            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm"
            dangerouslySetInnerHTML={{ __html: error }}
          />
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Mengirim...' : 'Kirim Laporan'}
          </button>
        </div>
      </form>
    </div>
  )
}
