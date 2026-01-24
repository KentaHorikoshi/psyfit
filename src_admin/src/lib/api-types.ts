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
  name: string
  email: string
  role: 'manager' | 'staff'
}

// Auth Response Types
export interface LoginResponse {
  staff: Staff
}

export interface LogoutResponse {
  message: string
}

// Login Request Types
export interface StaffLoginRequest {
  email: string
  password: string
}

// Patient Types
export interface Patient {
  id: string
  name: string
  name_kana: string
  email: string
  birth_date: string
  gender: 'male' | 'female' | 'other'
  phone?: string
  address?: string
  status: '急性期' | '回復期' | '維持期'
  condition: string
  continue_days: number
  created_at: string
}

export interface PatientsResponse {
  patients: Patient[]
  meta: {
    total: number
    page: number
    per_page: number
  }
}

// Exercise Master Types
export interface ExerciseMaster {
  id: string
  name: string
  description: string
  video_url: string
  thumbnail_url?: string
  category: '膝' | '腰' | '全身' | '上肢'
  default_sets: number
  default_reps: number
}

export interface ExerciseMastersResponse {
  exercises: ExerciseMaster[]
}

// Exercise Assignment Types
export interface ExerciseAssignment {
  id: string
  patient_id: string
  exercise_id: string
  sets: number
  reps: number
  pain_flag: boolean
  reason: string
  assigned_at: string
  assigned_by: string
}

export interface CreateExerciseAssignmentRequest {
  exercise_id: string
  sets: number
  reps: number
  pain_flag?: boolean
  reason?: string
}

export interface BatchExerciseAssignmentRequest {
  assignments: CreateExerciseAssignmentRequest[]
  pain_flag: boolean
  reason: string
}

export interface ExerciseAssignmentsResponse {
  assignments: ExerciseAssignment[]
}

// Measurement Types
export interface Measurement {
  id: string
  patient_id: string
  measured_date: string
  weight_kg?: number
  body_fat_percentage?: number
  muscle_mass_kg?: number
  tug_seconds?: number
  single_leg_stance_seconds?: number
  grip_strength_kg?: number
  nrs_pain?: number
  mmt_score?: number
  notes?: string
  created_at: string
}

export interface CreateMeasurementRequest {
  measured_date: string
  weight_kg?: number
  body_fat_percentage?: number
  muscle_mass_kg?: number
  tug_seconds?: number
  single_leg_stance_seconds?: number
  grip_strength_kg?: number
  nrs_pain?: number
  mmt_score?: number
  notes?: string
}

export interface MeasurementsResponse {
  measurements: Measurement[]
}

// Report Types
export interface ReportRequest {
  patient_id: string
  start_date: string
  end_date: string
  format: 'pdf' | 'csv'
  include_notes: boolean
}

export interface ReportResponse {
  report_url: string
  filename: string
}

// Date Filter Params
export interface DateFilterParams {
  start_date?: string
  end_date?: string
}

// Pagination Params
export interface PaginationParams {
  page?: number
  per_page?: number
}

// Error Types
export interface ApiError {
  status: 'error'
  message: string
  errors?: Record<string, string[]>
}
