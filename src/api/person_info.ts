import { server_address } from './index'
import type { LoginInfo } from './types'

export const login = async (user: string, password: string): Promise<LoginInfo> => {
  try {
    const res = await fetch(`${server_address}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user, password }),
    })

    if (!res.ok) {
      throw new Error(`Login request failed with status ${res.status}`)
    }

    const response = (await res.json()) as LoginInfo

    localStorage.setItem('token', response.token)
    localStorage.setItem('manage-system-authenticated', 'true')
    localStorage.setItem('manage-system-guest', 'false')

    return response
  } catch (err) {
    console.error('Login failed:', err)
    throw err
  }
}

export const logout = async (): Promise<void> => {
  localStorage.removeItem('token')
  localStorage.setItem('manage-system-authenticated', 'false')
  localStorage.setItem('manage-system-guest', 'false')
}
