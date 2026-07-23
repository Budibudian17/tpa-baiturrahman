import { NextRequest, NextResponse } from 'next/server'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const uid = searchParams.get('uid')

    if (!uid) {
      return NextResponse.json(
        { error: 'UID is required' },
        { status: 400 }
      )
    }

    console.log('Checking if user exists with UID:', uid)
    const userDoc = await getDoc(doc(db, 'users', uid))
    console.log('User doc exists:', userDoc.exists())

    if (userDoc.exists()) {
      const userData = userDoc.data() as any
      console.log('User data:', userData)
      return NextResponse.json({
        exists: true,
        user: {
          id: uid,
          name: userData.name,
          username: userData.username,
          role: userData.role,
          stars: userData.stars,
          photoUrl: userData.photoUrl || null
        }
      })
    }

    console.log('User does not exist')
    return NextResponse.json({ exists: false })
  } catch (error) {
    console.error('Google auth check error:', error)
    return NextResponse.json(
      { error: 'Failed to check user' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Google complete - Starting...')
    const { uid, displayName, email, photoURL, role, teacherCode } = await request.json()

    console.log('Google complete - UID:', uid)
    console.log('Google complete - Display name:', displayName)
    console.log('Google complete - Email:', email)
    console.log('Google complete - Role:', role)

    if (!uid || !displayName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Teacher code validation for teachers
    if (role === 'TEACHER') {
      if (!teacherCode) {
        return NextResponse.json(
          { error: 'Teachers must provide teacher code' },
          { status: 400 }
        )
      }

      // Validate teacher code against environment variable
      const validTeacherCode = process.env.TEACHER_SECRET_CODE || 'guruTpa_1998'
      if (teacherCode !== validTeacherCode) {
        return NextResponse.json(
          { error: 'Invalid teacher code' },
          { status: 401 }
        )
      }
    }

    // Generate username from email
    const username = email?.split('@')[0] || `user_${uid.slice(0, 8)}`
    console.log('Google complete - Username:', username)

    // Check if username already exists
    console.log('Google complete - Checking username existence...')
    const usernameDoc = await getDoc(doc(db, 'usernames', username))
    console.log('Google complete - Username exists:', usernameDoc.exists())

    if (usernameDoc.exists()) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      )
    }

    // Create user document
    console.log('Google complete - Creating user document...')
    await setDoc(doc(db, 'users', uid), {
      name: displayName,
      username,
      role,
      stars: 0,
      photoUrl: photoURL || null,
      createdAt: new Date().toISOString()
    })
    console.log('Google complete - User document created')

    // Reserve username
    console.log('Google complete - Reserving username...')
    await setDoc(doc(db, 'usernames', username), {
      uid
    })
    console.log('Google complete - Username reserved')

    const user = {
      id: uid,
      name: displayName,
      username,
      role,
      stars: 0,
      photoUrl: photoURL || null
    }

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Google registration error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { error: 'An error occurred during registration', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
