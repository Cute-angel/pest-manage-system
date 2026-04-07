import { extractData, http } from './http'

declare const plotRiskBrand: unique symbol

export type PlotRisk = number & {
  readonly [plotRiskBrand]: 'PlotRisk'
}

export interface Plot {
  id: string
  name?: string
  description?: string
  risk: PlotRisk,
  location?:[number, number][]
}

type PlotDto = Omit<Plot, 'risk'> & {
  risk: number
}

export function isPlotRisk(value: number): value is PlotRisk {
  return Number.isInteger(value) && value >= 0 && value <= 255
}

export function toPlotRisk(value: number): PlotRisk {
  if (!isPlotRisk(value)) {
    throw new RangeError(`risk must be an integer between 0 and 255, received: ${value}`)
  }

  return value
}

const normalizePlot = (plot: PlotDto): Plot => {
  return {
    ...plot,
    risk: toPlotRisk(plot.risk),
  }
}

export const plotsInfoApi = {
  async getPlotsInfo() {
    const response = await http.get<PlotDto[] | { data: PlotDto[] }>('/api/plots')
    return extractData(response.data).map(normalizePlot)
  },
}
