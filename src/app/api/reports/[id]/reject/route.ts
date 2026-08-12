import { NextRequest, NextResponse } from 'next/server'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { reason } = await request.json()
    const reportRef = doc(db, 'reports', id)
    const reportDoc = await getDoc(reportRef)

    if (!reportDoc.exists()) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    const reportData = reportDoc.data() as any

    if (reportData.status === 'REJECTED') {
      return NextResponse.json(
        { error: 'Report already rejected' },
        { status: 400 }
      )
    }

    await updateDoc(reportRef, {
      status: 'REJECTED',
      rejectionReason: reason || null
    })

    return NextResponse.json({ message: 'Report rejected successfully' })
  } catch (error) {
    console.error('Failed to reject report:', error)
    return NextResponse.json(
      { error: 'Failed to reject report' },
      { status: 500 }
    )
  }
}
