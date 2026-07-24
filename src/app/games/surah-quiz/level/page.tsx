'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Star, Zap, Flame } from 'lucide-react'

export default function SurahQuizLevelPage() {
  const router = useRouter()

  const levels = [
    {
      id: 'easy',
      title: 'Mudah',
      description: 'Surah pendek dan populer',
      icon: <Star className="w-12 h-12" />,
      color: 'from-green-500 to-emerald-600',
      questions: 10,
      totalSurah: 50
    },
    {
      id: 'medium',
      title: 'Sedang',
      description: 'Surah menengah',
      icon: <Zap className="w-12 h-12" />,
      color: 'from-yellow-500 to-orange-500',
      questions: 10,
      totalSurah: 50
    },
    {
      id: 'hard',
      title: 'Sulit',
      description: 'Surah panjang dan jarang',
      icon: <Flame className="w-12 h-12" />,
      color: 'from-red-500 to-pink-600',
      questions: 10,
      totalSurah: 50
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/games')}
            className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-3 rounded-xl">
              <Star className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Tebak Surah</h1>
              <p className="text-gray-600">Pilih tingkat kesulitan</p>
            </div>
          </div>
        </div>

        {/* Levels Grid */}
        <div className="grid grid-cols-1 gap-6">
          {levels.map(level => (
            <button
              key={level.id}
              onClick={() => router.push(`/games/surah-quiz?level=${level.id}`)}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all hover:scale-105 p-8 text-left"
            >
              <div className="flex items-center gap-6">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${level.color} flex items-center justify-center text-white`}>
                  {level.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{level.title}</h3>
                  <p className="text-gray-600 mb-3">{level.description}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                      {level.questions} soal
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                      {level.totalSurah} surah
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3">Cara Bermain:</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Pilih tingkat kesulitan yang sesuai</li>
            <li>• Jawab 10 soal yang dipilih secara acak</li>
            <li>• Setiap level memiliki 50+ surah berbeda</li>
            <li>• Dapatkan skor setinggi mungkin!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
