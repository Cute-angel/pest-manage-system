import { extractData, http } from './http'

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

export const userApi = {
  async getMe() {
    const response = await http.get<UserProfile | { data: UserProfile }>('/api/users/me')
    return extractData(response.data)
  },
}
