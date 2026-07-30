'use client'

import { useState, useEffect, useRef } from 'react'
import { Trophy, Medal, Award, Crown, X } from 'lucide-react'
import confetti from 'canvas-confetti'

interface Student {
  id: string
  name: string
  stars: number
  photoUrl?: string
}

interface PodiumLeaderboardProps {
  students: Student[]
  onClose?: () => void
  isTeacher?: boolean
}

export default function PodiumLeaderboard({ students, onClose, isTeacher = false }: PodiumLeaderboardProps) {
  const [animationStage, setAnimationStage] = useState<'idle' | 'confetti' | 'third' | 'second' | 'spotlight' | 'spotlight-expand' | 'first' | 'rest'>('idle')
  const [showRest, setShowRest] = useState(false)
  const [showThird, setShowThird] = useState(false)
  const [showSecond, setShowSecond] = useState(false)
  const [showFirst, setShowFirst] = useState(false)
  const [showWinnerName, setShowWinnerName] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleResetStars = () => {
    if (confirm('Apakah Anda yakin ingin mereset semua bintang siswa? Tindakan ini tidak dapat dibatalkan.')) {
      // Call API to reset all stars
      fetch('/api/users/reset-stars', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            alert('Semua bintang berhasil direset!')
            // Refresh the leaderboard
            window.location.reload()
          } else {
            alert('Gagal mereset bintang. Silakan coba lagi.')
          }
        })
        .catch(err => {
          console.error('Error resetting stars:', err)
          alert('Terjadi kesalahan. Silakan coba lagi.')
        })
    }
  }

  useEffect(() => {
    if (students.length > 0) {
      startAnimation()
    }
  }, [students])

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio('/fixkahhoot.wav')
    audioRef.current.loop = true

    const handleBeforeUnload = () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden && audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      // Cleanup audio on unmount
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const startAnimation = async () => {
    // Reset all states
    setShowThird(false)
    setShowSecond(false)
    setShowFirst(false)
    setShowWinnerName(false)
    setShowRest(false)
    setAnimationStage('idle')

    // Play background music
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(err => {
        console.error('Failed to play audio:', err)
      })
    }

    await delay(500)

    // Stage 1: Show 3rd place
    setShowThird(true)
    setAnimationStage('third')
    await delay(4000)

    // Stage 2: Show 2nd place
    setShowSecond(true)
    setAnimationStage('second')
    await delay(2000)

    // Stage 3: Dramatic pause before juara 1 spotlight
    await delay(700)

    // Stage 4: Spotlight reveal - dark background with spotlight and golden "1"
    setAnimationStage('spotlight')
    await delay(1500)

    // Stage 5: Spotlight expands to reveal winner
    setAnimationStage('spotlight-expand')
    await delay(2000)

    // Stage 6: Show winner name and full podium with confetti
    setShowWinnerName(true)
    setShowFirst(true)
    setAnimationStage('first')
    await triggerConfetti()
    await delay(2000)

    // Stage 7: Show rest of rankings
    setAnimationStage('rest')
    await delay(1000)
    setShowRest(true)
  }

  const handleClose = () => {
    // Stop audio when closing
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    onClose?.()
  }

  const triggerConfetti = () => {
    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#22c55e', '#10b981', '#059669', '#16a34a']
      })
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#fbbf24', '#f59e0b', '#d97706', '#b45309']
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()
  }

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const getTop3 = () => {
    return students.slice(0, 3)
  }

  const getRest = () => {
    return students.slice(3)
  }

  const getPodiumHeight = (rank: number) => {
    switch (rank) {
      case 1: return 'h-48'
      case 2: return 'h-36'
      case 3: return 'h-24'
      default: return 'h-16'
    }
  }

  const getPodiumColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-amber-500'
      case 2: return 'from-gray-300 to-gray-400'
      case 3: return 'from-amber-500 to-orange-600'
      default: return 'from-green-400 to-emerald-500'
    }
  }

  const shouldShowPlace = (rank: number) => {
    if (rank === 3) return animationStage === 'third' || animationStage === 'second' || animationStage === 'first' || animationStage === 'rest'
    if (rank === 2) return animationStage === 'second' || animationStage === 'first' || animationStage === 'rest'
    if (rank === 1) return animationStage === 'first' || animationStage === 'rest'
    return true
  }

  const getPlaceAnimation = (rank: number) => {
    switch (rank) {
      case 3:
        return animationStage === 'third' || animationStage === 'second' || animationStage === 'first' || animationStage === 'rest'
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-20'
      case 2:
        return animationStage === 'second' || animationStage === 'first' || animationStage === 'rest'
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-20'
      case 1:
        return animationStage === 'first' || animationStage === 'rest'
          ? 'opacity-100 translate-y-0 scale-110'
          : 'opacity-0 translate-y-40 scale-0'
      default:
        return 'opacity-100 translate-y-0'
    }
  }

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-center">
        <p className="text-gray-500">Belum ada data siswa</p>
      </div>
    )
  }

  const top3 = getTop3()
  const rest = getRest()

  return (
    <div className={`p-6 min-h-[600px] transition-colors duration-1000 ${
      animationStage === 'spotlight' || animationStage === 'spotlight-expand'
        ? 'bg-emerald-900'
        : 'bg-gradient-to-br from-green-50 to-emerald-100'
    }`}>
      {/* Spotlight Overlay */}
      {(animationStage === 'spotlight' || animationStage === 'spotlight-expand') && top3[0] && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-emerald-900">
          {animationStage === 'spotlight' && (
            <div className="animate-spotlight-appear">
              <div className="relative">
                {/* Spotlight circle */}
                <div 
                  className="w-64 h-64 rounded-full flex items-center justify-center backdrop-blur-sm"
                  style={{
                    background: 'radial-gradient(circle, rgba(167, 243, 208, 0.3) 0%, rgba(6, 95, 70, 0.8) 100%)'
                  }}
                >
                  {/* Golden 1 */}
                  <span className="text-9xl font-bold text-yellow-400 animate-golden-pulse">1</span>
                </div>
              </div>
            </div>
          )}
          {animationStage === 'spotlight-expand' && (
            <div className="animate-spotlight-expand">
              <div className="relative">
                <div 
                  className="w-64 h-64 rounded-full flex items-center justify-center backdrop-blur-sm"
                  style={{
                    background: 'radial-gradient(circle, rgba(167, 243, 208, 0.3) 0%, rgba(6, 95, 70, 0.8) 100%)'
                  }}
                >
                  <span className="text-9xl font-bold text-yellow-400 animate-golden-pulse">1</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500 fill-yellow-500" />
          <h2 className={`text-2xl font-bold ${
            animationStage === 'spotlight' || animationStage === 'spotlight-expand'
              ? 'text-white'
              : 'text-gray-800'
          }`}>Peringkat Akhir</h2>
        </div>
        {onClose && (
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium text-gray-700 transition"
          >
            Tutup
          </button>
        )}
      </div>

      {/* Podium Section */}
      <div className="flex items-end justify-center gap-4 mb-8 min-h-[300px]">
        {/* 2nd Place */}
        {top3[1] && showSecond && (
          <div key="place-2" className="flex flex-col items-center animate-slide-up">
            <div className="mb-4 text-center">
              {top3[1].photoUrl ? (
                <img
                  src={top3[1].photoUrl}
                  alt={top3[1].name}
                  className="w-16 h-16 rounded-full object-cover mx-auto border-4 border-gray-300"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto border-4 border-gray-300">
                  {top3[1].name.charAt(0).toUpperCase()}
                </div>
              )}
              <p className="font-bold text-gray-800 mt-2">{top3[1].name}</p>
              <p className="text-sm text-gray-600">{top3[1].stars} bintang</p>
            </div>
            <div className={`w-24 bg-gradient-to-t ${getPodiumColor(2)} rounded-t-lg flex items-center justify-center`}>
              <Medal className="w-8 h-8 text-white fill-white" />
            </div>
            <div className="w-24 h-8 bg-gray-400 rounded-b-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">2</span>
            </div>
          </div>
        )}

        {/* 1st Place */}
        {top3[0] && showFirst && (
          <div key="place-1" className="flex flex-col items-center animate-scale-up">
            <Crown className="w-16 h-16 text-yellow-500 fill-yellow-500 mb-3 animate-bounce" />
            <div className="mb-4 text-center">
              {top3[0].photoUrl ? (
                <img
                  src={top3[0].photoUrl}
                  alt={top3[0].name}
                  className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-yellow-400 shadow-2xl"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto border-4 border-yellow-400 shadow-2xl">
                  {top3[0].name.charAt(0).toUpperCase()}
                </div>
              )}
              <p className={`font-bold mt-2 text-xl ${showWinnerName ? 'animate-winner-name-pop text-gray-800' : 'text-gray-800'}`}>
                {top3[0].name}
              </p>
              <p className="text-sm text-gray-600">{top3[0].stars} bintang</p>
            </div>
            <div className={`w-32 bg-gradient-to-t ${getPodiumColor(1)} rounded-t-lg flex items-center justify-center shadow-2xl`}>
              <Trophy className="w-12 h-12 text-white fill-white" />
            </div>
            <div className="w-32 h-10 bg-yellow-500 rounded-b-lg flex items-center justify-center shadow-2xl">
              <span className="text-white font-bold text-4xl">1</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {top3[2] && showThird && (
          <div key="place-3" className="flex flex-col items-center animate-slide-up">
            <div className="mb-4 text-center">
              {top3[2].photoUrl ? (
                <img
                  src={top3[2].photoUrl}
                  alt={top3[2].name}
                  className="w-16 h-16 rounded-full object-cover mx-auto border-4 border-amber-500"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto border-4 border-amber-500">
                  {top3[2].name.charAt(0).toUpperCase()}
                </div>
              )}
              <p className="font-bold text-gray-800 mt-2">{top3[2].name}</p>
              <p className="text-sm text-gray-600">{top3[2].stars} bintang</p>
            </div>
            <div className={`w-24 bg-gradient-to-t ${getPodiumColor(3)} rounded-t-lg flex items-center justify-center`}>
              <Award className="w-8 h-8 text-white fill-white" />
            </div>
            <div className="w-24 h-8 bg-amber-600 rounded-b-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">3</span>
            </div>
          </div>
        )}
      </div>

      {/* Rest of Rankings */}
      {showRest && rest.length > 0 && (
        <div className="space-y-2 transition-opacity duration-1000 opacity-100">
          {rest.map((student, index) => (
            <div
              key={student.id}
              className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                  {index + 4}
                </div>
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
                <p className="font-semibold text-gray-800">{student.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-green-600">{student.stars}</span>
                <span className="text-sm text-gray-500">bintang</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reset Button - Only for teachers */}
      {isTeacher && (
        <div className={`mt-8 pt-6 border-t border-gray-300 transition-opacity duration-1000 ${
          animationStage === 'rest' ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={handleResetStars}
            className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Reset Semua Bintang
          </button>
        </div>
      )}
    </div>
  )
}
