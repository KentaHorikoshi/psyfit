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

// Dashboard Stats API Response
export interface DashboardStatsResponse {
  today_appointments_count: number
  weekly_exercises_count: number
}

// Patient Detail Types
export interface AssignedStaff {
  id: string
  name: string
  is_primary: boolean
}

export interface PatientDetail {
  id: string
  name: string
  name_kana: string
  birth_date: string
  age: number
  gender: '男性' | '女性' | 'その他'
  email: string
  phone?: string
  condition: string
  status: PatientStatus
  continue_days: number
  next_visit_date?: string
  previous_visit_date?: string
  assigned_staff: AssignedStaff[]
}

// Measurement Types
export interface Measurement {
  id: string
  measured_date: string
  weight_kg?: number
  knee_extension_strength_left?: number
  knee_extension_strength_right?: number
  wbi_left?: number
  wbi_right?: number
  tug_seconds?: number
  single_leg_stance_seconds?: number
  nrs_pain_score?: number
  mmt_score?: number
  notes?: string
}

export interface MeasurementInput {
  measured_date: string
  weight_kg?: number
  knee_extension_strength_left?: number
  knee_extension_strength_right?: number
  wbi_left?: number
  wbi_right?: number
  tug_seconds?: number
  single_leg_stance_seconds?: number
  nrs_pain_score?: number
  mmt_score?: number
  notes?: string
}

export interface MeasurementsResponse {
  measurements: Measurement[]
}

// Exercise Master Types (S-06)
export interface ExerciseMaster {
  id: string
  name: string
  description: string
  video_url: string
  thumbnail_url?: string
  exercise_type: ExerciseType
  body_part_major: BodyPartMajor | null
  body_part_minor: BodyPartMinor | null
  recommended_sets: number
  recommended_reps: number
}

export interface ExerciseMastersResponse {
  exercises: ExerciseMaster[]
}

// Exercise Assignment Types (S-06)
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
}

export interface BatchExerciseAssignmentRequest {
  assignments: CreateExerciseAssignmentRequest[]
  pain_flag: boolean
  reason: string
  next_visit_date?: string
}

export interface ExerciseAssignmentsResponse {
  assignments: ExerciseAssignment[]
}

// Report Types (S-07)
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

// Staff Management Types (S-08)
export interface StaffMember {
  id: string
  staff_id: string
  name: string
  name_kana: string
  email: string
  role: 'manager' | 'staff'
  department: string
  created_at: string
}

export interface StaffListResponse {
  staff: StaffMember[]
  meta: {
    total: number
    page: number
    per_page: number
    total_pages: number
  }
}

export interface CreateStaffRequest {
  name: string
  name_kana: string
  email: string
  password: string
  role: 'manager' | 'staff'
  department: string
}

export interface CreateStaffResponse {
  staff: StaffMember
}

// Exercise Category Types
export type ExerciseType = 'ストレッチ' | 'トレーニング' | 'ほぐす' | 'バランス'
export type BodyPartMajor = '体幹・脊柱' | '上肢' | '下肢'
export type BodyPartMinor =
  | '頸部' | '胸部' | '腹部' | '腰椎' | '胸部・腹部' | '腹部・胸部' | '腰椎・骨盤' | 'その他'
  | '肩・上腕' | '肘・前腕' | '手関節・手指'
  | '股関節・大腿' | '膝・下腿' | '足関節・足部'

// Exercise Master Management Types (S-10)
export interface ExerciseMasterDetail {
  id: string
  name: string
  description: string | null
  exercise_type: ExerciseType
  difficulty: 'easy' | 'medium' | 'hard'
  body_part_major: BodyPartMajor | null
  body_part_minor: BodyPartMinor | null
  recommended_reps: number | null
  recommended_sets: number | null
  video_url: string | null
  thumbnail_url: string | null
  duration_seconds: number | null
}

export interface ExerciseMasterListResponse {
  exercises: ExerciseMasterDetail[]
}

export interface CreateExerciseMasterRequest {
  name: string
  description?: string
  exercise_type: ExerciseType
  difficulty: 'easy' | 'medium' | 'hard'
  body_part_major?: BodyPartMajor
  body_part_minor?: BodyPartMinor
  recommended_reps?: number
  recommended_sets?: number
  video_url?: string
  thumbnail_url?: string
  duration_seconds?: number
}

export interface CreateExerciseMasterResponse {
  exercise: ExerciseMasterDetail
}

// Staff Options for filter dropdowns
export interface StaffOption {
  id: string
  name: string
}

export interface StaffOptionsResponse {
  staff_options: StaffOption[]
}

// Staff Detail Types (S-08 edit)
export interface AssignedPatientSummary {
  id: string
  name: string
  is_primary: boolean
}

export interface StaffDetail extends StaffMember {
  assigned_patients: AssignedPatientSummary[]
}

export interface UpdateStaffRequest {
  name?: string
  name_kana?: string
  email?: string
  role?: 'manager' | 'staff'
  department?: string
}

// Password Change Types (S-09)
export interface ChangePasswordRequest {
  current_password: string
  new_password: string
  new_password_confirmation: string
}

export interface ChangePasswordResponse {
  message: string
}

// Patient Create Types (S-03)
export interface CreatePatientRequest {
  name: string
  name_kana?: string
  email: string
  birth_date: string
  password: string
  gender?: string
  phone?: string
  status?: PatientStatus
  condition?: string
  assigned_staff_ids?: string[]
}

export interface CreatePatientResponse {
  id: string
  user_code: string
  name: string
  email: string
  status: PatientStatus
  message: string
}
