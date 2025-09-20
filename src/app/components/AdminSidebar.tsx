'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  onLogout: () => void
  user: any
}

export default function AdminSidebar({ onLogout, user }: SidebarProps) {
  const pathname = usePathname()
  return (
    <div className="w-64 bg-white shadow-lg fixed h-full">
      {/* Logo/Header */}
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-900">Inventory</h1>
        <p className="text-sm text-gray-600 mt-1">Management System</p>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        <div className="px-3">
          <Link
            href="/admin/dashboard"
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 ${
              pathname === '/admin/dashboard'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
            </svg>
            Dashboard
          </Link>

          <Link
            href="/admin/items"
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 ${
              pathname === '/admin/items'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
            </svg>
            Items
          </Link>

          <Link
            href="/admin/suppliers"
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 ${
              pathname === '/admin/suppliers'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Suppliers
          </Link>

          <Link
            href="/admin/stock"
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 ${
              pathname === '/admin/stock'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 21h6m-7-4h8a2 2 0 002-2v-2H6v2a2 2 0 002 2z" />
            </svg>
            Stock
          </Link>

          <Link
            href="/admin/reports"
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 ${
              pathname === '/admin/reports'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V9a2 2 0 012-2h4a2 2 0 012 2v10M7 19h10" />
            </svg>
            Reports
          </Link>

          <Link
            href="/admin/settings"
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 ${
              pathname === '/admin/settings'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Link>
        </div>
      </nav>

      {/* User Info & Logout */}
      <div className="absolute bottom-0 w-full p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.fullName ? String(user.fullName).charAt(0).toUpperCase() : 'A'}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.fullName || 'Admin'}</p>
              <p className="text-xs text-gray-500">{user?.email || 'admin@example.com'}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}


