'use client'

import { useState, useEffect } from 'react'
import { Trophy, Medal, Award } from 'lucide-react'

interface Student {
  id: string
  name: string
  stars: number
}

export default function Leaderboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      console.log('Fetching leaderboard...')
      const res = await fetch('/api/users?role=STUDENT&sortBy=stars')
      const data = await res.json()
      console.log('Leaderboard response:', data)
      setStudents(data.users || [])
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500 fill-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400 fill-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600 fill-amber-600" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center font-bold text-gray-600">{rank}</span>
    }
  }

  const getRankBackground = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
      default:
        return 'bg-white border-gray-200'
    }
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
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-bold text-gray-800">Leaderboard Bulan Ini</h2>
      </div>

      {students.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Belum ada data siswa</p>
      ) : (
        <div className="space-y-3">
          {students.map((student, index) => (
            <div
              key={student.id}
              className={`flex items-center justify-between p-4 rounded-xl border-2 ${getRankBackground(index + 1)}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10">
                  {getRankIcon(index + 1)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{student.name}</p>
                  <p className="text-sm text-gray-500">Peringkat #{index + 1}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">{student.stars}</p>
                <p className="text-xs text-gray-500">bintang</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
