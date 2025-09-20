'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Registration form state
  const [fullName, setFullName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')

  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'

  async function handleLoginSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Login failed')
      try {
        if (data?.token) {
          localStorage.setItem('auth_token', data.token)
        }
        if (data?.user) {
          localStorage.setItem('auth_user', JSON.stringify(data.user))
        }
      } catch {}
      router.push('/admin/dashboard')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegisterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email: regEmail, password: regPassword, role: 'admin' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Registration failed')
      setMessage('Account created. You can sign in now.')
      setIsRegister(false)
      setFullName('')
      setRegEmail('')
      setRegPassword('')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md flex flex-col justify-center transform translate-y-6 sm:translate-y-10">
        <div className="relative overflow-hidden">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-blue-600 text-white grid place-items-center">
              {/* Placeholder lock icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path fillRule="evenodd" d="M12 1.5a4.5 4.5 0 00-4.5 4.5v3H6A2.25 2.25 0 003.75 11.25v7.5A2.25 2.25 0 006 21h12a2.25 2.25 0 002.25-2.25v-7.5A2.25 2.25 0 0018 9H16.5V6A4.5 4.5 0 0012 1.5zm3 7.5V6a3 3 0 10-6 0v3h6z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              {isRegister ? 'Create account' : 'Sign in'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isRegister ? 'Join us by creating your account.' : 'Welcome back. Please enter your details.'}
            </p>
          </div>

          {/* Status messages */}
          {(message || error) && (
            <div className="mb-4 text-center">
              {message && <p className="text-sm text-emerald-600">{message}</p>}
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          )}

          {/* Slider container */}
          <div className="relative w-full overflow-hidden">
            <div
              className={`flex w-[200%] transition-transform duration-500 ease-out ${isRegister ? '-translate-x-1/2' : 'translate-x-0'}`}
            >
              {/* Login panel */}
              <div className="w-1/2 px-0">
                <form className="space-y-5" onSubmit={handleLoginSubmit}>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 7.5l-9.303 5.577a.75.75 0 01-.794 0L2.25 7.5m19.5 0A2.25 2.25 0 0019.5 5.25h-15A2.25 2.25 0 002.25 7.5m19.5 0v9a2.25 2.25 0 01-2.25 2.25h-15A2.25 2.25 0 012.25 16.5v-9" />
                        </svg>
                      </span>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <a href="#" className="text-sm text-blue-700 hover:underline">
                        Forgot password?
          </a>
        </div>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                          <path fillRule="evenodd" d="M12 1.5a4.5 4.5 0 00-4.5 4.5v3H6A2.25 2.25 0 003.75 11.25v7.5A2.25 2.25 0 006 21h12a2.25 2.25 0 002.25-2.25v-7.5A2.25 2.25 0 0018 9H16.5V6A4.5 4.5 0 0012 1.5zm3 7.5V6a3 3 0 10-6 0v3h6z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-10 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                      />
                      <button type="button" aria-label="Toggle password visibility" className="absolute inset-y-0 right-3 my-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.01 9.964 7.178.07.207.07.437 0 .644C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.01-9.964-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" className="h-4 w-4 rounded border-gray-300 dark:border-white/20 text-black focus:ring-black dark:focus:ring-white" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Remember me</span>
                    </label>
                  </div>

                  <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 text-white py-2.5 font-medium hover:bg-blue-700 disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 focus:ring-offset-white">
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>

                  <p className="text-center text-sm text-gray-600">
                    Don’t have an account?{' '}
                    <button type="button" onClick={() => setIsRegister(true)} className="font-medium text-blue-700 hover:underline">
                      Sign up
                    </button>
                  </p>
                </form>
              </div>

              {/* Registration panel */}
              <div className="w-1/2 px-0">
                <form className="space-y-5" onSubmit={handleRegisterSubmit}>
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full name
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Jane Doe"
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="regEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 7.5l-9.303 5.577a.75.75 0 01-.794 0L2.25 7.5m19.5 0A2.25 2.25 0 0019.5 5.25h-15A2.25 2.25 0 002.25 7.5m19.5 0v9a2.25 2.25 0 01-2.25 2.25h-15A2.25 2.25 0 012.25 16.5v-9" />
                        </svg>
                      </span>
                      <input
                        id="regEmail"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="regPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      id="regPassword"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                    />
                  </div>

                  {/* Role preset to admin */}
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <input
                      id="role"
                      name="role"
                      type="text"
                      value="admin"
                      readOnly
                      className="w-full cursor-not-allowed rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-gray-900"
                    />
                  </div>

                  <button type="submit" disabled={loading} className="w-full rounded-xl bg-black text-white dark:bg-white dark:text-black py-2.5 font-medium hover:opacity-90 disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white focus:ring-offset-white dark:focus:ring-offset-neutral-900">
                    {loading ? 'Creating...' : 'Create account'}
                  </button>

                  <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <button type="button" onClick={() => setIsRegister(false)} className="font-medium text-gray-800 hover:underline dark:text-gray-200">
                      Sign in
                    </button>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
