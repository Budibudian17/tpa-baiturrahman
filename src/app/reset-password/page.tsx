'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { confirmPasswordReset } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [oobCode, setOobCode] = useState<string | null>(null)

  useEffect(() => {
    // Get the oobCode from the URL (Firebase Auth reset code)
    const code = searchParams.get('oobCode')
    if (!code) {
      setError('Link reset password tidak valid atau sudah kadaluarsa.')
    } else {
      setOobCode(code)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!oobCode) {
      setError('Link reset password tidak valid atau sudah kadaluarsa.')
      return
    }

    if (newPassword.length < 6) {
      setError('Password harus minimal 6 karakter.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Password tidak cocok.')
      return
    }

    setLoading(true)

    try {
      await confirmPasswordReset(auth, oobCode, newPassword)
      router.push('/login')
    } catch (err: any) {
      console.error('Reset password error:', err)
      if (err.code === 'auth/expired-action-code') {
        setError('Link reset password sudah kadaluarsa. Silakan minta link baru.')
      } else if (err.code === 'auth/invalid-action-code') {
        setError('Link reset password tidak valid. Silakan minta link baru.')
      } else if (err.code === 'auth/weak-password') {
        setError('Password terlalu lemah. Gunakan password yang lebih kuat.')
      } else {
        setError('Gagal mereset password. Silakan coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4">
              <img
                src="/img/tpabaiturrahmanlogo.webp"
                alt="TPA Baiturrahman Logo"
                width={120}
                height={120}
                className="w-32 h-32 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.parentElement?.querySelector('.emoji-fallback');
                  if (fallback) {
                    (fallback as HTMLElement).style.display = 'flex';
                  }
                }}
              />
              <div className="emoji-fallback w-32 h-32 flex items-center justify-center hidden">
                <span className="text-6xl">🕌</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
            <p className="text-gray-600 mt-2 text-center">Masukkan password baru Anda</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Password Baru
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-800 placeholder-gray-400"
                placeholder="Masukkan password baru"
                required
                disabled={!oobCode}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-800 placeholder-gray-400"
                placeholder="Konfirmasi password baru"
                required
                disabled={!oobCode}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !oobCode}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Memproses...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Ingat password?{' '}
              <a href="/login" className="text-green-600 hover:text-green-700 font-medium">
                Kembali ke Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
