import type { AxiosRequestConfig } from 'axios'

import { clearAuthSession, getRefreshToken, setAuthenticatedSession } from './auth-storage'
import { sha256Hex } from './crypto'
import { extractData, http } from './http'

export interface AuthUser {
  id: string
  name: string
  phone: string
  role?: string
  farmName?: string
}

export interface LoginPayload {
  phone: string
  password: string
}

export interface RegisterPayload {
  phone: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export interface RegisterResponse {
  userId?: string
  message?: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

type AuthRequestConfig = AxiosRequestConfig & {
  skipAuthorization?: boolean
  skipAuthRefresh?: boolean
}

export const authApi = {
  async login(payload: LoginPayload) {
    const response = await http.post<LoginResponse | { data: LoginResponse }>('/api/auth/login', {
      phone: payload.phone,
      passwordHash: await sha256Hex(payload.password),
    })
    const result = extractData(response.data)

    setAuthenticatedSession({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    })
    return result
  },

  async register(payload: RegisterPayload) {
    const response = await http.post<RegisterResponse | { data: RegisterResponse }>('/api/auth/register', {
      phone: payload.phone,
      passwordHash: await sha256Hex(payload.password),
    })
    return extractData(response.data)
  },

  async logout() {
    try {
      await http.post('/api/auth/logout')
    } finally {
      clearAuthSession()
    }
  },

  async refresh(refreshToken = getRefreshToken()) {
    if (!refreshToken) {
      throw new Error('缺少 refreshToken')
    }

    const response = await http.post<RefreshTokenResponse | { data: RefreshTokenResponse }>(
      '/api/auth/refresh',
      { refreshToken },
      {
        skipAuthorization: true,
        skipAuthRefresh: true,
      } as AuthRequestConfig,
    )

    return extractData(response.data)
  },
}
