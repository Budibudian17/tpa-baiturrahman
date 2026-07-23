import { NextRequest, NextResponse } from 'next/server'
import { doc, getDoc, deleteDoc, runTransaction } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportRef = doc(db, 'reports', params.id)
    const reportDoc = await getDoc(reportRef)

    if (!reportDoc.exists()) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    const reportData = reportDoc.data() as any

    // If report was approved, deduct stars from user
    if (reportData.status === 'APPROVED') {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', reportData.userId)
        const userDoc = await transaction.get(userRef)
        
        if (!userDoc.exists()) {
          throw new Error('User not found')
        }

        const userData = userDoc.data() as any
        const currentStars = userData.stars || 0

        transaction.delete(reportRef)
        transaction.update(userRef, { stars: Math.max(0, currentStars - reportData.stars) })
      })
    } else {
      await deleteDoc(reportRef)
    }

    return NextResponse.json({ message: 'Report deleted successfully' })
  } catch (error) {
    console.error('Failed to delete report:', error)
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    )
  }
}
