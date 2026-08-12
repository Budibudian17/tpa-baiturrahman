import { NextRequest, NextResponse } from 'next/server'
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    const triggerRef = doc(db, 'settings', 'leaderboardTrigger')
    await setDoc(triggerRef, {
      triggered: true,
      timestamp: Date.now()
    })

    return NextResponse.json({ success: true }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    })
  } catch (error) {
    console.error('Failed to trigger leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to trigger leaderboard' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const triggerRef = doc(db, 'settings', 'leaderboardTrigger')
    await deleteDoc(triggerRef)

    return NextResponse.json({ success: true }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    })
  } catch (error) {
    console.error('Failed to reset leaderboard trigger:', error)
    return NextResponse.json(
      { error: 'Failed to reset leaderboard trigger' },
      { status: 500 }
    )
  }
}
