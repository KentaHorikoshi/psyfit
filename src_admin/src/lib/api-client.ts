import type {
  ApiResponse,
  LoginResponse,
  LogoutResponse,
  StaffLoginRequest,
  Staff,
  PatientsResponse,
  PaginationParams,
  Patient,
  ExerciseMastersResponse,
  BatchExerciseAssignmentRequest,
  ExerciseAssignmentsResponse,
  CreateMeasurementRequest,
  Measurement,
  ReportRequest,
  ReportResponse,
  DateFilterParams,
  MeasurementsResponse,
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
  async login(credentials: StaffLoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/staff/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async logout(): Promise<ApiResponse<LogoutResponse>> {
    return this.request<LogoutResponse>('/staff/auth/logout', {
      method: 'DELETE',
    })
  }

  async getCurrentStaff(): Promise<ApiResponse<Staff>> {
    return this.request<Staff>('/staff/me')
  }

  // Patient endpoints
  async getPatients(params?: PaginationParams): Promise<ApiResponse<PatientsResponse>> {
    const queryString = params
      ? '?' + new URLSearchParams(
          Object.entries(params).map(([k, v]) => [k, String(v)])
        ).toString()
      : ''
    return this.request<PatientsResponse>(`/staff/patients${queryString}`)
  }

  async getPatient(patientId: string): Promise<ApiResponse<Patient>> {
    return this.request<Patient>(`/staff/patients/${patientId}`)
  }

  // Exercise Master endpoints
  async getExerciseMasters(): Promise<ApiResponse<ExerciseMastersResponse>> {
    return this.request<ExerciseMastersResponse>('/staff/exercise_masters')
  }

  // Exercise Assignment endpoints (S-06)
  async assignExercises(
    patientId: string,
    data: BatchExerciseAssignmentRequest
  ): Promise<ApiResponse<ExerciseAssignmentsResponse>> {
    return this.request<ExerciseAssignmentsResponse>(
      `/staff/patients/${patientId}/exercises`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    )
  }

  async getPatientExercises(
    patientId: string
  ): Promise<ApiResponse<ExerciseAssignmentsResponse>> {
    return this.request<ExerciseAssignmentsResponse>(
      `/staff/patients/${patientId}/exercises`
    )
  }

  // Measurement endpoints (S-05)
  async createMeasurement(
    patientId: string,
    data: CreateMeasurementRequest
  ): Promise<ApiResponse<Measurement>> {
    return this.request<Measurement>(`/staff/patients/${patientId}/measurements`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getPatientMeasurements(
    patientId: string,
    params?: DateFilterParams
  ): Promise<ApiResponse<MeasurementsResponse>> {
    const queryString = params
      ? '?' + new URLSearchParams(
          Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
        ).toString()
      : ''
    return this.request<MeasurementsResponse>(
      `/staff/patients/${patientId}/measurements${queryString}`
    )
  }

  // Report endpoints (S-07)
  async generateReport(data: ReportRequest): Promise<ApiResponse<ReportResponse>> {
    return this.request<ReportResponse>('/staff/reports/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async downloadReport(patientId: string, params: {
    start_date: string
    end_date: string
    format: 'pdf' | 'csv'
  }): Promise<Blob> {
    const queryString = new URLSearchParams({
      start_date: params.start_date,
      end_date: params.end_date,
      format: params.format,
    }).toString()

    const url = `${this.baseUrl}/staff/patients/${patientId}/report?${queryString}`

    const response = await fetch(url, {
      credentials: 'include',
    })

    if (!response.ok) {
      throw new ApiError('レポートのダウンロードに失敗しました', response.status)
    }

    return response.blob()
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
