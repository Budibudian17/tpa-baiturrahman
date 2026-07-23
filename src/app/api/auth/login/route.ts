import { NextRequest, NextResponse } from 'next/server'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username/email and password are required' },
        { status: 400 }
      )
    }

    // Check if input is an email or username
    let email
    if (username.includes('@')) {
      email = username // It's an email
    } else {
      email = `${username}@tpa-baiturrahman.app` // It's a username, construct email
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User data not found' },
        { status: 404 }
      )
    }

    const userData = userDoc.data() as any

    const responseUser = {
      id: user.uid,
      name: userData.name,
      username: userData.username,
      role: userData.role,
      stars: userData.stars,
      photoUrl: userData.photoUrl || null
    }

    const response = NextResponse.json({ user: responseUser })
    response.cookies.set('session', JSON.stringify(responseUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
      return NextResponse.json(
        { error: 'Invalid username/email or password' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
