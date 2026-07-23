'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const session = localStorage.getItem('session')
    if (session) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="text-center">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-full inline-block mb-4">
          <Image
            src="/img/tpabaiturrahmanlogo.webp"
            alt="TPA Baiturrahman Logo"
            width={64}
            height={64}
            className="w-16 h-16"
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">TPA Baiturrahman</h1>
        <p className="text-gray-600">Memuat...</p>
      </div>
    </div>
  )
}
