import { NextRequest, NextResponse } from 'next/server'
import { collection, query, where, orderBy, getDocs, addDoc, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    console.log('Fetching reports with userId:', userId, 'status:', status)

    let q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'))

    if (userId) {
      console.log('Filtering by userId:', userId)
      q = query(collection(db, 'reports'), where('userId', '==', userId), orderBy('createdAt', 'desc'))
    }

    if (status) {
      console.log('Filtering by status:', status)
      q = query(collection(db, 'reports'), where('status', '==', status), orderBy('createdAt', 'desc'))
    }

    console.log('Executing query...')
    const querySnapshot = await getDocs(q)
    console.log('Query executed, docs count:', querySnapshot.docs.length)

    const reports = []

    for (const reportDoc of querySnapshot.docs) {
      const reportData = reportDoc.data()
      console.log('Processing report:', reportDoc.id, 'userId:', reportData.userId)

      const userDoc = await getDoc(doc(db, 'users', reportData.userId))
      const userData = userDoc.data() as any

      reports.push({
        id: reportDoc.id,
        ...reportData,
        user: userData ? {
          id: reportData.userId,
          name: userData.name,
          photoUrl: userData.photoUrl || null
        } : null
      })
    }

    console.log('Returning reports:', reports.length)
    return NextResponse.json({ reports })
  } catch (error) {
    console.error('Failed to fetch reports:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, userId, location, prayerTime, category, surahName, startVerse, endVerse, description, photoUrl, stars } = body

    if (!type || !userId || !stars || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const reportData = {
      type,
      userId,
      location: location || null,
      prayerTime: prayerTime || null,
      category: category || null,
      surahName: surahName || null,
      startVerse: startVerse || null,
      endVerse: endVerse || null,
      description: description || null,
      photoUrl: photoUrl || null,
      stars,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    }

    const docRef = await addDoc(collection(db, 'reports'), reportData)

    return NextResponse.json({ report: { id: docRef.id, ...reportData } }, { status: 201 })
  } catch (error) {
    console.error('Failed to create report:', error)
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    )
  }
}
