export type DetectionSeverity = 'light' | 'medium' | 'high'

export interface DetectionPestCount {
  code: string
  name: string
  count: number
  sortOrder: number
}

export interface DetectionPestTrend {
  predict: string
  reason: string
}

export interface DetectionCropReduction {
  predict: string
  reason: string
}

export interface DetectionSuggestion {
  primaryPlan: string
  chemical: string
  agricultural: string
  biological: string
  physical: string
  mixing: string
  alternativePlan: string
  reason: string
}

export interface DetectionAiAnalysis {
  risk: string | null
  severity: DetectionSeverity | null
  confidence: number | null
  summary: string
  pestTrend: DetectionPestTrend
  cropReduction: DetectionCropReduction
  weatherImpact: string | null
  alertInfo: string | null
  suggestion: DetectionSuggestion
  reminder: string | null
  timestamp: string | null
}
