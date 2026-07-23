'use client'

import { useState, useEffect } from 'react'
import { BookOpen } from 'lucide-react'

interface User {
  id: string
  name: string
  photoUrl?: string
}

export default function MemorizationForm() {
  const [students, setStudents] = useState<User[]>([])
  const [formData, setFormData] = useState({
    userId: '',
    type: 'QURAN', // QURAN or ASMAUL_HUSNA
    surahName: '',
    verse: '',
    asmaulHusnaCount: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/users?role=STUDENT')
      const data = await res.json()
      setStudents(data.users || [])
    } catch (error) {
      console.error('Failed to fetch students:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setSuccess(false)

    try {
      const res = await fetch('/api/memorizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setSuccess(true)
        setFormData({ userId: '', type: 'QURAN', surahName: '', verse: '', asmaulHusnaCount: '' })
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Failed to submit memorization:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-bold text-gray-800">Input Hafalan Siswa</h2>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          Hafalan berhasil dicatat!
        </div>
      )}

      {error && (
        <div 
          className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm"
          dangerouslySetInnerHTML={{ __html: error }}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Pilih Siswa
          </label>
          <div className="grid grid-cols-2 gap-3">
            {students.map(student => (
              <button
                key={student.id}
                type="button"
                onClick={() => setFormData({ ...formData, userId: student.id })}
                className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${
                  formData.userId === student.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-400'
                }`}
              >
                {student.photoUrl ? (
                  <img
                    src={student.photoUrl}
                    alt={student.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-medium text-gray-800 text-sm">{student.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Jenis Hafalan
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'QURAN' })}
              className={`p-4 rounded-xl border-2 transition ${
                formData.type === 'QURAN'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-400'
              }`}
            >
              <BookOpen className="w-8 h-8 mb-2 mx-auto text-gray-700" />
              <p className="font-semibold text-gray-800 text-sm">Al-Quran</p>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'ASMAUL_HUSNA' })}
              className={`p-4 rounded-xl border-2 transition ${
                formData.type === 'ASMAUL_HUSNA'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-400'
              }`}
            >
              <BookOpen className="w-8 h-8 mb-2 mx-auto text-gray-700" />
              <p className="font-semibold text-gray-800 text-sm">Asmaul Husna</p>
            </button>
          </div>
        </div>

        {formData.type === 'QURAN' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Surah
              </label>
              <input
                type="text"
                value={formData.surahName}
                onChange={(e) => setFormData({ ...formData, surahName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-800 placeholder-gray-400"
                placeholder="Contoh: Al-Ikhlas"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ayat yang Dihafal
              </label>
              <input
                type="text"
                value={formData.verse}
                onChange={(e) => setFormData({ ...formData, verse: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-800 placeholder-gray-400"
                placeholder="Contoh: 1-4"
                required
              />
            </div>
          </>
        )}

        {formData.type === 'ASMAUL_HUSNA' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jumlah Asmaul Husna yang Dihafal
            </label>
            <input
              type="number"
              value={formData.asmaulHusnaCount}
              onChange={(e) => setFormData({ ...formData, asmaulHusnaCount: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-800 placeholder-gray-400"
              placeholder="Contoh: 10"
              min="1"
              max="99"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Setiap 10 Asmaul Husna = 1 bintang (Maksimal 99)
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Memproses...' : 'Simpan Hafalan'}
        </button>
      </form>
    </div>
  )
}
