'use client'

import { useState, useRef } from 'react'
import { X, User, Calendar, Clock, Camera } from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  user: {
    id: string
    name: string
    photoUrl?: string
    nameChangeCount?: number
    lastNameChangeAt?: string
  }
  onUpdate: (updatedUser: any) => void
}

export default function SettingsModal({ isOpen, onClose, user, onUpdate }: SettingsModalProps) {
  const [newName, setNewName] = useState(user.name)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const maxSize = 750 * 1024 // 750KB (Firestore limit is 1MB per document, base64 adds ~33%)
    if (file.size > maxSize) {
      setError(
        `Ukuran foto terlalu besar (${(file.size / 1024).toFixed(0)} KB). Maksimal 750 KB. ` +
        `<a href="https://www.iloveimg.com/resize-image" target="_blank" rel="noopener noreferrer" class="text-green-600 underline font-medium">Resize foto di sini</a>`
      )
      return
    }
    setPhotoFile(file)
    setError('')
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
    setSuccess(false)

    if (!newName.trim()) {
      setError('Nama tidak boleh kosong')
      return
    }

    if (newName.trim() === user.name && !photoFile) {
      setError('Tidak ada perubahan')
      return
    }

    setLoading(true)

    try {
      let photoUrl = user.photoUrl || null

      // Upload photo if provided
      if (photoFile) {
        try {
          photoUrl = await uploadPhoto(photoFile)
        } catch (uploadError) {
          console.error('Photo upload failed:', uploadError)
          setError('Gagal upload foto. Silakan coba lagi.')
          setLoading(false)
          return
        }
      }

      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: newName.trim(),
          photoUrl
        })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        onUpdate({ 
          ...user, 
          name: data.name, 
          photoUrl: data.photoUrl
        })
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        setError(data.error || 'Gagal mengubah profil')
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Pengaturan</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Profile Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-4">
              {user.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt="Foto profil"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-800">Nama Saat Ini</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{user.name}</p>
              </div>
            </div>
          </div>

          {/* Name Change Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Baru
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-800 placeholder-gray-400"
                placeholder="Masukkan nama baru"
                disabled={loading}
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto Profil
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
                  photoFile
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-green-400 text-gray-600'
                }`}
              >
                <Camera className="w-5 h-5" />
                {photoFile ? photoFile.name : 'Ganti Foto Profil'}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Maksimal 750 KB (Opsional)
              </p>
              {photoFile && (
                <p className="text-xs text-gray-500 mt-1">
                  {photoFile.name} ({(photoFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            {error && (
              <div 
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm"
                dangerouslySetInnerHTML={{ __html: error }}
              />
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
                Profil berhasil diubah!
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Memproses...' : 'Simpan Perubahan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
