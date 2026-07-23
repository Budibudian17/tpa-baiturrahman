import { NextRequest, NextResponse } from 'next/server'
import { collection, addDoc, doc, runTransaction } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, type, surahName, verse, asmaulHusnaCount, photoUrl, teacherId } = body

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const session = request.cookies.get('session')?.value
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = JSON.parse(session)
    const finalTeacherId = teacherId || user.id

    // Calculate stars based on type
    let finalStars = 0
    if (type === 'QURAN') {
      if (!surahName || !verse) {
        return NextResponse.json(
          { error: 'Missing required fields for Quran memorization' },
          { status: 400 }
        )
      }
      // 1.5 stars with photo, 1 star without
      finalStars = photoUrl ? 1.5 : 1
    } else if (type === 'ASMAUL_HUSNA') {
      if (!asmaulHusnaCount) {
        return NextResponse.json(
          { error: 'Missing required fields for Asmaul Husna' },
          { status: 400 }
        )
      }
      // Calculate stars: every 10 Asmaul Husna = 1 star
      const count = parseInt(asmaulHusnaCount)
      finalStars = Math.floor(count / 10)
    }

    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, 'users', userId)
      const userDoc = await transaction.get(userRef)
      
      if (!userDoc.exists()) {
        throw new Error('User not found')
      }

      const userData = userDoc.data() as any
      const currentStars = userData.stars || 0

      const memorizationRef = doc(collection(db, 'memorizations'))
      transaction.set(memorizationRef, {
        userId,
        type,
        surahName: type === 'QURAN' ? surahName : null,
        verse: type === 'QURAN' ? verse : null,
        asmaulHusnaCount: type === 'ASMAUL_HUSNA' ? parseInt(asmaulHusnaCount) : null,
        stars: finalStars,
        teacherId: finalTeacherId,
        photoUrl: photoUrl || null,
        createdAt: new Date().toISOString()
      })

      transaction.update(userRef, { stars: currentStars + finalStars })
    })

    return NextResponse.json(
      { message: 'Memorization recorded successfully', stars: finalStars },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to create memorization:', error)
    return NextResponse.json(
      { error: 'Failed to create memorization' },
      { status: 500 }
    )
  }
}
