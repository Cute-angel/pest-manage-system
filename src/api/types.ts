export interface UserInfo {
  username: string;
}

export type Level = 'light' | 'mid' | 'high'

// 展示的类型: 虫害、监测设备信息、环境信息
export type Kind = 'bug' | 'monitor' | 'environment'

export interface MonitorInfo {
  // 唯一 id
  id: number
  // 信息展示的标题
  title: string
  // 展示的信息
  info: string
  level: Level
  kind: Kind
  time: Date
}

export interface LoginInfo {
  token: string
  user: UserInfo
}

export type DetectionKind = 'pest' | 'clean'

export interface PestCountItem {
  label: string
  count: number
}

export interface DetectionResult {
  kind: DetectionKind
  title: string
  confidence: number
  summary: string
  annotatedImageUrl?: string
  pestCounts: PestCountItem[]
  pestName?: string
  severity?: string
  advice?: string
}

export interface HomePageSuggest {
  title: string
  description: string
  depend:String
}
