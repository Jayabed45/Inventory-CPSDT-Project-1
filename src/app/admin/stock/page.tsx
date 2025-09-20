'use client'

import { useState } from 'react'

export default function StockPage() {
  const [activeTab, setActiveTab] = useState<'inbound' | 'outbound' | 'adjustments'>('inbound')
  
  const [inboundTransactions] = useState([
    { id: 1, item: 'USB-C Cable 1m', sku: 'SKU-001', quantity: 50, supplier: 'ACME Co.', date: '2024-01-15', type: 'Purchase Order', status: 'Completed' },
    { id: 2, item: 'Wireless Mouse', sku: 'SKU-002', quantity: 25, supplier: 'TechCorp', date: '2024-01-14', type: 'Purchase Order', status: 'Pending' },
    { id: 3, item: 'Mechanical Keyboard', sku: 'SKU-003', quantity: 10, supplier: 'KeyMaster', date: '2024-01-13', type: 'Return', status: 'Completed' },
  ])

  const [outboundTransactions] = useState([
    { id: 1, item: 'USB-C Cable 1m', sku: 'SKU-001', quantity: 5, customer: 'Customer A', date: '2024-01-15', type: 'Sale', status: 'Completed' },
    { id: 2, item: 'Wireless Mouse', sku: 'SKU-002', quantity: 2, customer: 'Customer B', date: '2024-01-14', type: 'Sale', status: 'Completed' },
    { id: 3, item: 'HDMI Cable 2m', sku: 'SKU-004', quantity: 3, customer: 'Customer C', date: '2024-01-13', type: 'Sale', status: 'Pending' },
  ])

  const [adjustments] = useState([
    { id: 1, item: 'USB Hub 4-Port', sku: 'SKU-005', quantity: -2, reason: 'Damaged goods', date: '2024-01-15', status: 'Completed' },
    { id: 2, item: 'Mechanical Keyboard', sku: 'SKU-003', quantity: 1, reason: 'Found in warehouse', date: '2024-01-14', status: 'Completed' },
  ])

  const getCurrentData = () => {
    switch (activeTab) {
      case 'inbound': return inboundTransactions
      case 'outbound': return outboundTransactions
      case 'adjustments': return adjustments
      default: return []
    }
  }

  const getColumns = () => {
    switch (activeTab) {
      case 'inbound':
        return ['Item', 'SKU', 'Quantity', 'Supplier', 'Date', 'Type', 'Status', 'Actions']
      case 'outbound':
        return ['Item', 'SKU', 'Quantity', 'Customer', 'Date', 'Type', 'Status', 'Actions']
      case 'adjustments':
        return ['Item', 'SKU', 'Quantity', 'Reason', 'Date', 'Status', 'Actions']
      default:
        return []
    }
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Stock Operations</h2>
          <p className="text-sm text-gray-600">Manage incoming and outgoing stock movements</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          New Transaction
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('inbound')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'inbound'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Inbound Stock
            </button>
            <button
              onClick={() => setActiveTab('outbound')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'outbound'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Outbound Stock
            </button>
            <button
              onClick={() => setActiveTab('adjustments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'adjustments'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Adjustments
            </button>
          </nav>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Inbound Today</p>
              <p className="text-xl font-semibold text-gray-900">85</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Outbound Today</p>
              <p className="text-xl font-semibold text-gray-900">42</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pending Orders</p>
              <p className="text-xl font-semibold text-gray-900">3</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
              <p className="text-xl font-semibold text-gray-900">7</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              {activeTab === 'inbound' && 'Inbound Transactions'}
              {activeTab === 'outbound' && 'Outbound Transactions'}
              {activeTab === 'adjustments' && 'Stock Adjustments'}
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search transactions..."
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>All Status</option>
                <option>Completed</option>
                <option>Pending</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {getColumns().map((column) => (
                  <th key={column} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getCurrentData().map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction.item}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{transaction.sku}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                    </div>
                  </td>
                  {activeTab === 'inbound' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.supplier}
                    </td>
                  )}
                  {activeTab === 'outbound' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.customer}
                    </td>
                  )}
                  {activeTab === 'adjustments' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.reason}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.date}
                  </td>
                  {activeTab !== 'adjustments' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.type}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.status === 'Completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button className="text-indigo-600 hover:text-indigo-900">View</button>
                      <button className="text-red-600 hover:text-red-900">Cancel</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
