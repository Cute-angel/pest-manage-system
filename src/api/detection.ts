import type { DetectionResult } from './types'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const hasKeyword = (fileName: string, keywords: RegExp[]) => keywords.some((keyword) => keyword.test(fileName))

export const analyzePestImage = async (file: File): Promise<DetectionResult> => {
  await delay(900)

  const fileName = file.name.toLowerCase()

  if (hasKeyword(fileName, [/healthy/, /clean/, /normal/, /safe/, /正常/, /健康/])) {
    return {
      kind: 'clean',
      title: '未发现明显害虫',
      confidence: 93,
      summary: '叶面纹理完整，暂未发现明显虫体或虫害斑点，建议保持常规巡检频次。',
      pestCounts: [],
    }
  }

  if (hasKeyword(fileName, [/thrip/, /蓟马/])) {
    return {
      kind: 'pest',
      title: '识别到疑似蓟马',
      pestName: '蓟马',
      confidence: 91,
      summary: '叶缘和嫩梢区域存在疑似蓟马活动痕迹，局部斑点分布密集，建议尽快复核。',
      pestCounts: [
        { label: '蓟马', count: 6 },
        { label: '蚜虫', count: 2 },
      ],
      severity: '偏高',
      advice: '建议优先巡查高温干燥区域，并在 12 小时内完成局部点状防治与复拍。',
    }
  }

  if (hasKeyword(fileName, [/whitefly/, /白粉虱/])) {
    return {
      kind: 'pest',
      title: '识别到疑似白粉虱',
      pestName: '白粉虱',
      confidence: 88,
      summary: '图像中叶背区域出现成片浅色虫点，疑似白粉虱附着，建议结合现场设备继续复核。',
      pestCounts: [
        { label: '白粉虱', count: 4 },
      ],
      severity: '轻度',
      advice: '建议继续观察通风口与边缘带，维持诱捕频次，并记录未来 48 小时变化趋势。',
    }
  }

  return {
    kind: 'pest',
    title: '识别到疑似蚜虫',
    pestName: '蚜虫',
    confidence: 95,
    summary: '叶背与嫩梢位置存在明显聚集虫点，符合蚜虫活动特征，建议尽快安排二次巡查。',
    pestCounts: [
      { label: '蚜虫', count: 9 },
      { label: '白粉虱', count: 1 },
    ],
    severity: '中等',
    advice: '建议优先处理幼苗与高湿区域，完成局部处置后 24 小时内再次采样复核。',
  }
}
