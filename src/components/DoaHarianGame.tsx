'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowRight, Check, X, RotateCcw, Play, Star, SkipForward } from 'lucide-react'
import { Doa, getRandomDoas } from '@/data/doaDatabase'

interface WordPiece {
  id: string
  word: string
  isPlaced: boolean
  correctPosition: number
}

interface Question {
  doa: Doa
  words: WordPiece[]
  placedWords: string[]
}

export default function DoaHarianGame() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [draggedWord, setDraggedWord] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)
  const dragItemRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeGame()
  }, [])

  const initializeGame = () => {
    const randomDoas = getRandomDoas(10)
    const gameQuestions: Question[] = randomDoas.map(doa => {
      // Split arabic text into words and shuffle
      const words = doa.arabic.split(' ').filter(w => w.length > 0)
      const shuffledWords = [...words].sort(() => Math.random() - 0.5)
      
      const wordPieces: WordPiece[] = shuffledWords.map((word, index) => ({
        id: `word-${index}`,
        word,
        isPlaced: false,
        correctPosition: words.indexOf(word)
      }))

      return {
        doa,
        words: wordPieces,
        placedWords: []
      }
    })

    setQuestions(gameQuestions)
    setCurrentQuestionIndex(0)
    setScore(0)
    setCompleted(false)
    setDraggedWord(null)
    setFeedback(null)
    setShowAnswer(false)
  }

  const currentQuestion = questions[currentQuestionIndex]

  const handleDragStart = (e: React.DragEvent, word: string, wordId: string) => {
    if (feedback || showAnswer) {
      e.preventDefault()
      return
    }

    const wordPiece = currentQuestion.words.find(w => w.id === wordId)
    if (!wordPiece || wordPiece.isPlaced) {
      e.preventDefault()
      return
    }

    setDraggedWord(word)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setDraggedWord(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault()
    
    if (feedback || !draggedWord) return

    const wordPiece = currentQuestion.words.find(w => w.word === draggedWord)
    if (!wordPiece) return

    // Update placed words
    const newPlacedWords = [...currentQuestion.placedWords]
    newPlacedWords[slotIndex] = draggedWord

    // Update word piece status
    const updatedWords = currentQuestion.words.map(w =>
      w.id === wordPiece.id ? { ...w, isPlaced: true } : w
    )

    // Update question
    const updatedQuestions = [...questions]
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      words: updatedWords,
      placedWords: newPlacedWords
    }

    setQuestions(updatedQuestions)
    setDraggedWord(null)

    // Check if all words are placed
    if (newPlacedWords.filter(w => w).length === currentQuestion.words.length) {
      checkAnswer(newPlacedWords)
    }
  }

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent, word: string, wordId: string) => {
    if (feedback || showAnswer) return

    const wordPiece = currentQuestion.words.find(w => w.id === wordId)
    if (!wordPiece || wordPiece.isPlaced) return

    setDraggedWord(word)
    
    // Create visual feedback
    const touch = e.touches[0]
    if (dragItemRef.current) {
      dragItemRef.current.style.position = 'fixed'
      dragItemRef.current.style.left = `${touch.clientX - 50}px`
      dragItemRef.current.style.top = `${touch.clientY - 20}px`
      dragItemRef.current.style.zIndex = '1000'
      dragItemRef.current.style.pointerEvents = 'none'
      dragItemRef.current.textContent = word
      dragItemRef.current.style.display = 'block'
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggedWord || !dragItemRef.current) return

    const touch = e.touches[0]
    dragItemRef.current.style.left = `${touch.clientX - 50}px`
    dragItemRef.current.style.top = `${touch.clientY - 20}px`
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!draggedWord || !dragItemRef.current) return

    // Hide drag item
    dragItemRef.current.style.display = 'none'

    // Find which slot was touched
    const touch = e.changedTouches[0]
    const element = document.elementFromPoint(touch.clientX, touch.clientY)
    const slotElement = element?.closest('[data-slot-index]')
    
    if (slotElement) {
      const slotIndex = parseInt(slotElement.getAttribute('data-slot-index') || '0')
      handleDrop(e as any, slotIndex)
    }

    setDraggedWord(null)
  }

  const handleRemoveWord = (slotIndex: number) => {
    if (feedback || showAnswer) return

    const wordToRemove = currentQuestion.placedWords[slotIndex]
    if (!wordToRemove) return

    const wordPiece = currentQuestion.words.find(w => w.word === wordToRemove)
    if (!wordPiece) return

    // Update placed words
    const newPlacedWords = [...currentQuestion.placedWords]
    newPlacedWords[slotIndex] = ''

    // Update word piece status
    const updatedWords = currentQuestion.words.map(w =>
      w.id === wordPiece.id ? { ...w, isPlaced: false } : w
    )

    // Update question
    const updatedQuestions = [...questions]
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      words: updatedWords,
      placedWords: newPlacedWords
    }

    setQuestions(updatedQuestions)
  }

  const handleSkip = () => {
    setShowAnswer(true)
    setFeedback({ type: 'error', message: 'Jawaban dilewati. Tidak ada poin.' })
  }

  const checkAnswer = (placedWords: string[]) => {
    const correctOrder = currentQuestion.doa.arabic.split(' ').filter(w => w.length > 0)
    const isCorrect = placedWords.join(' ') === correctOrder.join(' ')

    if (isCorrect) {
      setFeedback({ type: 'success', message: 'Masya Allah! Benar!' })
      setScore(prev => prev + 10)
    } else {
      setFeedback({ type: 'error', message: 'Masih salah, coba lagi.' })
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setFeedback(null)
      setDraggedWord(null)
      setShowAnswer(false)
    } else {
      setCompleted(true)
    }
  }

  const handleRetry = () => {
    // Reset current question
    const updatedQuestions = [...questions]
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      words: currentQuestion.words.map(w => ({ ...w, isPlaced: false })),
      placedWords: []
    }

    setQuestions(updatedQuestions)
    setFeedback(null)
    setDraggedWord(null)
    setShowAnswer(false)
  }

  const resetGame = () => {
    initializeGame()
  }

  if (completed) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-center">
        <div className="flex justify-center mb-4">
          <Star className="w-16 h-16 text-yellow-500 fill-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Selamat!</h2>
        <p className="text-gray-600 mb-4">Kamu telah menyelesaikan semua soal.</p>
        <div className="text-4xl font-bold text-green-600 mb-6">{score} Poin</div>
        <button
          onClick={resetGame}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition flex items-center gap-2 mx-auto"
        >
          <RotateCcw className="w-5 h-5" />
          Main Lagi
        </button>
      </div>
    )
  }

  if (!currentQuestion) {
    return <div className="text-center py-8">Loading...</div>
  }

  const correctOrder = currentQuestion.doa.arabic.split(' ').filter(w => w.length > 0)

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Drag item for touch */}
      <div
        ref={dragItemRef}
        className="hidden bg-purple-100 border-2 border-purple-400 text-purple-800 px-4 py-2 rounded-lg text-sm font-medium"
      />

      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <span className="font-bold text-gray-800">{score} Poin</span>
        </div>
        <div className="text-sm text-gray-600">
          {currentQuestionIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div 
          className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Doa Info */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4 mb-6">
        <h3 className="font-bold text-gray-800 text-lg mb-2">{currentQuestion.doa.name}</h3>
        <p className="text-sm text-gray-600 mb-2">Tarik kata-kata ke slot yang benar:</p>
        <p className="text-xs text-gray-500 italic">{currentQuestion.doa.meaning}</p>
      </div>

      {/* Answer Slots */}
      <div className="flex flex-wrap gap-2 mb-6 min-h-[60px]">
        {correctOrder.map((_, index) => (
          <div
            key={`slot-${index}`}
            data-slot-index={index}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onClick={() => handleRemoveWord(index)}
            className={`w-24 h-12 border-2 rounded-lg flex items-center justify-center text-sm font-medium transition cursor-pointer ${
              currentQuestion.placedWords[index]
                ? 'bg-green-100 border-green-300 text-green-800'
                : 'bg-gray-50 border-gray-300 text-gray-400'
            } ${feedback || showAnswer ? 'cursor-not-allowed' : ''}`}
          >
            {currentQuestion.placedWords[index] || ''}
          </div>
        ))}
      </div>

      {/* Word Pieces */}
      <div className="flex flex-wrap gap-2 mb-6">
        {currentQuestion.words.map((wordPiece) => (
          <div
            key={wordPiece.id}
            draggable
            onDragStart={(e) => handleDragStart(e, wordPiece.word, wordPiece.id)}
            onDragEnd={handleDragEnd}
            onTouchStart={(e) => handleTouchStart(e, wordPiece.word, wordPiece.id)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-grab ${
              wordPiece.isPlaced
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border-2 border-gray-300 hover:border-green-400 text-gray-800'
            } ${feedback || showAnswer ? 'cursor-not-allowed' : ''}`}
          >
            {wordPiece.word}
          </div>
        ))}
      </div>

      {/* Answer Display (when skipped) */}
      {showAnswer && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">Jawaban yang Benar:</h4>
          <p className="text-2xl text-gray-700 mb-2 text-right" dir="rtl">{currentQuestion.doa.arabic}</p>
          <p className="text-sm text-gray-600 italic mb-1">{currentQuestion.doa.latin}</p>
          <p className="text-sm text-gray-700">{currentQuestion.doa.meaning}</p>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className={`rounded-lg p-4 mb-4 flex items-center gap-3 ${
          feedback.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          {feedback.type === 'success' ? (
            <Check className="w-6 h-6 text-green-600" />
          ) : (
            <X className="w-6 h-6 text-red-600" />
          )}
          <p className={`font-medium ${
            feedback.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {feedback.message}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!feedback && !showAnswer && (
          <button
            onClick={handleSkip}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2"
          >
            <SkipForward className="w-5 h-5" />
            Lihat Jawaban
          </button>
        )}

        {feedback?.type === 'error' && !showAnswer && (
          <button
            onClick={handleRetry}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Coba Lagi
          </button>
        )}

        {(feedback?.type === 'success' || showAnswer) && (
          <button
            onClick={handleNext}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition flex items-center justify-center gap-2"
          >
            {currentQuestionIndex < questions.length - 1 ? (
              <>
                Selanjutnya
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              'Selesai'
            )}
          </button>
        )}
      </div>
    </div>
  )
}
