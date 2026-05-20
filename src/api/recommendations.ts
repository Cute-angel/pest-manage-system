import { extractData, http } from './http'
import type { DetectionAiAnalysis } from './structured-ai'

export interface RecommendationDetail {
  id: string
  reportId?: string
  detectionId?: string
  title: string
  summary: string
  situation: string
  evidence: string
  action: string
  timeline: string
  aiAnalysis?: DetectionAiAnalysis
}

export const recommendationsApi = {
  async getLatest() {
    const response = await http.get<RecommendationDetail | { data: RecommendationDetail }>(
      '/api/recommendations/latest',
    )
    return extractData(response.data)
  },

  async getById(id: string) {
    const response = await http.get<RecommendationDetail | { data: RecommendationDetail }>(
      `/api/recommendations/${id}`,
    )
    return extractData(response.data)
  },
}
