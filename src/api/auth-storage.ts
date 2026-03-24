const ACCESS_TOKEN_STORAGE_KEY = 'accessToken'
const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken'
const AUTHENTICATED_STORAGE_KEY = 'manage-system-authenticated'
const GUEST_STORAGE_KEY = 'manage-system-guest'
const REMEMBERED_PHONE_STORAGE_KEY = 'manage-system-remembered-phone'

export const authStorageKeys = {
  accessToken: ACCESS_TOKEN_STORAGE_KEY,
  refreshToken: REFRESH_TOKEN_STORAGE_KEY,
  authenticated: AUTHENTICATED_STORAGE_KEY,
  guest: GUEST_STORAGE_KEY,
  rememberedPhone: REMEMBERED_PHONE_STORAGE_KEY,
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)

export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)

export const getAuthTokens = (): AuthTokens | null => {
  const accessToken = getAccessToken()
  const refreshToken = getRefreshToken()

  if (!accessToken || !refreshToken) {
    return null
  }

  return {
    accessToken,
    refreshToken,
  }
}

export const isAuthenticatedSession = () => localStorage.getItem(AUTHENTICATED_STORAGE_KEY) === 'true'

export const isGuestSession = () => localStorage.getItem(GUEST_STORAGE_KEY) === 'true'

export const setAuthenticatedSession = (tokens: AuthTokens) => {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, tokens.accessToken)
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken)
  localStorage.setItem(AUTHENTICATED_STORAGE_KEY, 'true')
  localStorage.setItem(GUEST_STORAGE_KEY, 'false')
}

export const setGuestSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
  localStorage.setItem(AUTHENTICATED_STORAGE_KEY, 'false')
  localStorage.setItem(GUEST_STORAGE_KEY, 'true')
}

export const clearAuthSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
  localStorage.setItem(AUTHENTICATED_STORAGE_KEY, 'false')
  localStorage.setItem(GUEST_STORAGE_KEY, 'false')
}

export const getRememberedPhone = () => localStorage.getItem(REMEMBERED_PHONE_STORAGE_KEY) ?? ''

export const setRememberedPhone = (phone: string) => {
  localStorage.setItem(REMEMBERED_PHONE_STORAGE_KEY, phone)
}

export const clearRememberedPhone = () => {
  localStorage.removeItem(REMEMBERED_PHONE_STORAGE_KEY)
}
