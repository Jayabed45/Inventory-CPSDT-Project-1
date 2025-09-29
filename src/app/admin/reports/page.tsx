'use client'

import { useState, useEffect } from 'react'
import { dashboardApi, ApiError } from '../../../lib/api'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Extend jsPDF type to include autoTable properties
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number
  }
}
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

interface ReportData {
  inventoryValue: any[]
  categoryDistribution: any[]
  topItems: any[]
  metrics: {
    totalItems: number
    lowStockItems: number
    totalSuppliers: number
    inboundToday: number
  }
}

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedReport, setSelectedReport] = useState('inventory')
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

  useEffect(() => {
    fetchReportData()
  }, [selectedPeriod])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      const [inventoryValue, categoryDistribution, topItems, overview] = await Promise.all([
        dashboardApi.getInventoryValue(selectedPeriod),
        dashboardApi.getCategoryDistribution(),
        dashboardApi.getTopItems(5),
        dashboardApi.getOverview()
      ])

      setReportData({
        inventoryValue,
        categoryDistribution,
        topItems,
        metrics: overview.metrics
      })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to load report data')
      }
    } finally {
      setLoading(false)
    }
  }

  const exportToPDF = async () => {
    try {
      setExportLoading(true)
      const doc = new jsPDF() as jsPDFWithAutoTable
      
      // Add system header
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.text('SmartStock Inventory Management System', 20, 20)
      
      // Add horizontal line under header
      doc.setLineWidth(0.5)
      doc.line(20, 25, 190, 25)
      
      // Add report title
      doc.setFontSize(18)
      doc.setFont('helvetica', 'normal')
      doc.text('Inventory Report', 20, 40)
      
      // Add date and period info
      doc.setFontSize(12)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 50)
      doc.text(`Period: ${selectedPeriod}`, 20, 60)
      
      // Add metrics
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Key Metrics', 20, 80)
      
      const metrics = [
        ['Total Items', reportData?.metrics.totalItems || 0],
        ['Low Stock Items', reportData?.metrics.lowStockItems || 0],
        ['Active Suppliers', reportData?.metrics.totalSuppliers || 0],
        ['Inbound Today', reportData?.metrics.inboundToday || 0]
      ]
      
      autoTable(doc, {
        startY: 90,
        head: [['Metric', 'Value']],
        body: metrics,
        theme: 'grid'
      })
      
      // Add category distribution
      if (reportData?.categoryDistribution && reportData.categoryDistribution.length > 0) {
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text('Category Distribution', 20, doc.lastAutoTable.finalY + 20)
        
        const categoryData = reportData.categoryDistribution.map(cat => [
          cat._id,
          cat.count,
          `${Math.round((cat.count / reportData.categoryDistribution.reduce((sum, c) => sum + c.count, 0)) * 100)}%`
        ])
        
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 30,
          head: [['Category', 'Count', 'Percentage']],
          body: categoryData,
          theme: 'grid'
        })
      }
      
      // Add top items
      if (reportData?.topItems && reportData.topItems.length > 0) {
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text('Top Performing Items', 20, doc.lastAutoTable.finalY + 20)
        
        const topItemsData = reportData.topItems.map(item => [
          item.name,
          item.sku,
          item.totalSold,
          `₱${item.totalRevenue?.toLocaleString() || '0'}`,
          `${item.profitMargin?.toFixed(1) || '0'}%`
        ])
        
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 30,
          head: [['Item', 'SKU', 'Sold', 'Revenue', 'Margin']],
          body: topItemsData,
          theme: 'grid'
        })
      }
      
      doc.save(`inventory-report-${selectedPeriod}.pdf`)
      setShowExportModal(false)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setExportLoading(false)
    }
  }

  const exportToExcel = async () => {
    try {
      setExportLoading(true)
      
      // Create workbook
      const workbook = XLSX.utils.book_new()
      
      // Metrics sheet
      const metricsData = [
        ['Metric', 'Value'],
        ['Total Items', reportData?.metrics.totalItems || 0],
        ['Low Stock Items', reportData?.metrics.lowStockItems || 0],
        ['Active Suppliers', reportData?.metrics.totalSuppliers || 0],
        ['Inbound Today', reportData?.metrics.inboundToday || 0]
      ]
      const metricsSheet = XLSX.utils.aoa_to_sheet(metricsData)
      XLSX.utils.book_append_sheet(workbook, metricsSheet, 'Metrics')
      
      // Category distribution sheet
      if (reportData?.categoryDistribution && reportData.categoryDistribution.length > 0) {
        const categoryData = [
          ['Category', 'Count', 'Percentage'],
          ...reportData.categoryDistribution.map(cat => [
            cat._id,
            cat.count,
            `${Math.round((cat.count / reportData.categoryDistribution.reduce((sum, c) => sum + c.count, 0)) * 100)}%`
          ])
        ]
        const categorySheet = XLSX.utils.aoa_to_sheet(categoryData)
        XLSX.utils.book_append_sheet(workbook, categorySheet, 'Categories')
      }
      
      // Top items sheet
      if (reportData?.topItems && reportData.topItems.length > 0) {
        const topItemsData = [
          ['Item', 'SKU', 'Units Sold', 'Revenue', 'Profit Margin'],
          ...reportData.topItems.map(item => [
            item.name,
            item.sku,
            item.totalSold,
            item.totalRevenue || 0,
            item.profitMargin || 0
          ])
        ]
        const topItemsSheet = XLSX.utils.aoa_to_sheet(topItemsData)
        XLSX.utils.book_append_sheet(workbook, topItemsSheet, 'Top Items')
      }
      
      // Inventory value trend sheet
      if (reportData?.inventoryValue && reportData.inventoryValue.length > 0) {
        const trendData = [
          ['Month/Year', 'Total Value', 'Item Count'],
          ...reportData.inventoryValue.map(data => [
            `${data._id.month}/${data._id.year}`,
            data.totalValue,
            data.itemCount
          ])
        ]
        const trendSheet = XLSX.utils.aoa_to_sheet(trendData)
        XLSX.utils.book_append_sheet(workbook, trendSheet, 'Inventory Trend')
      }
      
      // Save file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      saveAs(data, `inventory-report-${selectedPeriod}.xlsx`)
      
      setShowExportModal(false)
    } catch (error) {
      console.error('Error generating Excel:', error)
    } finally {
      setExportLoading(false)
    }
  }

  const reportTypes = [
    { id: 'inventory', name: 'Inventory Summary', description: 'Overview of current inventory levels' },
    { id: 'movements', name: 'Stock Movements', description: 'Inbound and outbound stock transactions' },
    { id: 'suppliers', name: 'Supplier Performance', description: 'Analysis of supplier relationships' },
    { id: 'financial', name: 'Financial Reports', description: 'Revenue and cost analysis' },
  ]

  const periodOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
  ]

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

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Reports & Analytics</h2>
          <p className="text-sm text-gray-600">Generate insights and analytics for your inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button 
            onClick={() => setShowExportModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {reportTypes.map((report) => (
          <div
            key={report.id}
            onClick={() => setSelectedReport(report.id)}
            className={`p-4 rounded-xl border cursor-pointer transition-colors ${
              selectedReport === report.id
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <h3 className="text-sm font-medium text-gray-900 mb-1">{report.name}</h3>
            <p className="text-xs text-gray-500">{report.description}</p>
          </div>
        ))}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border-2 border-indigo-200 shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Export Report</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              Choose your preferred export format for the {selectedPeriod} report
            </p>
            
            <div className="space-y-4">
              <button
                onClick={exportToPDF}
                disabled={exportLoading}
                className="w-full flex items-center justify-center gap-3 p-4 border-2 border-red-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Export as PDF</div>
                  <div className="text-sm text-gray-500">Download as PDF document</div>
                </div>
                {exportLoading && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                )}
              </button>
              
              <button
                onClick={exportToExcel}
                disabled={exportLoading}
                className="w-full flex items-center justify-center gap-3 p-4 border-2 border-green-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors disabled:opacity-50"
              >
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Export as Excel</div>
                  <div className="text-sm text-gray-500">Download as Excel spreadsheet</div>
                </div>
                {exportLoading && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                )}
              </button>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Items</p>
              <p className="text-2xl font-semibold text-gray-900">{reportData?.metrics.totalItems || 0}</p>
              <p className="text-xs text-gray-500">Active inventory items</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Inbound Today</p>
              <p className="text-2xl font-semibold text-gray-900">{reportData?.metrics.inboundToday || 0}</p>
              <p className="text-xs text-gray-500">Items received today</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
              <p className="text-2xl font-semibold text-gray-900">{reportData?.metrics.lowStockItems || 0}</p>
              <p className="text-xs text-red-600">Need reordering</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Suppliers</p>
              <p className="text-2xl font-semibold text-gray-900">{reportData?.metrics.totalSuppliers || 0}</p>
              <p className="text-xs text-gray-500">Vendor partners</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory Value Trend</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {reportData?.inventoryValue && reportData.inventoryValue.length > 0 ? (
              reportData.inventoryValue.map((data, index) => {
                const maxValue = Math.max(...reportData.inventoryValue.map(d => d.totalValue))
                const height = (data.totalValue / maxValue) * 100
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-indigo-500 to-indigo-300 rounded-t"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-gray-500 mt-2">
                      {data._id.month}/{data._id.year}
                    </span>
                  </div>
                )
              })
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <p className="text-gray-500">No data available</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Category Distribution</h3>
          <div className="space-y-4">
            {reportData?.categoryDistribution && reportData.categoryDistribution.length > 0 ? (
              reportData.categoryDistribution.map((category, index) => {
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500']
                const totalItems = reportData.categoryDistribution.reduce((sum, cat) => sum + cat.count, 0)
                const percentage = Math.round((category.count / totalItems) * 100)
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]} mr-3`} />
                      <span className="text-sm text-gray-700">{category._id}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className={`h-2 rounded-full ${colors[index % colors.length]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{percentage}%</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <p className="text-gray-500">No data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Performing Items */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Top Performing Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit Margin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData?.topItems && reportData.topItems.length > 0 ? (
                reportData.topItems.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.sku}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.totalSold}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₱{item.totalRevenue?.toLocaleString() || '0'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.profitMargin?.toFixed(1) || '0'}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                        </svg>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
