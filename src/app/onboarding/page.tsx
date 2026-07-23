'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { User, GraduationCap } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const [googleUser, setGoogleUser] = useState<any>(null)
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'TEACHER' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    console.log('Onboarding - Checking localStorage...')
    const storedUser = localStorage.getItem('google_user')
    console.log('Onboarding - Stored user:', storedUser)
    if (!storedUser) {
      console.log('Onboarding - No stored user, redirecting to login')
      router.push('/login')
      return
    }
    console.log('Onboarding - Parsing and setting google user')
    setGoogleUser(JSON.parse(storedUser))
  }, [router])

  const handleComplete = async () => {
    if (!selectedRole || !googleUser) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/google-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: googleUser.uid,
          displayName: googleUser.displayName,
          email: googleUser.email,
          photoURL: googleUser.photoURL,
          role: selectedRole
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      localStorage.removeItem('google_user')
      localStorage.setItem('session', JSON.stringify(data.user))
      // Set cookie for middleware (properly encoded)
      const sessionValue = encodeURIComponent(JSON.stringify(data.user))
      document.cookie = `session=${sessionValue}; path=/; max-age=604800; SameSite=Lax`
      router.push('/dashboard')
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Check if user already exists on mount
  useEffect(() => {
    const checkExistingUser = async () => {
      if (!googleUser) return

      try {
        console.log('Onboarding - Checking if user exists in Firestore...')
        const res = await fetch(`/api/auth/google-complete?uid=${googleUser.uid}`)
        const data = await res.json()

        console.log('Onboarding - User exists check:', data.exists)

        if (data.exists) {
          // User already exists, redirect to dashboard
          console.log('Onboarding - User exists, redirecting to dashboard')
          localStorage.removeItem('google_user')
          localStorage.setItem('session', JSON.stringify(data.user))
          // Set cookie for middleware (properly encoded)
          const sessionValue = encodeURIComponent(JSON.stringify(data.user))
          document.cookie = `session=${sessionValue}; path=/; max-age=604800; SameSite=Lax`
          router.push('/dashboard')
        }
      } catch (err) {
        console.error('Error checking existing user:', err)
      }
    }

    checkExistingUser()
  }, [googleUser, router])


  if (!googleUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-full mb-4">
              <Image
                src="/img/tpabaiturrahmanlogo.webp"
                alt="TPA Baiturrahman Logo"
                width={48}
                height={48}
                className="w-12 h-12"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">TPA Baiturrahman</h1>
            <p className="text-gray-600 mt-2">Pilih peran Anda</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setSelectedRole('STUDENT')}
              className={`w-full p-6 rounded-xl border-2 transition ${
                selectedRole === 'STUDENT'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <User className="w-10 h-10 mb-3 mx-auto text-gray-700" />
              <p className="font-semibold text-gray-800 text-lg">Siswa/Siswi</p>
              <p className="text-sm text-gray-500 mt-1">Untuk melaporkan aktivitas harian</p>
            </button>

            <button
              onClick={() => setSelectedRole('TEACHER')}
              className={`w-full p-6 rounded-xl border-2 transition ${
                selectedRole === 'TEACHER'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <GraduationCap className="w-10 h-10 mb-3 mx-auto text-gray-700" />
              <p className="font-semibold text-gray-800 text-lg">Guru</p>
              <p className="text-sm text-gray-500 mt-1">Untuk menyetujui laporan siswa</p>
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleComplete}
              disabled={!selectedRole || loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Memproses...' : 'Lanjutkan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
