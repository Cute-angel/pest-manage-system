import { extractData, http } from './http'
import { sha256Hex } from './crypto'


export interface UserProfile {
  id: string
  name: string
  phone: string
  role: string
  farmName: string
  onlineDeviceCount: number
  monthlyInspections: number
  taskCompletionRate: number
}

export interface UpdateMePayload {
  name: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export const userApi = {
  async getMe() {
    const response = await http.get<UserProfile | { data: UserProfile }>('/api/users/me')
    return extractData(response.data)
  },

  async updateMe(payload: UpdateMePayload) {
    const response = await http.post<UserProfile | { data: UserProfile }>('/api/users/me', {
      name: payload.name.trim(),
    })
    return extractData(response.data)
  },

  async changePassword(payload: ChangePasswordPayload) {
    const response = await http.post<{ success: boolean } | { data: { success: boolean } }>(
      '/api/users/change-password',
      {
        currentPasswordHash: await sha256Hex(payload.currentPassword),
        newPasswordHash: await sha256Hex(payload.newPassword),
      },
    )

    return extractData(response.data)
  },
}
