import { NextRequest, NextResponse } from 'next/server'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    const { name, email, username, password, role, teacherCode, photoUrl } = await request.json()

    if (!name || !email || !username || !password || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
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

    // Check if username already exists in Firestore
    const usernameDoc = await getDoc(doc(db, 'usernames', username))
    if (usernameDoc.exists()) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      )
    }

    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      username,
      role,
      stars: 0,
      photoUrl: photoUrl || null,
      createdAt: new Date().toISOString()
    })

    // Reserve username
    await setDoc(doc(db, 'usernames', username), {
      uid: user.uid
    })

    const userData = {
      id: user.uid,
      name,
      email,
      username,
      role,
      stars: 0,
      photoUrl: photoUrl || null
    }

    return NextResponse.json(
      { user: userData },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)

    if (error.code === 'auth/email-already-in-use') {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}
