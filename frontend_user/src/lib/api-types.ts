// API Response Types
export interface ApiResponse<T> {
  status: 'success' | 'error'
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

// User (Patient) Types
export interface User {
  id: string
  name: string
  email: string
  continue_days: number
  status?: string
  condition?: string
}

// Auth Response Types
export interface LoginResponse {
  user: User
}

export interface LogoutResponse {
  message: string
}

// Login Request Types
export interface UserLoginRequest {
  email: string
  password: string
}

// Exercise Types
export interface Exercise {
  id: string
  name: string
  description: string
  video_url: string
  thumbnail_url?: string
  sets: number
  reps: number
  duration_seconds?: number
  category: 'upper_body' | 'lower_body' | 'core' | 'stretch'
}

export interface ExerciseRecord {
  id: string
  exercise_id: string
  user_id: string
  completed_at: string
  sets_completed: number
  reps_completed: number
  pain_level?: number
  notes?: string
}

export interface CreateExerciseRecordRequest {
  exercise_id: string
  sets_completed: number
  reps_completed: number
  pain_level?: number
  notes?: string
}

export interface ExercisesResponse {
  exercises: Exercise[]
}

// Daily Condition Types
export interface DailyCondition {
  id: string
  user_id: string
  recorded_date: string
  pain_level: number
  body_condition: number
  notes?: string
  created_at: string
}

export interface CreateDailyConditionRequest {
  recorded_date: string
  pain_level: number
  body_condition: number
  notes?: string
}

export interface DailyConditionsResponse {
  conditions: DailyCondition[]
}

// Measurement Types
export interface Measurement {
  id: string
  user_id: string
  measured_date: string
  weight_kg?: number
  body_fat_percentage?: number
  muscle_mass_kg?: number
  tug_seconds?: number
  nrs_pain?: number
  created_at: string
}

export interface MeasurementsResponse {
  measurements: Measurement[]
}

// Exercise Record History Types
export interface ExerciseRecordWithExercise extends ExerciseRecord {
  exercise_name: string
  exercise_category: string
}

export interface ExerciseRecordsResponse {
  records: ExerciseRecordWithExercise[]
}

// Date Filter Params
export interface DateFilterParams {
  start_date?: string
  end_date?: string
}

// Error Types
export interface ApiError {
  status: 'error'
  message: string
  errors?: Record<string, string[]>
}
