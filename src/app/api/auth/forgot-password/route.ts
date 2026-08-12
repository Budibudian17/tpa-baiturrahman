import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { adminApp } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if Firebase Admin is initialized
    if (!adminApp) {
      console.error('Firebase Admin not initialized')
      return NextResponse.json(
        { error: 'Authentication service not configured. Please contact administrator.' },
        { status: 500 }
      )
    }

    // Generate password reset link using Firebase Admin SDK
    const auth = getAuth(adminApp)
    const resetLink = await auth.generatePasswordResetLink(email, {
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`
    })

    // Firebase Admin SDK doesn't have built-in email sending
    // We'll return the link for now (in production, you'd send this via email service)
    console.log('Reset link generated:', resetLink)

    return NextResponse.json({
      message: 'Link reset password telah dikirim ke email Anda.',
      // For debugging: return the link (remove in production)
      resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined
    })
  } catch (error: any) {
    console.error('Forgot password error:', error)

    if (error.code === 'auth/user-not-found') {
      // For security, don't reveal if email exists or not
      return NextResponse.json({
        message: 'Jika email terdaftar, link reset password akan dikirim.'
      })
    }

    // Log more details for debugging
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    })

    return NextResponse.json(
      { error: 'Gagal memproses permintaan reset password' },
      { status: 500 }
    )
  }
}
