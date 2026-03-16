import axios, { AxiosError } from 'axios'

import { clearAuthSession, getAccessToken } from './auth-storage'

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

const DEFAULT_API_BASE_URL = 'http://localhost:8000'

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL

export const http = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

http.interceptors.request.use((config) => {
  const token = getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError = toApiError(error)

    if (apiError.status === 401) {
      clearAuthSession()
    }

    return Promise.reject(apiError)
  },
)

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
      code: error.code,
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
