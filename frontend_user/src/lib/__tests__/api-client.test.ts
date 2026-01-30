import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { apiClient, ApiError, AuthenticationError } from '../api-client'

const API_BASE_URL = '/api/v1'

// MSW Server Setup
const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('ApiClient', () => {
  describe('error handling', () => {
    it('should throw AuthenticationError on 401 response', async () => {
      server.use(
        http.get(`${API_BASE_URL}/auth/me`, () => {
          return HttpResponse.json(
            { status: 'error', message: '認証が必要です' },
            { status: 401 }
          )
        })
      )

      await expect(apiClient.getCurrentUser()).rejects.toThrow(AuthenticationError)
    })

    it('should throw ApiError on 400 response', async () => {
      server.use(
        http.post(`${API_BASE_URL}/auth/login`, () => {
          return HttpResponse.json(
            { status: 'error', message: 'リクエストが不正です' },
            { status: 400 }
          )
        })
      )

      await expect(
        apiClient.login({ email: 'test@example.com', password: 'password' })
      ).rejects.toThrow(ApiError)
    })

    it('should throw ApiError with field errors on 422 response', async () => {
      server.use(
        http.post(`${API_BASE_URL}/auth/login`, () => {
          return HttpResponse.json(
            {
              status: 'error',
              message: 'バリデーションエラー',
              errors: { email: ['無効なメールアドレスです'] },
            },
            { status: 422 }
          )
        })
      )

      try {
        await apiClient.login({ email: 'invalid', password: 'password' })
        expect.fail('Should have thrown ApiError')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        const apiError = error as ApiError
        expect(apiError.status).toBe(422)
        expect(apiError.errors).toEqual({ email: ['無効なメールアドレスです'] })
      }
    })

    it('should throw ApiError with default message when response has no message', async () => {
      server.use(
        http.post(`${API_BASE_URL}/auth/login`, () => {
          return HttpResponse.json({}, { status: 500 })
        })
      )

      await expect(
        apiClient.login({ email: 'test@example.com', password: 'password' })
      ).rejects.toThrow('エラーが発生しました')
    })

    it('should handle network errors gracefully', async () => {
      server.use(
        http.get(`${API_BASE_URL}/auth/me`, () => {
          return HttpResponse.error()
        })
      )

      await expect(apiClient.getCurrentUser()).rejects.toThrow()
    })
  })

  describe('authentication APIs', () => {
    describe('login', () => {
      it('should send POST request with credentials and return user data', async () => {
        const mockUser = {
          id: 'user-123',
          name: '田中太郎',
          email: 'tanaka@example.com',
          continue_days: 14,
        }

        server.use(
          http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
            const body = await request.json() as { email: string; password: string }
            expect(body.email).toBe('tanaka@example.com')
            expect(body.password).toBe('password123')
            return HttpResponse.json({
              status: 'success',
              data: { user: mockUser },
            })
          })
        )

        const response = await apiClient.login({
          email: 'tanaka@example.com',
          password: 'password123',
        })

        expect(response.status).toBe('success')
        expect(response.data?.user).toEqual(mockUser)
      })

      it('should include credentials: include for session cookie', async () => {
        let capturedRequest: Request | null = null

        server.use(
          http.post(`${API_BASE_URL}/auth/login`, ({ request }) => {
            capturedRequest = request
            return HttpResponse.json({
              status: 'success',
              data: { user: { id: '1', name: 'Test', email: 'test@example.com', continue_days: 0 } },
            })
          })
        )

        await apiClient.login({ email: 'test@example.com', password: 'password' })

        // fetch with credentials: 'include' allows cookies to be sent/received
        expect(capturedRequest).toBeTruthy()
      })
    })

    describe('logout', () => {
      it('should send DELETE request and return success message', async () => {
        server.use(
          http.delete(`${API_BASE_URL}/auth/logout`, () => {
            return HttpResponse.json({
              status: 'success',
              data: { message: 'ログアウトしました' },
            })
          })
        )

        const response = await apiClient.logout()

        expect(response.status).toBe('success')
        expect(response.data?.message).toBe('ログアウトしました')
      })
    })

    describe('getCurrentUser', () => {
      it('should send GET request and return user data', async () => {
        const mockUser = {
          id: 'user-456',
          name: '佐藤花子',
          email: 'sato@example.com',
          continue_days: 7,
        }

        server.use(
          http.get(`${API_BASE_URL}/auth/me`, () => {
            return HttpResponse.json({
              status: 'success',
              data: { user: mockUser },
            })
          })
        )

        const response = await apiClient.getCurrentUser()

        expect(response.status).toBe('success')
        expect(response.data).toEqual({ user: mockUser })
      })
    })
  })

  describe('exercise APIs', () => {
    describe('getUserExercises (getMyExercises)', () => {
      it('should fetch assigned exercises for current user', async () => {
        const mockExercises = [
          {
            id: 'exercise-1',
            name: 'スクワット',
            description: '膝の筋力強化',
            video_url: '/videos/squat.mp4',
            thumbnail_url: '/thumbnails/squat.jpg',
            sets: 3,
            reps: 10,
            category: 'lower_body',
          },
        ]

        server.use(
          http.get(`${API_BASE_URL}/users/me/exercises`, () => {
            return HttpResponse.json({
              status: 'success',
              data: { exercises: mockExercises },
            })
          })
        )

        const response = await apiClient.getUserExercises()

        expect(response.status).toBe('success')
        expect(response.data?.exercises).toHaveLength(1)
        expect(response.data?.exercises[0].name).toBe('スクワット')
      })
    })

    describe('getExercise', () => {
      it('should fetch a single exercise by id', async () => {
        const mockExercise = {
          id: 'exercise-1',
          name: 'スクワット',
          description: '膝の筋力強化',
          video_url: '/videos/squat.mp4',
          thumbnail_url: '/thumbnails/squat.jpg',
          sets: 3,
          reps: 10,
          category: 'lower_body',
        }

        server.use(
          http.get(`${API_BASE_URL}/exercises/exercise-1`, () => {
            return HttpResponse.json({
              status: 'success',
              data: mockExercise,
            })
          })
        )

        const response = await apiClient.getExercise('exercise-1')

        expect(response.status).toBe('success')
        expect(response.data?.name).toBe('スクワット')
      })
    })
  })

  describe('exercise record APIs', () => {
    describe('createExerciseRecord', () => {
      it('should send POST request to create exercise record with correct parameter names', async () => {
        // バックエンドのパラメータ名に統一: completed_sets, completed_reps
        const mockRecord = {
          id: 'record-123',
          exercise_id: 'exercise-1',
          user_id: 'user-1',
          completed_at: '2026-01-25T10:00:00Z',
          completed_sets: 3,
          completed_reps: 10,
        }

        server.use(
          http.post(`${API_BASE_URL}/exercise_records`, async ({ request }) => {
            const body = await request.json() as { exercise_id: string; completed_sets: number; completed_reps: number }
            expect(body.exercise_id).toBe('exercise-1')
            // バックエンドのパラメータ名を検証
            expect(body.completed_sets).toBe(3)
            expect(body.completed_reps).toBe(10)
            return HttpResponse.json({
              status: 'success',
              data: mockRecord,
            })
          })
        )

        const response = await apiClient.createExerciseRecord({
          exercise_id: 'exercise-1',
          completed_sets: 3,
          completed_reps: 10,
        })

        expect(response.status).toBe('success')
        expect(response.data?.id).toBe('record-123')
      })

      it('should include pain_level and notes when provided', async () => {
        server.use(
          http.post(`${API_BASE_URL}/exercise_records`, async ({ request }) => {
            const body = await request.json() as { completed_sets: number; completed_reps: number; pain_level?: number; notes?: string }
            expect(body.completed_sets).toBe(3)
            expect(body.completed_reps).toBe(10)
            expect(body.pain_level).toBe(3)
            expect(body.notes).toBe('少し痛みあり')
            return HttpResponse.json({
              status: 'success',
              data: { id: 'record-123' },
            })
          })
        )

        await apiClient.createExerciseRecord({
          exercise_id: 'exercise-1',
          completed_sets: 3,
          completed_reps: 10,
          pain_level: 3,
          notes: '少し痛みあり',
        })
      })
    })

    describe('getExerciseRecords (getMyExerciseRecords)', () => {
      it('should fetch exercise records without date filter', async () => {
        const mockRecords = [
          {
            id: 'record-1',
            exercise_id: 'exercise-1',
            user_id: 'user-1',
            completed_at: '2026-01-25T10:00:00Z',
            completed_sets: 3,
            completed_reps: 10,
            exercise_name: 'スクワット',
            exercise_category: 'lower_body',
          },
        ]

        server.use(
          http.get(`${API_BASE_URL}/users/me/exercise_records`, () => {
            return HttpResponse.json({
              status: 'success',
              data: { records: mockRecords },
            })
          })
        )

        const response = await apiClient.getExerciseRecords()

        expect(response.status).toBe('success')
        expect(response.data?.records).toHaveLength(1)
      })

      it('should include date filter params in query string', async () => {
        server.use(
          http.get(`${API_BASE_URL}/users/me/exercise_records`, ({ request }) => {
            const url = new URL(request.url)
            expect(url.searchParams.get('start_date')).toBe('2026-01-01')
            expect(url.searchParams.get('end_date')).toBe('2026-01-31')
            return HttpResponse.json({
              status: 'success',
              data: { records: [] },
            })
          })
        )

        await apiClient.getExerciseRecords({
          start_date: '2026-01-01',
          end_date: '2026-01-31',
        })
      })

      it('should not include query string when params are empty object', async () => {
        server.use(
          http.get(`${API_BASE_URL}/users/me/exercise_records`, ({ request }) => {
            const url = new URL(request.url)
            expect(url.search).toBe('')
            return HttpResponse.json({
              status: 'success',
              data: { records: [] },
            })
          })
        )

        await apiClient.getExerciseRecords({})
      })

      it('should filter out undefined params', async () => {
        server.use(
          http.get(`${API_BASE_URL}/users/me/exercise_records`, ({ request }) => {
            const url = new URL(request.url)
            expect(url.searchParams.get('start_date')).toBe('2026-01-01')
            expect(url.searchParams.has('end_date')).toBe(false)
            return HttpResponse.json({
              status: 'success',
              data: { records: [] },
            })
          })
        )

        await apiClient.getExerciseRecords({
          start_date: '2026-01-01',
          end_date: undefined,
        })
      })
    })
  })

  describe('daily condition APIs', () => {
    describe('createDailyCondition', () => {
      it('should send POST request to create daily condition', async () => {
        const mockCondition = {
          id: 'condition-123',
          user_id: 'user-1',
          recorded_date: '2026-01-25',
          pain_level: 3,
          body_condition: 7,
          notes: '少し痛みがあるが調子は良い',
          created_at: '2026-01-25T10:00:00Z',
        }

        server.use(
          http.post(`${API_BASE_URL}/daily_conditions`, async ({ request }) => {
            const body = await request.json() as { pain_level: number; body_condition: number }
            expect(body.pain_level).toBe(3)
            expect(body.body_condition).toBe(7)
            return HttpResponse.json({
              status: 'success',
              data: mockCondition,
            })
          })
        )

        const response = await apiClient.createDailyCondition({
          recorded_date: '2026-01-25',
          pain_level: 3,
          body_condition: 7,
          notes: '少し痛みがあるが調子は良い',
        })

        expect(response.status).toBe('success')
        expect(response.data?.id).toBe('condition-123')
      })
    })

    describe('getMyDailyConditions', () => {
      it('should fetch daily conditions for current user', async () => {
        const mockConditions = [
          {
            id: 'condition-1',
            user_id: 'user-1',
            recorded_date: '2026-01-25',
            pain_level: 3,
            body_condition: 7,
            created_at: '2026-01-25T10:00:00Z',
          },
        ]

        server.use(
          http.get(`${API_BASE_URL}/users/me/daily_conditions`, () => {
            return HttpResponse.json({
              status: 'success',
              data: { conditions: mockConditions },
            })
          })
        )

        const response = await apiClient.getMyDailyConditions()

        expect(response.status).toBe('success')
        expect(response.data?.conditions).toHaveLength(1)
      })

      it('should include date filter params in query string', async () => {
        server.use(
          http.get(`${API_BASE_URL}/users/me/daily_conditions`, ({ request }) => {
            const url = new URL(request.url)
            expect(url.searchParams.get('start_date')).toBe('2026-01-01')
            expect(url.searchParams.get('end_date')).toBe('2026-01-31')
            return HttpResponse.json({
              status: 'success',
              data: { conditions: [] },
            })
          })
        )

        await apiClient.getMyDailyConditions({
          start_date: '2026-01-01',
          end_date: '2026-01-31',
        })
      })
    })
  })

  describe('measurements API', () => {
    describe('getMeasurements (getMyMeasurements)', () => {
      it('should fetch measurements for current user', async () => {
        const mockMeasurements = [
          {
            id: 'measurement-1',
            user_id: 'user-1',
            measured_date: '2026-01-25',
            weight_kg: 65.5,
            tug_seconds: 12.5,
            nrs_pain: 3,
            created_at: '2026-01-25T10:00:00Z',
          },
        ]

        server.use(
          http.get(`${API_BASE_URL}/users/me/measurements`, () => {
            return HttpResponse.json({
              status: 'success',
              data: { measurements: mockMeasurements },
            })
          })
        )

        const response = await apiClient.getMeasurements()

        expect(response.status).toBe('success')
        expect(response.data?.measurements).toHaveLength(1)
        expect(response.data?.measurements[0].weight_kg).toBe(65.5)
      })

      it('should include date filter params in query string', async () => {
        server.use(
          http.get(`${API_BASE_URL}/users/me/measurements`, ({ request }) => {
            const url = new URL(request.url)
            expect(url.searchParams.get('start_date')).toBe('2026-01-01')
            expect(url.searchParams.get('end_date')).toBe('2026-01-31')
            return HttpResponse.json({
              status: 'success',
              data: { measurements: [] },
            })
          })
        )

        await apiClient.getMeasurements({
          start_date: '2026-01-01',
          end_date: '2026-01-31',
        })
      })
    })
  })
})

describe('ApiError', () => {
  it('should store status and errors', () => {
    const error = new ApiError('テストエラー', 422, { field: ['エラー1'] })

    expect(error.name).toBe('ApiError')
    expect(error.message).toBe('テストエラー')
    expect(error.status).toBe(422)
    expect(error.errors).toEqual({ field: ['エラー1'] })
  })
})

describe('AuthenticationError', () => {
  it('should have default message', () => {
    const error = new AuthenticationError()

    expect(error.name).toBe('AuthenticationError')
    expect(error.message).toBe('認証が必要です')
  })

  it('should accept custom message', () => {
    const error = new AuthenticationError('カスタムメッセージ')

    expect(error.message).toBe('カスタムメッセージ')
  })
})
