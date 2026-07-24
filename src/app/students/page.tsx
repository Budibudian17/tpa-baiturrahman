'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Star, ChevronUp, ChevronDown, Settings } from 'lucide-react'

interface User {
  id: string
  name: string
  username: string
  role: string
  stars: number
  photoUrl?: string
}

export default function StudentsPage() {
  const router = useRouter()
  const [students, setStudents] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingName, setEditingName] = useState<string | null>(null)
  const [editNameValue, setEditNameValue] = useState('')

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      setStudents(data.users || [])
    } catch (error) {
      console.error('Failed to fetch students:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStars = async (userId: string, newStars: number) => {
    try {
      await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stars: newStars })
      })
      await fetchStudents()
    } catch (error) {
      console.error('Failed to update stars:', error)
    }
  }

  const handleIncrementStars = (userId: string, currentStars: number, increment: number) => {
    const newStars = Math.max(0, currentStars + increment)
    handleUpdateStars(userId, newStars)
  }

  const handleUpdateName = async (userId: string, newName: string) => {
    try {
      await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name: newName })
      })
      await fetchStudents()
      setEditingName(null)
    } catch (error) {
      console.error('Failed to update name:', error)
    }
  }

  const startEditName = (student: User) => {
    setEditingName(student.id)
    setEditNameValue(student.name)
  }

  const cancelEditName = () => {
    setEditingName(null)
    setEditNameValue('')
  }

  const saveEditName = (userId: string) => {
    if (editNameValue.trim()) {
      handleUpdateName(userId, editNameValue.trim())
    }
  }

  const filteredStudents = students.filter(s => 
    s.role === 'STUDENT' && 
    (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     s.username.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Kelola Siswa</h1>
            <p className="text-gray-600">Atur nama dan bintang murid</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <input
            type="text"
            placeholder="Cari nama murid..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Students List */}
        <div className="space-y-3">
          {filteredStudents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Tidak ada murid ditemukan</p>
          ) : (
            filteredStudents.map(student => (
              <div key={student.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {student.photoUrl ? (
                      <img
                        src={student.photoUrl}
                        alt={student.name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {student.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {editingName === student.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editNameValue}
                            onChange={(e) => setEditNameValue(e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditName(student.id)
                              if (e.key === 'Escape') cancelEditName()
                            }}
                          />
                          <button
                            onClick={() => saveEditName(student.id)}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={cancelEditName}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-gray-800 truncate">{student.name}</p>
                          <p className="text-sm text-gray-500">@{student.username}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      onClick={() => startEditName(student)}
                      className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                      title="Edit Nama"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleIncrementStars(student.id, student.stars, -0.5)}
                          className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition"
                        >
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="w-16 text-center font-bold text-gray-800">
                          {student.stars % 1 === 0 ? student.stars : student.stars.toFixed(1)}
                        </span>
                        <button
                          onClick={() => handleIncrementStars(student.id, student.stars, 0.5)}
                          className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition"
                        >
                          <ChevronUp className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
