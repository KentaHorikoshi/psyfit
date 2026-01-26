// API client for communication with Rails backend
import type {
  ApiResponse,
  Staff,
  StaffLoginRequest,
  StaffLoginResponse,
  LogoutResponse,
  PatientsListResponse,
  PatientDetail,
  MeasurementInput,
  Measurement,
  MeasurementsResponse,
  ExerciseMastersResponse,
  BatchExerciseAssignmentRequest,
  ExerciseAssignmentsResponse,
  StaffListResponse,
  CreateStaffRequest,
  CreateStaffResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
} from './api-types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

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
    return this.get<Staff>('/auth/me')
  }

  // Patient Management
  async getPatients(
    params?: Record<string, string>
  ): Promise<ApiResponse<PatientsListResponse>> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.get<PatientsListResponse>(`/patients${query}`)
  }

  async getPatientDetail(patientId: string): Promise<ApiResponse<PatientDetail>> {
    return this.get<PatientDetail>(`/patients/${patientId}`)
  }

  // Measurements
  async createMeasurement(
    patientId: string,
    data: MeasurementInput
  ): Promise<ApiResponse<Measurement>> {
    return this.post<Measurement>(`/patients/${patientId}/measurements`, data)
  }

  async getPatientMeasurements(
    patientId: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<MeasurementsResponse>> {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    const query = params.toString()
    const endpoint = `/patients/${patientId}/measurements${query ? `?${query}` : ''}`
    return this.get<MeasurementsResponse>(endpoint)
  }

  // Exercise Master endpoints (S-06)
  async getExerciseMasters(): Promise<ApiResponse<ExerciseMastersResponse>> {
    return this.get<ExerciseMastersResponse>('/exercise_masters')
  }

  // Exercise Assignment endpoints (S-06)
  async assignExercises(
    patientId: string,
    data: BatchExerciseAssignmentRequest
  ): Promise<ApiResponse<ExerciseAssignmentsResponse>> {
    return this.post<ExerciseAssignmentsResponse>(
      `/patients/${patientId}/exercises`,
      data
    )
  }

  async getPatientExercises(
    patientId: string
  ): Promise<ApiResponse<ExerciseAssignmentsResponse>> {
    return this.get<ExerciseAssignmentsResponse>(`/patients/${patientId}/exercises`)
  }

  // Report endpoints (S-07)
  async downloadReport(
    patientId: string,
    params: {
      start_date: string
      end_date: string
      format: 'pdf' | 'csv'
    }
  ): Promise<Blob> {
    const queryString = new URLSearchParams({
      start_date: params.start_date,
      end_date: params.end_date,
      format: params.format,
    }).toString()

    const url = `${this.baseUrl}/patients/${patientId}/report?${queryString}`

    const response = await fetch(url, {
      credentials: 'include',
    })

    if (!response.ok) {
      throw new ApiError('レポートのダウンロードに失敗しました', response.status)
    }

    return response.blob()
  }

  // Staff Management endpoints (S-08)
  async getStaffList(): Promise<ApiResponse<StaffListResponse>> {
    return this.get<StaffListResponse>('/staff')
  }

  async createStaff(data: CreateStaffRequest): Promise<ApiResponse<CreateStaffResponse>> {
    return this.post<CreateStaffResponse>('/staff', data)
  }

  // Password Change endpoint (S-09)
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<ChangePasswordResponse>> {
    return this.post<ChangePasswordResponse>('/staff/me/password', data)
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
