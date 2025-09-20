const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An error occurred' }))
    throw new ApiError(response.status, errorData.message || 'Request failed')
  }

  return response.json()
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  register: (fullName: string, email: string, password: string, role?: string) =>
    apiRequest<{ id: string; fullName: string; email: string; role: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password, role }),
    }),
}

// Items API
export const itemsApi = {
  getAll: (params?: {
    page?: number
    limit?: number
    search?: string
    category?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return apiRequest<{
      items: any[]
      totalPages: number
      currentPage: number
      total: number
    }>(`/items?${searchParams.toString()}`)
  },

  getById: (id: string) =>
    apiRequest<any>(`/items/${id}`),

  create: (data: any) =>
    apiRequest<any>('/items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/items/${id}`, {
      method: 'DELETE',
    }),

  getLowStock: () =>
    apiRequest<any[]>('/items/alerts/low-stock'),
}

// Suppliers API
export const suppliersApi = {
  getAll: (params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return apiRequest<{
      suppliers: any[]
      totalPages: number
      currentPage: number
      total: number
    }>(`/suppliers?${searchParams.toString()}`)
  },

  getById: (id: string) =>
    apiRequest<any>(`/suppliers/${id}`),

  create: (data: any) =>
    apiRequest<any>('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/suppliers/${id}`, {
      method: 'DELETE',
    }),

  getStats: () =>
    apiRequest<{ total: number; active: number; inactive: number }>('/suppliers/stats/overview'),
}

// Stock API
export const stockApi = {
  getAll: (params?: {
    page?: number
    limit?: number
    type?: 'inbound' | 'outbound' | 'adjustment'
    status?: 'pending' | 'completed' | 'cancelled'
    startDate?: string
    endDate?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value))
      })
    }
    return apiRequest<{
      transactions: any[]
      totalPages: number
      currentPage: number
      total: number
    }>(`/stock?${searchParams.toString()}`)
  },

  getById: (id: string) =>
    apiRequest<any>(`/stock/${id}`),

  create: (data: any) =>
    apiRequest<any>('/stock', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/stock/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/stock/${id}`, {
      method: 'DELETE',
    }),

  getStats: () =>
    apiRequest<{
      inboundToday: number
      outboundToday: number
      pendingOrders: number
      lowStockItems: number
    }>('/stock/stats/overview'),
}

// Dashboard API
export const dashboardApi = {
  getOverview: () =>
    apiRequest<{
      metrics: {
        totalItems: number
        lowStockItems: number
        totalSuppliers: number
        inboundToday: number
      }
      recentActivity: any[]
      weeklyMovements: any[]
    }>('/dashboard/overview'),

  getInventoryValue: (period?: string) =>
    apiRequest<any[]>(`/dashboard/inventory-value?period=${period || '30d'}`),

  getCategoryDistribution: () =>
    apiRequest<any[]>('/dashboard/category-distribution'),

  getTopItems: (limit?: number) =>
    apiRequest<any[]>(`/dashboard/top-items?limit=${limit || 10}`),
}

export { ApiError }
