import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Return success - Firebase Client SDK will handle the actual email sending
    return NextResponse.json({
      message: 'Link reset password telah dikirim ke email Anda.'
    })
  } catch (error: any) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Gagal memproses permintaan reset password' },
      { status: 500 }
    )
  }
}
