import { NextRequest, NextResponse } from 'next/server'
import { collection, query, where, orderBy, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const sortBy = searchParams.get('sortBy')

    let q

    if (role && sortBy === 'stars') {
      // Filter by role and sort by stars
      q = query(collection(db, 'users'), where('role', '==', role), orderBy('stars', 'desc'))
    } else if (role) {
      // Filter by role only
      q = query(collection(db, 'users'), where('role', '==', role), orderBy('createdAt', 'desc'))
    } else if (sortBy === 'stars') {
      // Sort by stars only
      q = query(collection(db, 'users'), orderBy('stars', 'desc'))
    } else {
      // Default: sort by createdAt
      q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
    }

    const querySnapshot = await getDocs(q)
    const users = []

    for (const doc of querySnapshot.docs) {
      const userData = doc.data() as any
      users.push({
        id: doc.id,
        name: userData.name,
        username: userData.username,
        role: userData.role,
        stars: userData.stars,
        photoUrl: userData.photoUrl || null,
        createdAt: userData.createdAt
      })
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, photoUrl } = body

    console.log('PATCH /api/users - Request body:', { userId, name, photoUrl })

    if (!userId || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const session = request.cookies.get('session')?.value
    console.log('PATCH /api/users - Session cookie:', session)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = JSON.parse(session)
    console.log('PATCH /api/users - Parsed user:', user)

    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userData = userDoc.data() as any

    // Update user name and photo (removed cooldown for testing)
    await updateDoc(userRef, {
      name,
      photoUrl: photoUrl || userData.photoUrl
    })

    console.log('PATCH /api/users - User updated successfully')

    // Update session using response cookie
    const updatedUser = { ...user, name, photoUrl: photoUrl || userData.photoUrl }
    const response = NextResponse.json(
      { message: 'Profile updated successfully', name, photoUrl: photoUrl || userData.photoUrl },
      { status: 200 }
    )
    response.cookies.set('session', JSON.stringify(updatedUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}
