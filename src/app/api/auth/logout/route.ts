import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    }
  })
  response.cookies.delete('session')
  return response
}
