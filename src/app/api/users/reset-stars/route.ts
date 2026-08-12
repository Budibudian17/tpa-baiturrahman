import { NextRequest, NextResponse } from 'next/server'
import { getFirestore, writeBatch, getDocs, collection, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    const batch = writeBatch(db)
    
    // Get all users with role STUDENT
    const usersRef = collection(db, 'users')
    const snapshot = await getDocs(usersRef)
    
    let count = 0
    snapshot.forEach((docSnapshot) => {
      const userData = docSnapshot.data()
      if (userData.role === 'STUDENT') {
        const userRef = doc(db, 'users', docSnapshot.id)
        batch.update(userRef, { stars: 0 })
        count++
      }
    })
    
    if (count === 0) {
      return NextResponse.json({ success: false, message: 'No students found' })
    }
    
    await batch.commit()

    return NextResponse.json({ success: true, message: `Reset ${count} students' stars` }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    })
  } catch (error) {
    console.error('Failed to reset stars:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to reset stars' },
      { status: 500 }
    )
  }
}
