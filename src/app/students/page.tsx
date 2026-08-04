'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Star, ChevronUp, ChevronDown, Settings, Trash2 } from 'lucide-react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import ConfirmModal from '@/components/ConfirmModal'

interface User {
  id: string
  name: string
  username: string
  role: string
  stars: number
  photoUrl?: string
  email?: string
}

export default function StudentsPage() {
  const router = useRouter()
  const [students, setStudents] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingName, setEditingName] = useState<string | null>(null)
  const [editNameValue, setEditNameValue] = useState('')
  const [updatingStars, setUpdatingStars] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ userId: string; studentName: string } | null>(null)
  const [deleteSecondConfirm, setDeleteSecondConfirm] = useState<{ userId: string; studentName: string } | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning'>('success')

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // First, use API to get initial data
        const res = await fetch('/api/users')
        const data = await res.json()
        setStudents(data.users || [])
        
        // Then, set up realtime listener for updates
        const q = query(collection(db, 'users'), where('role', '==', 'STUDENT'))
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const studentsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as User[]
          setStudents(studentsData)
        }, (error) => {
          console.error('Realtime listener error:', error)
        })

        return unsubscribe
      } catch (error) {
        console.error('Failed to fetch students:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  const handleUpdateStars = async (userId: string, newStars: number) => {
    setUpdatingStars(userId)
    try {
      await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stars: newStars })
      })
      // Realtime listener will update automatically
    } catch (error) {
      console.error('Failed to update stars:', error)
    } finally {
      setUpdatingStars(null)
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
      // Realtime listener will update automatically
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

  const handleDeleteStudent = (userId: string, studentName: string) => {
    setDeleteConfirm({ userId, studentName })
  }

  const confirmDeleteFirst = () => {
    if (deleteConfirm) {
      setDeleteSecondConfirm(deleteConfirm)
      setDeleteConfirm(null)
    }
  }

  const confirmDeleteSecond = async () => {
    if (deleteSecondConfirm) {
      const { userId, studentName } = deleteSecondConfirm
      setDeleteSecondConfirm(null)
      try {
        const res = await fetch('/api/users/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        })
        const data = await res.json()
        if (data.success) {
          setAlertMessage('Akun murid berhasil dihapus!')
          setAlertType('success')
          setShowAlert(true)
        } else {
          setAlertMessage('Gagal menghapus akun murid: ' + data.error)
          setAlertType('error')
          setShowAlert(true)
        }
      } catch (error) {
        console.error('Failed to delete student:', error)
        setAlertMessage('Terjadi kesalahan. Silakan coba lagi.')
        setAlertType('error')
        setShowAlert(true)
      }
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0 w-full sm:w-auto">
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
                        <div className="flex gap-2 flex-wrap">
                          <input
                            type="text"
                            value={editNameValue}
                            onChange={(e) => setEditNameValue(e.target.value)}
                            className="flex-1 min-w-[120px] px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                          {student.email && (
                            <p className="text-xs text-gray-400 truncate">{student.email}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditName(student)}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Edit Nama"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.id, student.name)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Hapus Akun"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleIncrementStars(student.id, student.stars, -0.5)}
                          disabled={updatingStars === student.id}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                            updatingStars === student.id
                              ? 'bg-gray-200 cursor-not-allowed'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {updatingStars === student.id ? (
                            <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                        <span className="w-12 text-center font-bold text-gray-800 text-sm">
                          {student.stars % 1 === 0 ? student.stars : student.stars.toFixed(1)}
                        </span>
                        <button
                          onClick={() => handleIncrementStars(student.id, student.stars, 0.5)}
                          disabled={updatingStars === student.id}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                            updatingStars === student.id
                              ? 'bg-gray-200 cursor-not-allowed'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {updatingStars === student.id ? (
                            <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <ChevronUp className="w-4 h-4 text-gray-600" />
                          )}
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

      {/* Custom Modals */}
      <ConfirmModal
        isOpen={deleteConfirm !== null}
        title="Hapus Akun Murid"
        message={`Apakah Anda yakin ingin menghapus akun murid "${deleteConfirm?.studentName}"? Tindakan ini tidak dapat dibatalkan.`}
        type="danger"
        onConfirm={confirmDeleteFirst}
        onCancel={() => setDeleteConfirm(null)}
        confirmText="Ya"
        cancelText="Batal"
      />

      <ConfirmModal
        isOpen={deleteSecondConfirm !== null}
        title="Konfirmasi Hapus"
        message={`KONFIRMASI: Anda akan menghapus "${deleteSecondConfirm?.studentName}" secara permanen. Lanjutkan?`}
        type="danger"
        onConfirm={confirmDeleteSecond}
        onCancel={() => setDeleteSecondConfirm(null)}
        confirmText="Ya, Hapus"
        cancelText="Batal"
      />

      <ConfirmModal
        isOpen={showAlert}
        title={alertType === 'success' ? 'Berhasil' : 'Error'}
        message={alertMessage}
        type={alertType === 'success' ? 'success' : 'danger'}
        onConfirm={() => setShowAlert(false)}
        onCancel={() => setShowAlert(false)}
        confirmText="OK"
        cancelText=""
      />
    </div>
  )
}
