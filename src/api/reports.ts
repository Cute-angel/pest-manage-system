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
  limit?: number
  offset?: number
  cursor?: string
}

export interface ReportListResult {
  items: ReportSummary[]
  hasMore: boolean
  nextCursor?: string
  total?: number
}

export const reportsApi = {
  async list(params?: ReportListParams) {
    const response = await http.get<
      | ReportSummary[]
      | { items: ReportSummary[]; hasMore?: boolean; nextCursor?: string; total?: number }
      | { data: ReportSummary[] }
      | { data: { items: ReportSummary[]; hasMore?: boolean; nextCursor?: string; total?: number } }
    >('/api/reports', {
      params,
    })

    const items = extractItems(response.data)

    if (Array.isArray(response.data)) {
      return {
        items,
        hasMore: params?.limit ? items.length >= params.limit : false,
      } satisfies ReportListResult
    }

    if ('items' in response.data) {
      return {
        items,
        hasMore: response.data.hasMore ?? (params?.limit ? items.length >= params.limit : false),
        nextCursor: response.data.nextCursor,
        total: response.data.total,
      } satisfies ReportListResult
    }

    const extracted = response.data.data

    if (Array.isArray(extracted)) {
      return {
        items,
        hasMore: params?.limit ? items.length >= params.limit : false,
      } satisfies ReportListResult
    }

    return {
      items,
      hasMore: extracted.hasMore ?? (params?.limit ? items.length >= params.limit : false),
      nextCursor: extracted.nextCursor,
      total: extracted.total,
    } satisfies ReportListResult
  },

  async getById(id: string) {
    const response = await http.get<ReportDetail | { data: ReportDetail }>(`/api/reports/${id}`)
    return extractData(response.data)
  },
}
