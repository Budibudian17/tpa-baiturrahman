'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Gamepad2, BookOpen, Brain } from 'lucide-react'

export default function GamesPage() {
  const router = useRouter()

  const games = [
    {
      id: 'asmaul-husna-memory',
      title: 'Asmaul Husna Memory',
      description: 'Game kartu memori untuk belajar Asmaul Husna',
      icon: <Brain className="w-12 h-12" />,
      color: 'from-green-500 to-emerald-600',
      difficulty: 'Mudah',
      hasLevels: true
    },
    {
      id: 'surah-quiz',
      title: 'Tebak Surah',
      description: 'Tebak nama surah dari ayat pertamanya',
      icon: <BookOpen className="w-12 h-12" />,
      color: 'from-teal-500 to-cyan-600',
      difficulty: 'Sedang',
      hasLevels: true
    }
  ]

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
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl">
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Game Islami</h1>
              <p className="text-gray-600">Belajar sambil bermain</p>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {games.map(game => (
            <button
              key={game.id}
              onClick={() => {
                if (game.hasLevels) {
                  router.push(`/games/${game.id}/level`)
                } else {
                  router.push(`/games/${game.id}`)
                }
              }}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all hover:scale-105 p-6 text-left"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-white mb-4`}>
                {game.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{game.title}</h3>
              <p className="text-gray-600 mb-4">{game.description}</p>
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {game.difficulty}
              </span>
            </button>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm p-6 opacity-60">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Coming Soon</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-gray-500" />
              </div>
              <div>
                <p className="font-medium text-gray-700">Huruf Hijaiyah</p>
                <p className="text-sm text-gray-500">Matching Game</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-gray-500" />
              </div>
              <div>
                <p className="font-medium text-gray-700">Doa Harian</p>
                <p className="text-sm text-gray-500">Quiz Game</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
