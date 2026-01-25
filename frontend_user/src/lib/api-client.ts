import type {
  ApiResponse,
  LoginResponse,
  LogoutResponse,
  UserLoginRequest,
  User,
  DailyCondition,
  CreateDailyConditionRequest,
  DailyConditionsResponse,
  MeasurementsResponse,
  ExerciseRecordsResponse,
  DateFilterParams,
  Exercise,
  ExercisesResponse,
  ExerciseRecord,
  CreateExerciseRecordRequest
} from './api-types'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private buildQueryString(params?: Record<string, string | undefined>): string {
    if (!params) return ''
    const entries = Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
    return entries.length > 0 ? '?' + new URLSearchParams(entries).toString() : ''
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

  // Exercise Records endpoints
  async getExerciseRecords(params?: DateFilterParams): Promise<ApiResponse<ExerciseRecordsResponse>> {
    return this.request<ExerciseRecordsResponse>(`/users/me/exercise_records${this.buildQueryString(params)}`)
  }

  // Measurements endpoints
  async getMeasurements(params?: DateFilterParams): Promise<ApiResponse<MeasurementsResponse>> {
    return this.request<MeasurementsResponse>(`/users/me/measurements${this.buildQueryString(params)}`)
  }

  // Daily Condition endpoints
  async createDailyCondition(data: CreateDailyConditionRequest): Promise<ApiResponse<DailyCondition>> {
    return this.request<DailyCondition>('/daily_conditions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getMyDailyConditions(params?: DateFilterParams): Promise<ApiResponse<DailyConditionsResponse>> {
    return this.request<DailyConditionsResponse>(`/users/me/daily_conditions${this.buildQueryString(params)}`)
  }

  // Exercise endpoints
  async getUserExercises(): Promise<ApiResponse<ExercisesResponse>> {
    return this.request<ExercisesResponse>('/users/me/exercises')
  }

  async getExercise(id: string): Promise<ApiResponse<Exercise>> {
    return this.request<Exercise>(`/exercises/${id}`)
  }

  async createExerciseRecord(data: CreateExerciseRecordRequest): Promise<ApiResponse<ExerciseRecord>> {
    return this.request<ExerciseRecord>('/exercise_records', {
      method: 'POST',
      body: JSON.stringify(data),
    })
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
