import { NextRequest, NextResponse } from 'next/server'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userDoc = await getDoc(doc(db, 'users', id))

    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userData = userDoc.data() as any
    return NextResponse.json({
      id: userDoc.id,
      name: userData.name,
      username: userData.username,
      role: userData.role,
      stars: userData.stars,
      photoUrl: userData.photoUrl || null
    })
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { stars } = body

    if (typeof stars !== 'number' || stars < 0) {
      return NextResponse.json(
        { error: 'Invalid stars value' },
        { status: 400 }
      )
    }

    await updateDoc(doc(db, 'users', id), { stars })

    return NextResponse.json({ success: true, stars })
  } catch (error) {
    console.error('Failed to update user stars:', error)
    return NextResponse.json(
      { error: 'Failed to update user stars' },
      { status: 500 }
    )
  }
}
