import { extractData, extractItems, http } from './http'

export type ReportSeverity = 'light' | 'medium' | 'high'
export type ReportStatus = 'monitoring' | 'warning' | 'treated'

export interface ReportSummary {
  id: string
  pestName: string
  severity: ReportSeverity
  summary: string
  status: ReportStatus
  occurredAt: string
}

export interface ReportDetail extends ReportSummary {
  title: string
  imageUrl: string
  deviceName: string
  locationName: string
  recommendationText: string
  recommendationNote: string
}

export interface ReportListParams {
  status?: ReportStatus
}

export const reportsApi = {
  async list(params?: ReportListParams) {
    const response = await http.get<
      ReportSummary[] | { items: ReportSummary[] } | { data: ReportSummary[] } | { data: { items: ReportSummary[] } }
    >('/api/reports', {
      params,
    })

    return extractItems(response.data)
  },

  async getById(id: string) {
    const response = await http.get<ReportDetail | { data: ReportDetail }>(`/api/reports/${id}`)
    return extractData(response.data)
  },
}
