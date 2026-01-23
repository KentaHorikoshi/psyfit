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
