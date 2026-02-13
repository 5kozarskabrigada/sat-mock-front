
'use client'

import { useState } from 'react'
import { login } from './actions'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Append mock email domain if it's just a username
    const email = username.includes('@') ? username : `${username}@sat-platform.local`

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)

    try {
      const result = await login(formData)
      if (result?.error) {
        setError(result.error)
        setLoading(false)
      } else if (result?.redirectUrl) {
        router.push(result.redirectUrl)
        // Keep loading true while redirecting
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Branding Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] flex-col justify-center items-center text-white relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                <path d="M0 100 L100 0 L100 100 Z" fill="currentColor" />
            </svg>
        </div>
        
        <div className="relative z-10 text-center px-12">
            <div className="mb-8 flex justify-center">
                 <Logo className="h-32 w-auto" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-4">Master Your SAT</h1>
            <p className="text-lg text-slate-300 max-w-md mx-auto">
                Join thousands of students achieving their dream scores with our realistic mock exams and detailed analytics.
            </p>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="lg:hidden text-center mb-10">
            <div className="flex justify-center mb-6">
               <Logo className="h-16 w-auto" />
            </div>
          </div>
          
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Sign in</h2>
            <p className="mt-2 text-sm text-gray-600">
                Access your dashboard
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 text-center">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
