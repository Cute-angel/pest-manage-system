import { extractData, http } from './http'

export interface RecommendationDetail {
  id: string
  title: string
  summary: string
  situation: string
  evidence: string
  action: string
  timeline: string
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
