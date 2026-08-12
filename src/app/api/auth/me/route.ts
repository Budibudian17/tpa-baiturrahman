import { NextRequest, NextResponse } from 'next/server'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value

    console.log('Session cookie:', session)

    if (!session) {
      console.log('No session cookie found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const sessionData = JSON.parse(session)
    const userId = sessionData.id

    console.log('Session data:', sessionData)
    console.log('User ID:', userId)

    if (!userId) {
      console.log('No user ID in session')
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    const userDoc = await getDoc(doc(db, 'users', userId))

    if (!userDoc.exists()) {
      console.log('User not found in Firestore:', userId)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userData = userDoc.data() as any

    console.log('User data from Firestore:', userData)

    // Cache for 60 seconds, stale-while-revalidate for 300 seconds
    return NextResponse.json({
      id: userDoc.id,
      name: userData.name,
      username: userData.username,
      role: userData.role,
      stars: userData.stars,
      photoUrl: userData.photoUrl || null
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    })
  } catch (error) {
    console.error('Failed to fetch current user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}
