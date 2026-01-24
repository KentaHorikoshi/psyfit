// API Response Types
export interface ApiResponse<T> {
  status: 'success' | 'error'
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

// Staff Types
export interface Staff {
  id: string
  staff_id: string
  name: string
  role: 'manager' | 'staff'
  department?: string
}

// Auth Response Types
export interface StaffLoginResponse {
  staff: Staff
}

export interface LogoutResponse {
  message: string
}

// Login Request Types
export interface StaffLoginRequest {
  staff_id: string
  password: string
}

// Error Types
export interface ApiError {
  status: 'error'
  message: string
  errors?: Record<string, string[]>
}

// Patient Types
export type PatientStatus = '急性期' | '回復期' | '維持期'

export interface Patient {
  id: string
  name: string
  name_kana: string
  age: number
  gender: '男性' | '女性'
  condition: string
  status: PatientStatus
  staff_id: string
  staff_name: string
  last_exercise_at?: string
}

// Patient List Response
export interface PatientsListResponse {
  patients: Patient[]
  meta: {
    total: number
    page: number
    per_page: number
    total_pages: number
  }
}

// Dashboard Stats
export interface DashboardStats {
  my_patients_count: number
  today_appointments_count: number
  weekly_exercises_count: number
  total_patients_count: number
}
