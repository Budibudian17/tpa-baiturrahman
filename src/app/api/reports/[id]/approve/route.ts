import { NextRequest, NextResponse } from 'next/server'
import { doc, getDoc, updateDoc, runTransaction } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('Approving report with ID:', id)
    const reportRef = doc(db, 'reports', id)
    const reportDoc = await getDoc(reportRef)

    if (!reportDoc.exists()) {
      console.log('Report not found:', id)
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    const reportData = reportDoc.data() as any
    console.log('Report data:', reportData)

    if (reportData.status === 'APPROVED') {
      console.log('Report already approved')
      return NextResponse.json(
        { error: 'Report already approved' },
        { status: 400 }
      )
    }

    console.log('Starting transaction to approve report and update user stars')
    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, 'users', reportData.userId)
      const userDoc = await transaction.get(userRef)

      if (!userDoc.exists()) {
        console.log('User not found:', reportData.userId)
        throw new Error('User not found')
      }

      const userData = userDoc.data() as any
      const currentStars = userData.stars || 0
      console.log('Current user stars:', currentStars, 'Adding:', reportData.stars)

      transaction.update(reportRef, { status: 'APPROVED' })
      transaction.update(userRef, { stars: currentStars + reportData.stars })
    })

    console.log('Report approved successfully')
    return NextResponse.json({ message: 'Report approved successfully' })
  } catch (error) {
    console.error('Failed to approve report:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { error: 'Failed to approve report' },
      { status: 500 }
    )
  }
}
