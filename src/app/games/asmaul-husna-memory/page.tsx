'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react'
import { ASMAUL_HUSNA } from '@/data/asmaulHusnaData'

export const dynamic = 'force-dynamic'

const LEVEL_CONFIG = {
  easy: { cardCount: 5, name: 'Mudah' },
  medium: { cardCount: 10, name: 'Sedang' },
  hard: { cardCount: 20, name: 'Sulit' }
}

export default function AsmaulHusnaMemoryGame() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const level = searchParams.get('level') || 'easy'
  
  const [cards, setCards] = useState<any[]>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    initializeGame()
  }, [level])

  const initializeGame = () => {
    const config = LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] || LEVEL_CONFIG.easy
    
    // Randomly select Asmaul Husna based on level
    const shuffledAsma = [...ASMAUL_HUSNA].sort(() => Math.random() - 0.5)
    const selectedAsma = shuffledAsma.slice(0, config.cardCount)
    
    // Create pairs: each Asmaul Husna has 2 cards (arabic and meaning)
    let gameCards: any[] = []
    selectedAsma.forEach((asma, index) => {
      // Arabic card
      gameCards.push({
        id: index * 2,
        pairId: index,
        content: asma.arabic,
        type: 'arabic',
        isFlipped: false,
        isMatched: false
      })
      // Meaning card
      gameCards.push({
        id: index * 2 + 1,
        pairId: index,
        content: asma.meaning,
        type: 'meaning',
        isFlipped: false,
        isMatched: false
      })
    })

    // Shuffle cards
    gameCards = gameCards.sort(() => Math.random() - 0.5)
    setCards(gameCards)
    setFlipped([])
    setMatched([])
    setMoves(0)
    setGameOver(false)
  }

  const handleCardClick = (index: number) => {
    if (flipped.length === 2) return
    if (flipped.includes(index)) return
    if (matched.includes(index)) return

    const newFlipped = [...flipped, index]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(moves + 1)
      const [first, second] = newFlipped
      const firstCard = cards[first]
      const secondCard = cards[second]

      if (firstCard.pairId === secondCard.pairId) {
        // Match found
        setMatched([...matched, first, second])
        setFlipped([])

        // Check if game is over
        if (matched.length + 2 === cards.length) {
          setGameOver(true)
        }
      } else {
        // No match, flip back after delay
        setTimeout(() => {
          setFlipped([])
        }, 1000)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/games/asmaul-husna-memory/level')}
            className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
              <span className="text-gray-600">Langkah: </span>
              <span className="font-bold text-green-600">{moves}</span>
            </div>
            <button
              onClick={initializeGame}
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition"
              title="Main Ulang"
            >
              <RotateCcw className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Game Over Modal */}
        {gameOver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Selamat!</h2>
              <p className="text-gray-600 mb-4">Kamu berhasil menyelesaikan game dengan {moves} langkah!</p>
              <button
                onClick={initializeGame}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition"
              >
                Main Lagi
              </button>
            </div>
          </div>
        )}

        {/* Game Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Asmaul Husna Memory</h1>
          <p className="text-gray-600">Cocokkan nama Arab dengan artinya!</p>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-5 gap-3">
          {cards.map((card, index) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(index)}
              className={`aspect-square rounded-xl font-bold text-center transition-all duration-300 ${
                flipped.includes(index) || matched.includes(index)
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                  : 'bg-white text-gray-800 hover:bg-green-50'
              } ${matched.includes(index) ? 'opacity-50' : ''}`}
              disabled={matched.includes(index)}
            >
              <div className="flex items-center justify-center h-full p-2">
                {flipped.includes(index) || matched.includes(index) ? (
                  <span className={`text-sm ${card.type === 'arabic' ? 'text-lg font-arabic' : 'text-xs'}`}>
                    {card.content}
                  </span>
                ) : (
                  <span className="text-2xl">?</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-2">Cara Bermain:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Klik kartu untuk melihat isinya</li>
            <li>• Cocokkan nama Arab dengan artinya</li>
            <li>• Selesaikan dengan langkah sesedikit mungkin</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
