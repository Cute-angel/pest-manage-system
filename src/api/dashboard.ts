import { extractData, http } from './http'

export type DeviceStatusKind = 'online' | 'offline' | 'maintenance'

export interface DashboardTrendPoint {
  label: string
  value: number
}

export interface DashboardRecommendationPreview {
  id: string
  title: string
  description: string
  evidence: string
}

export interface DashboardDeviceStatus {
  label: string
  count: number
  status: DeviceStatusKind
}

export interface DashboardSummary {
  fieldName: string
  weatherText: string
  recommendation: DashboardRecommendationPreview | null
  pestTrend: DashboardTrendPoint[]
  pestTrendChange: number
  deviceStatuses: DashboardDeviceStatus[]
}

export const dashboardApi = {
  async getSummary() {
    const response = await http.get<DashboardSummary | { data: DashboardSummary }>('/api/dashboard/summary')
    return extractData(response.data)
  },
}
