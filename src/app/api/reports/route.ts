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

    // Also fetch memorizations for the user (teacher evaluations)
    if (userId) {
      console.log('Fetching memorizations for userId:', userId)
      const memQ = query(collection(db, 'memorizations'), where('userId', '==', userId), orderBy('createdAt', 'desc'))
      const memSnapshot = await getDocs(memQ)
      console.log('Memorizations query executed, docs count:', memSnapshot.docs.length)

      for (const memDoc of memSnapshot.docs) {
        const memData = memDoc.data()
        console.log('Processing memorization:', memDoc.id, 'userId:', memData.userId)

        // Format memorization as a report
        let description = ''
        if (memData.type === 'QURAN') {
          description = `Hafal Surah ${memData.surahName} (Ayat ${memData.verse})`
        } else if (memData.type === 'ASMAUL_HUSNA') {
          description = `Hafal ${memData.asmaulHusnaCount} Asmaul Husna`
        }

        reports.push({
          id: memDoc.id,
          type: 'HAFALAN',
          userId: memData.userId,
          stars: memData.stars,
          status: 'APPROVED', // Teacher evaluations are automatically approved
          createdAt: memData.createdAt,
          description,
          surahName: memData.surahName,
          startVerse: memData.verse,
          endVerse: memData.verse,
          isFromTeacher: true, // Flag to indicate this is from teacher evaluation
          user: {
            id: memData.userId,
            name: '', // Will be filled from the first report's user data
            photoUrl: null
          }
        })
      }
    }

    // Sort all reports by createdAt
    reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

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
