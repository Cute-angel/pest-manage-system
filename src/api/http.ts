import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { clearAuthSession, getAccessToken, getRefreshToken, setAuthenticatedSession } from './auth-storage'

export interface ApiError {
  message: string
  status?: number
  code?: string
  details?: unknown
}

type DataEnvelope<T> = {
  data: T
}

type ItemsEnvelope<T> = {
  items: T[]
}

type RefreshResponse = {
  accessToken: string
  refreshToken: string
}

type RefreshResponseEnvelope = RefreshResponse | DataEnvelope<RefreshResponse>

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
  skipAuthorization?: boolean
  skipAuthRefresh?: boolean
}

const DEFAULT_API_BASE_URL = 'http://localhost:8000'
const AUTH_EXPIRED_CODES = new Set(['TOKEN_EXPIRED', 'ACCESS_TOKEN_EXPIRED', 'AUTH_TOKEN_EXPIRED'])

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL

export const http = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const refreshHttp = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

let refreshRequest: Promise<string> | null = null

http.interceptors.request.use((config) => {
  const requestConfig = config as RetryableRequestConfig
  const token = getAccessToken()

  if (requestConfig.skipAuthorization) {
    delete requestConfig.headers.Authorization
  } else if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`
  } else if (requestConfig.headers.Authorization) {
    delete requestConfig.headers.Authorization
  }

  return requestConfig
})

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined

    if (shouldRefresh(error, originalRequest)) {
      try {
        const nextAccessToken = await refreshAccessToken()

        if (!originalRequest) {
          throw error
        }

        originalRequest._retry = true
        originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`

        return http(originalRequest)
      } catch (refreshError) {
        clearSessionAndRedirectToLogin()
        return Promise.reject(toApiError(refreshError))
      }
    }

    const apiError = toApiError(error)

    if (apiError.status === 401) {
      clearAuthSession()
    }

    return Promise.reject(apiError)
  },
)

const refreshAccessToken = async () => {
  if (!refreshRequest) {
    refreshRequest = (async () => {
      const refreshToken = getRefreshToken()

      if (!refreshToken) {
        throw new Error('缺少 refreshToken')
      }

      const response = await refreshHttp.post<RefreshResponseEnvelope>(
        '/api/auth/refresh',
        { refreshToken },
        {
          headers: {
            Authorization: undefined,
          },
        },
      )
      const tokens = extractData(response.data)

      if (!tokens.accessToken || !tokens.refreshToken) {
        throw new Error('refresh 响应缺少 token')
      }

      setAuthenticatedSession(tokens)
      return tokens.accessToken
    })().finally(() => {
      refreshRequest = null
    })
  }

  return refreshRequest
}

const shouldRefresh = (error: AxiosError, originalRequest?: RetryableRequestConfig) => {
  if (!originalRequest || originalRequest._retry || originalRequest.skipAuthRefresh) {
    return false
  }

  const requestUrl = originalRequest.url ?? ''

  if (requestUrl.endsWith('/api/auth/login') || requestUrl.endsWith('/api/auth/register') || requestUrl.endsWith('/api/auth/refresh')) {
    return false
  }

  const responseStatus = error.response?.status
  const responseCode = pickString((error.response?.data as Record<string, unknown> | undefined)?.code)

  return responseStatus === 401 || AUTH_EXPIRED_CODES.has(responseCode)
}

const clearSessionAndRedirectToLogin = () => {
  clearAuthSession()

  if (typeof window === 'undefined') {
    return
  }

  const loginPath = '/login'
  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`

  if (window.location.pathname === loginPath) {
    return
  }

  const nextUrl = `${loginPath}?redirect=${encodeURIComponent(currentPath)}`
  window.location.replace(nextUrl)
}

export const toApiError = (error: unknown): ApiError => {
  if (isApiError(error)) {
    return error
  }

  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as Record<string, unknown> | undefined
    const message =
      pickString(responseData?.message) ||
      pickString(responseData?.error) ||
      error.message ||
      '请求失败，请稍后重试'

    return {
      message,
      status: error.response?.status,
      code: pickString(responseData?.code) || error.code,
      details: responseData,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    }
  }

  return {
    message: '请求失败，请稍后重试',
  }
}

export const extractData = <T>(payload: T | DataEnvelope<T>): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as DataEnvelope<T>).data
  }

  return payload as T
}

export const extractItems = <T>(
  payload: T[] | ItemsEnvelope<T> | DataEnvelope<T[]> | DataEnvelope<ItemsEnvelope<T>>,
): T[] => {
  if (Array.isArray(payload)) {
    return payload
  }

  if ('items' in payload) {
    return payload.items
  }

  const extracted = payload.data

  if (Array.isArray(extracted)) {
    return extracted
  }

  return extracted.items
}

const isApiError = (error: unknown): error is ApiError => {
  return Boolean(error) && typeof error === 'object' && error !== null && 'message' in error
}

const pickString = (value: unknown) => {
  return typeof value === 'string' && value.trim() ? value : ''
}
