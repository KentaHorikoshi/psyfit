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

// Error Types
export interface ApiError {
  status: 'error'
  message: string
  errors?: Record<string, string[]>
}
