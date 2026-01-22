import { useState } from 'react'
import { api, ApiError } from '../lib/api'

interface ConnectionStatus {
  status: 'idle' | 'loading' | 'success' | 'error'
  message?: string
  data?: {
    health_status: string
    timestamp: string
    version: string
  }
}

export function ConnectionTest() {
  const [connection, setConnection] = useState<ConnectionStatus>({ status: 'idle' })

  const testConnection = async () => {
    setConnection({ status: 'loading' })

    try {
      const data = await api.checkHealth()
      setConnection({
        status: 'success',
        message: 'バックエンドとの接続に成功しました',
        data,
      })
    } catch (error) {
      const message =
        error instanceof ApiError
          ? `API Error (${error.status}): ${error.message}`
          : error instanceof Error
            ? error.message
            : '接続に失敗しました'

      setConnection({
        status: 'error',
        message,
      })
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">フロントエンド接続テスト</h1>

      <button
        onClick={testConnection}
        disabled={connection.status === 'loading'}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 min-h-[44px]"
      >
        {connection.status === 'loading' ? 'テスト中...' : 'バックエンドへ接続テスト'}
      </button>

      {connection.status === 'success' && (
        <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg">
          <p className="font-semibold">{connection.message}</p>
          {connection.data && (
            <div className="mt-2 text-sm">
              <p>Status: {connection.data.health_status}</p>
              <p>Version: {connection.data.version}</p>
              <p>Timestamp: {connection.data.timestamp}</p>
            </div>
          )}
        </div>
      )}

      {connection.status === 'error' && (
        <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-lg">
          <p className="font-semibold">接続エラー</p>
          <p className="text-sm mt-1">{connection.message}</p>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm">
        <h2 className="font-semibold mb-2">接続情報</h2>
        <p>API URL: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'}</p>
      </div>
    </div>
  )
}
