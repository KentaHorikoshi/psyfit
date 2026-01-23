import type {
  ApiResponse,
  LoginResponse,
  LogoutResponse,
  UserLoginRequest,
  User
} from './api-types'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include session cookies
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      if (response.status === 401) {
        // Session expired or unauthorized
        throw new AuthenticationError('認証が必要です')
      }

      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.message || 'エラーが発生しました',
        response.status,
        errorData.errors
      )
    }

    return response.json()
  }

  // Auth endpoints
  async login(credentials: UserLoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async logout(): Promise<ApiResponse<LogoutResponse>> {
    return this.request<LogoutResponse>('/auth/logout', {
      method: 'DELETE',
    })
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/users/me')
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

export const apiClient = new ApiClient()
export default apiClient
