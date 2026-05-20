import { extractData, http } from './http'
import type { DetectionAiAnalysis, DetectionPestCount, DetectionSeverity } from './structured-ai'

export type DetectionKind = 'pest' | 'clean'

export interface PestCountItem {
  label: string
  count: number
}

export interface DetectionResult {
  id: string
  processStatus?: string
  modelStatus?: string
  sourceType?: string
  kind: DetectionKind
  title: string
  confidence: number
  summary: string
  annotatedImageUrl?: string
  modelResultImageUrl?: string
  totalPests?: number
  pestCounts: PestCountItem[]
  counts?: DetectionPestCount[]
  pestName?: string
  severity?: DetectionSeverity | string | null
  advice?: string
  aiAnalysis?: DetectionAiAnalysis
}

export interface CreateDetectionRecordPayload {
  detectionId: string
}

export const detectionsApi = {
  async create(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await http.post<DetectionResult | { data: DetectionResult }>('/api/detections', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 1000*600,
    })

    return extractData(response.data)
  },

  async uploadRecord(payload: CreateDetectionRecordPayload) {
    const response = await http.post<{ success: boolean } | { data: { success: boolean } }>(
      '/api/detection-records',
      payload,
    )

    return extractData(response.data)
  },
}
