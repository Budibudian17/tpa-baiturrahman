'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, RotateCcw, Trophy, CheckCircle, XCircle } from 'lucide-react'
import { SURAH_DATA } from '@/data/surahData'

export const dynamic = 'force-dynamic'

export default function SurahQuizGame() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const level = searchParams.get('level') || 'easy'

  const [questions, setQuestions] = useState<any[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  useEffect(() => {
    const surahData = SURAH_DATA[level as keyof typeof SURAH_DATA] || SURAH_DATA.easy
    const shuffled = [...surahData].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, 10)

    const questionsWithOptions = selected.map(surah => {
      const otherSurahs = shuffled.filter(s => s.name !== surah.name)
      const randomOthers = otherSurahs.sort(() => Math.random() - 0.5).slice(0, 3)
      const options = [surah, ...randomOthers].sort(() => Math.random() - 0.5).map(s => s.name)

      // Randomly select a verse from the surah's verses
      const randomVerse = surah.verses[Math.floor(Math.random() * surah.verses.length)]

      return {
        ...surah,
        verse: randomVerse,
        options
      }
    })

    setQuestions(questionsWithOptions)
  }, [level])

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer)
    const correct = answer === questions[currentQuestion].name
    setIsCorrect(correct)

    if (correct) {
      setScore(score + 1)
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
        setIsCorrect(null)
      } else {
        setShowResult(true)
      }
    }, 1500)
  }

  const resetGame = () => {
    setCurrentQuestion(0)
    setScore(0)
    setShowResult(false)
    setSelectedAnswer(null)
    setIsCorrect(null)
    // Re-shuffle questions
    const surahData = SURAH_DATA[level as keyof typeof SURAH_DATA] || SURAH_DATA.easy
    const shuffled = [...surahData].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, 10)

    const questionsWithOptions = selected.map(surah => {
      const otherSurahs = shuffled.filter(s => s.name !== surah.name)
      const randomOthers = otherSurahs.sort(() => Math.random() - 0.5).slice(0, 3)
      const options = [surah, ...randomOthers].sort(() => Math.random() - 0.5).map(s => s.name)

      // Randomly select a verse from the surah's verses
      const randomVerse = surah.verses[Math.floor(Math.random() * surah.verses.length)]

      return {
        ...surah,
        verse: randomVerse,
        options
      }
    })

    setQuestions(questionsWithOptions)
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.push('/games/surah-quiz/level')}
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Tebak Surah</h1>
          </div>

          <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Selesai!</h2>
            <p className="text-gray-600 mb-4">Skor kamu: {score} / {questions.length}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition"
              >
                Main Lagi
              </button>
              <button
                onClick={() => router.push('/games/surah-quiz/level')}
                className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Ganti Level
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat soal...</p>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/games/surah-quiz/level')}
            className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
              <span className="text-gray-600">Soal: </span>
              <span className="font-bold text-green-600">{currentQuestion + 1}/{questions.length}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
              <span className="text-gray-600">Skor: </span>
              <span className="font-bold text-green-600">{score}</span>
            </div>
            <button
              onClick={resetGame}
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition"
              title="Main Ulang"
            >
              <RotateCcw className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Game Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Tebak Surah</h1>
          <p className="text-gray-600">Tebak nama surah dari ayat pertamanya!</p>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-4">Ayat:</p>
            <p className="text-3xl font-arabic text-gray-800 leading-relaxed">
              {question.verse}
            </p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4">
            {question.options.map((option: string) => (
              <button
                key={option}
                onClick={() => !selectedAnswer && handleAnswer(option)}
                disabled={!!selectedAnswer}
                className={`p-4 rounded-xl font-semibold text-center transition-all ${
                  selectedAnswer === option
                    ? isCorrect
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-green-100'
                } ${!selectedAnswer ? 'hover:scale-105' : ''}`}
              >
                {selectedAnswer === option && isCorrect && (
                  <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                )}
                {selectedAnswer === option && !isCorrect && (
                  <XCircle className="w-6 h-6 mx-auto mb-2" />
                )}
                {option}
              </button>
            ))}
          </div>

          {/* Feedback */}
          {isCorrect !== null && (
            <div className={`mt-6 p-4 rounded-lg text-center flex items-center justify-center gap-2 ${
              isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isCorrect ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Benar!
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  Salah! Jawaban yang benar: {question.name}
                </>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-2">Cara Bermain:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Baca ayat pertama yang ditampilkan</li>
            <li>• Pilih nama surah yang sesuai</li>
            <li>• Dapatkan skor setinggi mungkin!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
