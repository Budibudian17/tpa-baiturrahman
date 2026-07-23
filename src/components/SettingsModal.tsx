'use client'

import { useState } from 'react'
import { X, User, Calendar, Clock } from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  user: {
    id: string
    name: string
    nameChangeCount?: number
    lastNameChangeAt?: string
  }
  onUpdate: (updatedUser: any) => void
}

export default function SettingsModal({ isOpen, onClose, user, onUpdate }: SettingsModalProps) {
  const [newName, setNewName] = useState(user.name)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const nameChangeCount = user.nameChangeCount || 0
  const lastNameChangeAt = user.lastNameChangeAt

  // Calculate cooldown remaining
  let cooldownRemaining = 0
  let canChangeName = true

  if (nameChangeCount >= 1 && lastNameChangeAt) {
    const lastChangeDate = new Date(lastNameChangeAt)
    const now = new Date()
    const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000
    const timeSinceLastChange = now.getTime() - lastChangeDate.getTime()
    
    if (timeSinceLastChange < twoWeeksInMs) {
      cooldownRemaining = Math.ceil((twoWeeksInMs - timeSinceLastChange) / (24 * 60 * 60 * 1000))
      canChangeName = false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!newName.trim()) {
      setError('Nama tidak boleh kosong')
      return
    }

    if (newName.trim() === user.name) {
      setError('Nama baru tidak boleh sama dengan nama lama')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: newName.trim()
        })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        onUpdate({ ...user, name: data.name, nameChangeCount: nameChangeCount + 1, lastNameChangeAt: new Date().toISOString() })
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        setError(data.error || 'Gagal mengubah nama')
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
          {/* Current Name Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <User className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-800">Nama Saat Ini</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{user.name}</p>
          </div>

          {/* Name Change Stats */}
          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-800">Statistik Perubahan Nama</span>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Jumlah perubahan: <span className="font-semibold text-gray-900">{nameChangeCount}x</span></p>
              {lastNameChangeAt && (
                <p className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Terakhir diubah: {new Date(lastNameChangeAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Cooldown Warning */}
          {!canChangeName && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-yellow-800 text-sm">
                ⚠️ Anda harus menunggu <span className="font-bold">{cooldownRemaining} hari</span> lagi sebelum bisa mengubah nama.
              </p>
            </div>
          )}

          {/* Name Change Form */}
          {canChangeName && (
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

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
                  Nama berhasil diubah!
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Memproses...' : 'Ubah Nama'}
              </button>
            </form>
          )}

          {/* Info Message */}
          <div className="text-xs text-gray-500 text-center">
            <p>Anda hanya bisa mengubah nama sekali. Setelah itu, harus menunggu 14 hari untuk perubahan berikutnya.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
