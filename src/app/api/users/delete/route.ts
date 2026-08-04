import { NextRequest, NextResponse } from 'next/server'
import { getFirestore, doc, deleteDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user data to check role
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const userData = userDoc.data()
    if (userData.role !== 'STUDENT') {
      return NextResponse.json(
        { success: false, error: 'Can only delete student accounts' },
        { status: 403 }
      )
    }

    // Delete from Firestore
    await deleteDoc(doc(db, 'users', userId))

    // Note: Firebase Authentication deletion requires Firebase Admin SDK
    // For now, we delete from Firestore. The auth user can be deleted manually
    // from Firebase Console or we can set up Firebase Admin SDK later.

    return NextResponse.json({
      success: true,
      message: 'Student account deleted successfully from Firestore',
      deletedUserId: userId,
      note: 'Authentication user should be deleted from Firebase Console manually'
    })
  } catch (error) {
    console.error('Failed to delete student:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete student account' },
      { status: 500 }
    )
  }
}
