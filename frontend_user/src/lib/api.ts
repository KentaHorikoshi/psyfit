// API client for communication with Rails backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

interface ApiResponse<T> {
  status: 'success' | 'error'
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

interface HealthResponse {
  health_status: string
  timestamp: string
  version: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    const defaultOptions: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    }

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    }

    const response = await fetch(url, mergedOptions)
    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(data.message || 'API request failed', response.status, data.errors)
    }

    return data
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Health check endpoint
  async checkHealth(): Promise<HealthResponse> {
    const response = await this.get<HealthResponse>('/health')
    return response.data!
  }
}

export class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

export const api = new ApiClient(API_BASE_URL)
