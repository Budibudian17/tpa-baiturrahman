import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { adminApp } from '@/lib/firebase-admin'
import nodemailer from 'nodemailer'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Generate password reset link using Firebase Admin SDK
    const auth = getAuth(adminApp)
    const resetLink = await auth.generatePasswordResetLink(email, {
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`
    })

    // Read logo file for inline attachment
    const logoPath = join(process.cwd(), 'public', 'img', 'tpabaiturrahmanlogo.webp')
    const logoBuffer = await readFile(logoPath)

    // Create Nodemailer transporter with Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    })

    // Send email using Nodemailer with Firebase reset link and inline logo
    await transporter.sendMail({
      from: `"TPA Baiturrahman" <${process.env.GMAIL_EMAIL}>`,
      to: email,
      subject: 'Reset Password Akun TPA Baiturrahman',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="cid:logo" alt="TPA Baiturrahman Logo" style="width: 120px; height: 120px; margin-bottom: 10px;">
            <h2 style="color: #22c55e; margin: 0; font-size: 28px; font-weight: bold;">TPA Baiturrahman</h2>
          </div>
          
          <p style="font-size: 16px; color: #333;">Halo,</p>
          
          <p style="font-size: 16px; color: #333;">
            Anda telah meminta untuk mereset password akun TPA Baiturrahman Anda untuk email <strong>${email}</strong>.
          </p>
          
          <p style="font-size: 16px; color: #333;">
            Klik tombol di bawah ini untuk mereset password Anda:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: linear-gradient(to right, #22c55e, #10b981); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 16px;">
              Reset Password
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            Atau copy link ini ke browser: ${resetLink}
          </p>
          
          <p style="font-size: 14px; color: #666;">
            Jika Anda tidak meminta untuk mereset password, Anda dapat mengabaikan email ini.
          </p>
          
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="font-size: 14px; color: #856404; margin: 0;">
              <strong>⚠️ Penting:</strong> Jika email ini muncul di folder Spam atau Sampah, silakan pindahkan ke Inbox utama agar email dari kami tidak terblokir di masa depan.
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="font-size: 14px; color: #666; margin: 0;">
              Terima kasih,<br>
              <strong>Tim TPA Baiturrahman</strong>
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: 'tpabaiturrahmanlogo.webp',
          content: logoBuffer,
          cid: 'logo'
        }
      ]
    })

    return NextResponse.json({ 
      message: 'Link reset password telah dikirim ke email Anda.' 
    })
  } catch (error: any) {
    console.error('Forgot password error:', error)
    
    if (error.code === 'auth/user-not-found') {
      // For security, don't reveal if email exists or not
      return NextResponse.json({ 
        message: 'Jika email terdaftar, link reset password akan dikirim.' 
      })
    }
    
    return NextResponse.json(
      { error: 'Gagal memproses permintaan reset password' },
      { status: 500 }
    )
  }
}
