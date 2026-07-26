'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import DoaHarianGame from '@/components/DoaHarianGame'

export default function DoaHarianPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push('/games')}
            className="bg-white p-2 rounded-lg shadow-sm hover:bg-gray-50 transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Doa Harian</h1>
            <p className="text-sm text-gray-600">Latih hafalan doa dengan suara</p>
          </div>
        </div>

        {/* Game Component */}
        <DoaHarianGame />
      </div>
    </div>
  )
}
