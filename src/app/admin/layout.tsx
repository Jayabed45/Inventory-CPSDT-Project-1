'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import AdminSidebar from '../components/AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [now, setNow] = useState<string>('')

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (!token) {
      router.replace('/')
      return
    }
    try {
      const raw = localStorage.getItem('auth_user')
      if (raw) setUser(JSON.parse(raw))
    } catch {}
  }, [router])

  useEffect(() => {
    const update = () => {
      const d = new Date()
      setNow(
        d.toLocaleString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      )
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const onLogout = () => {
    try {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    } catch {}
    router.replace('/')
  }

  const getPageTitle = () => {
    const path = pathname.split('/').pop()
    if (path === 'dashboard') return 'Dashboard'
    if (path === 'items') return 'Items'
    if (path === 'suppliers') return 'Suppliers'
    if (path === 'stock') return 'Stock'
    if (path === 'reports') return 'Reports'
    if (path === 'settings') return 'Settings'
    return 'Dashboard'
  }

  return (
    <div className="min-h-screen w-full bg-white">
      <AdminSidebar onLogout={onLogout} user={user} />

      <main className="pl-72 pr-6 py-6">
        {/* Header with title, search, clock, profile */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">{getPageTitle()}</h1>
          <div className="flex items-center gap-3 ml-auto">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
              </span>
              <input
                type="text"
                placeholder="Search..."
                className="w-64 text-black pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="text-sm text-gray-600 w-[88px] text-right tabular-nums">{now}</div>
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white grid place-items-center">
              <span className="text-sm font-medium">
                {user?.fullName ? String(user.fullName).charAt(0).toUpperCase() : 'A'}
              </span>
            </div>
          </div>
        </div>

        {children}
      </main>
    </div>
  )
}
