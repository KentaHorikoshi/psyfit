// API client for communication with Rails backend
import type {
  ApiResponse,
  Staff,
  StaffLoginRequest,
  StaffLoginResponse,
  LogoutResponse,
} from './api-types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

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

    if (!response.ok) {
      if (response.status === 401) {
        throw new AuthenticationError('認証が必要です')
      }
      const data = await response.json().catch(() => ({}))
      throw new ApiError(data.message || 'API request failed', response.status, data.errors)
    }

    return response.json()
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

  // Staff Authentication
  async staffLogin(credentials: StaffLoginRequest): Promise<ApiResponse<StaffLoginResponse>> {
    return this.post<StaffLoginResponse>('/auth/staff/login', credentials)
  }

  async logout(): Promise<ApiResponse<LogoutResponse>> {
    return this.delete<LogoutResponse>('/auth/logout')
  }

  async getCurrentStaff(): Promise<ApiResponse<Staff>> {
    return this.get<Staff>('/staff/me')
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

export class AuthenticationError extends Error {
  constructor(message: string = '認証が必要です') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export const api = new ApiClient(API_BASE_URL)
