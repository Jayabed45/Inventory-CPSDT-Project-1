'use client'

import { useEffect, useState } from 'react'
import { dashboardApi, ApiError } from '../../../lib/api'

interface DashboardData {
  metrics: {
    totalItems: number
    lowStockItems: number
    totalSuppliers: number
    inboundToday: number
  }
  recentActivity: Array<{
    _id: string
    type: string
    quantity: number
    item: { name: string; sku: string }
    supplier?: { name: string }
    createdAt: string
  }>
  weeklyMovements: Array<{
    _id: { day: number; type: string }
    count: number
  }>
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const dashboardData = await dashboardApi.getOverview()
        setData(dashboardData)
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message)
        } else {
          setError('Failed to load dashboard data')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <section>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </section>
    )
  }

  if (!data) return null

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Total Items</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{data.metrics.totalItems}</p>
          <p className="mt-1 text-xs text-emerald-600">Active inventory</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Low Stock</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{data.metrics.lowStockItems}</p>
          <p className="mt-1 text-xs text-amber-600">Review soon</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Suppliers</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{data.metrics.totalSuppliers}</p>
          <p className="mt-1 text-xs text-gray-500">Active partners</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Inbound Today</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{data.metrics.inboundToday}</p>
          <p className="mt-1 text-xs text-emerald-600">Units received</p>
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
          </div>
          <ul className="space-y-3 text-sm">
            {data.recentActivity.length > 0 ? (
              data.recentActivity.map((activity) => (
                <li key={activity._id} className="flex items-start gap-3">
                  <span className={`mt-1 h-2.5 w-2.5 rounded-full ${
                    activity.type === 'inbound' ? 'bg-emerald-500' :
                    activity.type === 'outbound' ? 'bg-rose-500' :
                    'bg-amber-500'
                  }`} />
                  <span className="text-gray-700">
                    {activity.type === 'inbound' && `Received ${activity.quantity} units of ${activity.item.sku}${activity.supplier ? ` from ${activity.supplier.name}` : ''}`}
                    {activity.type === 'outbound' && `Shipped ${activity.quantity} units of ${activity.item.sku}`}
                    {activity.type === 'adjustment' && `Adjusted ${activity.quantity} units of ${activity.item.sku}`}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-gray-500">No recent activity</li>
            )}
          </ul>
        </div>
      </div>
    </section>
  )
}


