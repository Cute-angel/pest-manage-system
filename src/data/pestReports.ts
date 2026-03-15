import { Bug, Leaf, ShieldCheck } from 'lucide-vue-next'

import type { Component } from 'vue'

export type PestSeverityClass = 'badge-soft' | 'badge-warm'
export type PestStatusClass = 'status-neutral' | 'status-warm'

export type PestTimelineItem = {
  id: string
  dayLabel: string
  icon: Component
  name: string
  severity: string
  severityClass: PestSeverityClass
  summary: string
  status: string
  statusClass: PestStatusClass
  reportTitle: string
  imageUrl: string
  deviceName: string
  locationName: string
  recommendationText: string
  recommendationNote: string
}

export const pestReports: PestTimelineItem[] = [
  {
    id: 'aphid-north-plot',
    dayLabel: '今天 · 3月14日',
    icon: Bug,
    name: '蚜虫',
    severity: '中等',
    severityClass: 'badge-soft',
    summary: '东侧幼苗区叶背虫点持续增加，建议当日完成复查。',
    status: 'monitoring',
    statusClass: 'status-neutral',
    reportTitle: '蚜虫监测报告',
    imageUrl:
      'https://images.unsplash.com/photo-1615486363979-86dcbefb5076?auto=format&fit=crop&w=1200&q=80',
    deviceName: '诱捕设备 A-03',
    locationName: '北区 2 号棚东侧',
    recommendationText: '建议在今日 18:00 前完成局部点状防治，并在处理后 24 小时内复测同一区域虫口密度。',
    recommendationNote: '重点关注叶背与嫩梢交界处，避免遗漏高湿阴影带。',
  },
  {
    id: 'thrips-west-field',
    dayLabel: '昨天 · 3月13日',
    icon: Leaf,
    name: '蓟马',
    severity: '偏高',
    severityClass: 'badge-warm',
    summary: '西区样本斑点扩散加快，需尽快组织复检与处置。',
    status: 'warning',
    statusClass: 'status-warm',
    reportTitle: '蓟马监测报告',
    imageUrl:
      'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1200&q=80',
    deviceName: '高清巡检设备 B-11',
    locationName: '西区露天 4 号垄',
    recommendationText: '建议优先封控西区高风险带，对受害叶面进行定点处理，并于明日 08:00 前完成复检记录。',
    recommendationNote: '若风速持续升高，优先处理边缘地块，防止虫源外扩。',
  },
  {
    id: 'whitefly-greenhouse',
    dayLabel: '昨天 · 3月13日',
    icon: ShieldCheck,
    name: '白粉虱',
    severity: '轻度',
    severityClass: 'badge-soft',
    summary: '局部处理后虫口密度回落，建议维持观察。',
    status: 'treated',
    statusClass: 'status-neutral',
    reportTitle: '白粉虱监测报告',
    imageUrl:
      'https://images.unsplash.com/photo-1629553277601-f8cba8f7e961?auto=format&fit=crop&w=1200&q=80',
    deviceName: '粘虫板设备 C-07',
    locationName: '温室南侧通道口',
    recommendationText: '建议保持现有防治频次，连续 48 小时观察诱捕量变化，确认虫口密度稳定后再调整策略。',
    recommendationNote: '重点复核通道附近的叶片背面，防止残留虫源回升。',
  },
]

export const pestReportMap = new Map(pestReports.map((item) => [item.id, item]))
