import { NextRequest, NextResponse } from 'next/server'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function GET(request: NextRequest) {
  try {
    console.log('Google auth check - Starting...')
    const { searchParams } = new URL(request.url)
    const uid = searchParams.get('uid')

    if (!uid) {
      return NextResponse.json(
        { error: 'UID is required' },
        { status: 400 }
      )
    }

    console.log('Google auth check - UID:', uid)
    console.log('Google auth check - DB initialized:', !!db)

    const userDoc = await getDoc(doc(db, 'users', uid))
    console.log('Google auth check - User doc exists:', userDoc.exists)

    if (userDoc.exists()) {
      const userData = userDoc.data() as any
      return NextResponse.json({
        exists: true,
        user: {
          id: uid,
          name: userData.name,
          username: userData.username,
          role: userData.role,
          stars: userData.stars
        }
      })
    }

    return NextResponse.json({ exists: false })
  } catch (error) {
    console.error('Google auth check error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { error: 'Failed to check user', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
