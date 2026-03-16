const TOKEN_STORAGE_KEY = 'token'
const AUTHENTICATED_STORAGE_KEY = 'manage-system-authenticated'
const GUEST_STORAGE_KEY = 'manage-system-guest'
const REMEMBERED_PHONE_STORAGE_KEY = 'manage-system-remembered-phone'

export const authStorageKeys = {
  token: TOKEN_STORAGE_KEY,
  authenticated: AUTHENTICATED_STORAGE_KEY,
  guest: GUEST_STORAGE_KEY,
  rememberedPhone: REMEMBERED_PHONE_STORAGE_KEY,
}

export const getAccessToken = () => localStorage.getItem(TOKEN_STORAGE_KEY)

export const isAuthenticatedSession = () => localStorage.getItem(AUTHENTICATED_STORAGE_KEY) === 'true'

export const isGuestSession = () => localStorage.getItem(GUEST_STORAGE_KEY) === 'true'

export const setAuthenticatedSession = (token: string) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
  localStorage.setItem(AUTHENTICATED_STORAGE_KEY, 'true')
  localStorage.setItem(GUEST_STORAGE_KEY, 'false')
}

export const setGuestSession = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.setItem(AUTHENTICATED_STORAGE_KEY, 'false')
  localStorage.setItem(GUEST_STORAGE_KEY, 'true')
}

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
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
