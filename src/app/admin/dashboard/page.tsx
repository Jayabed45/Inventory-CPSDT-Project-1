'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '../../components/AdminSidebar'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'items' | 'suppliers' | 'stock' | 'reports' | 'settings'>('dashboard')
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

  const title = useMemo(() => {
    return activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
  }, [activeTab])

  const onLogout = () => {
    try {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    } catch {}
    router.replace('/')
  }

  return (
    <div className="min-h-screen w-full bg-white">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} user={user} />

      <main className="pl-72 pr-6 py-6">
        {/* Header with title, search, clock, profile */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          <div className="flex items-center gap-3 ml-auto">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
              </span>
              <input
                type="text"
                placeholder="Search..."
                className="w-64 pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
        {activeTab === 'dashboard' && (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Total Items</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">1,248</p>
                <p className="mt-1 text-xs text-emerald-600">+4.2% vs last week</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Low Stock</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">23</p>
                <p className="mt-1 text-xs text-amber-600">Review soon</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Suppliers</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">57</p>
                <p className="mt-1 text-xs text-gray-500">Active partners</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Inbound Today</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">312</p>
                <p className="mt-1 text-xs text-emerald-600">+18 since 9am</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-medium text-gray-900">Weekly Movements</h2>
                  <span className="text-xs text-gray-500">Last 7 days</span>
                </div>
                {/* Simple bar chart mock */}
                <div className="flex items-end gap-3 h-40">
                  {[
                    { h: 24, c: 'bg-blue-200' },
                    { h: 56, c: 'bg-blue-300' },
                    { h: 80, c: 'bg-blue-400' },
                    { h: 48, c: 'bg-blue-300' },
                    { h: 92, c: 'bg-blue-500' },
                    { h: 60, c: 'bg-blue-400' },
                    { h: 72, c: 'bg-blue-500' }
                  ].map((b, i) => (
                    <div key={i} className="flex-1 grid place-items-end">
                      <div className={`${b.c} w-full rounded-t-md`} style={{ height: `${b.h}%` }} />
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-xs text-gray-500">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-medium text-gray-900">Recent Activity</h2>
                  <span className="text-xs text-blue-700 hover:underline cursor-pointer">View all</span>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="text-gray-700">Received 120 units of SKU-234 from ACME Co.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-500" />
                    <span className="text-gray-700">Created new item: USB-C Cable 1m</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span className="text-gray-700">Low stock alert: SKU-991 (8 left)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span className="text-gray-700">Order #10421 fulfilled (38 items)</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'items' && (
          <section>
            <p className="text-gray-600">List, create, and manage inventory items here.</p>
          </section>
        )}

        {activeTab === 'suppliers' && (
          <section>
            <p className="text-gray-600">Manage suppliers and contacts.</p>
          </section>
        )}

        {activeTab === 'stock' && (
          <section>
            <p className="text-gray-600">Incoming and outgoing stock operations.</p>
          </section>
        )}

        {activeTab === 'reports' && (
          <section>
            <p className="text-gray-600">Insights and analytics for your inventory.</p>
          </section>
        )}

        {activeTab === 'settings' && (
          <section>
            <p className="text-gray-600">Application and account preferences.</p>
          </section>
        )}
      </main>
    </div>
  )
}


