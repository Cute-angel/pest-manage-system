<template>
  <main class="app-page">
    <section class="phone-shell">
      <header class="top-bar timeline-top">
        <h1 class="title">时间线</h1>
        <span class="weather">{{ timelineMetaText }}</span>
      </header>

      <PullToRefresh
        ref="pullToRefreshRef"
        class="body-scroll"
        :on-refresh="loadReports"
        @scroll.passive="handleScroll"
      >
        <div class="timeline-body">
          <div class="filter-row">
            <button
                v-for="filter in filters"
                :key="filter.value"
                class="chip"
                :class="chipClass(filter.value)"
                type="button"
                @click="activeFilter = filter.value"
            >
              {{ filter.label }}
            </button>
          </div>

          <p v-if="isLoading" class="state-text">正在加载时间线...</p>
          <p v-else-if="errorMessage" class="state-text state-error">{{ errorMessage }}</p>
          <p v-else-if="reports.length === 0" class="state-text">当前没有可展示的巡检记录。</p>

          <section v-for="group in groupedReports" :key="group.dayLabel" class="timeline-group">
            <p class="date eyebrow-text">{{ group.dayLabel }}</p>
            <TimelineItemCard
                v-for="item in group.items"
                :key="item.id"
                :item="item"
                :to="`/timeline/${item.id}`"
            />
          </section>

          <p v-if="isLoadingMore" class="state-text">正在加载更多...</p>
          <div v-else-if="reports.length > 0 && !hasMore">
            <div class="divider divider-neutral/100 end-text">
              已经到底了
            </div>
          </div>
        </div>

      </PullToRefresh>

      <BottomNav active="timeline" />
    </section>
  </main>
</template>

<script setup lang="ts">
import {computed, ComputedRef, nextTick, ref, watch} from 'vue'
import { Bug, Leaf, ShieldCheck } from 'lucide-vue-next'
import type { Component } from 'vue'

import { reportsApi, toApiError, type ReportSeverity, type ReportStatus, type ReportSummary } from '../api'
import BottomNav from '../components/BottomNav.vue'
import PullToRefresh from '../components/PullToRefresh.vue'
import TimelineItemCard from '../components/TimelineItemCard.vue'
import '../styles/mobile-shell.css'

type TimelineCardItem = {
  id: string
  icon: Component
  name: string
  severity: string
  summary: string
  status: string
  severityClass: 'badge-soft' | 'badge-warm'
  statusClass: 'status-neutral' | 'status-warm'
}

type FilterValue = 'all' | ReportStatus

type PullToRefreshExposed = {
  containerRef: HTMLElement | null
}

const filters: Array<{ label: string; value: FilterValue }> = [
  { label: '全部', value: 'all' },
  { label: '监测中', value: 'monitoring' },
  { label: '预警', value: 'warning' },
  { label: '已处理', value: 'treated' },
]

const reports = ref<ReportSummary[]>([])
const isLoading = ref(false)
const isLoadingMore = ref(false)
const errorMessage = ref('')
const activeFilter = ref<FilterValue>('all')
const hasMore = ref(true)
const nextCursor = ref<string>()
const totalCount = ref<number>()
const pullToRefreshRef = ref<PullToRefreshExposed | null>(null)
const PAGE_SIZE = 5

const iconMap: Record<ReportStatus, Component> = {
  monitoring: Bug,
  warning: Leaf,
  treated: ShieldCheck,
}

const severityLabelMap: Record<ReportSeverity, string> = {
  light: '轻度',
  medium: '中等',
  high: '偏高',
}

const severityClassMap: Record<ReportSeverity, 'badge-soft' | 'badge-warm'> = {
  light: 'badge-soft',
  medium: 'badge-soft',
  high: 'badge-warm',
}

const statusClassMap: Record<ReportStatus, 'status-neutral' | 'status-warm'> = {
  monitoring: 'status-neutral',
  warning: 'status-warm',
  treated: 'status-neutral',
}

const statusLabelMap: Record<ReportStatus, string> = {
  monitoring: '监测中',
  warning: '预警',
  treated: '已处理',
}

const timelineMetaText:ComputedRef<string> = computed(() => {
  const count = totalCount.value ?? reports.value.length

  if (count === 0) {
    return '暂无数据'
  }

  return `${count} 条巡检记录`
})


// return grouped type
const groupedReports = computed(() => {
  // 接口返回的是扁平列表，页面展示时按日期重新聚合。
  const groups = new Map<string, TimelineCardItem[]>()

  reports.value.forEach((report) => {
    const dayLabel = formatDayLabel(report.occurredAt)
    const items = groups.get(dayLabel) ?? []

    items.push({
      id: report.id,
      icon: iconMap[report.status],
      name: report.pestName,
      severity: severityLabelMap[report.severity],
      summary: report.summary,
      status: statusLabelMap[report.status],
      severityClass: severityClassMap[report.severity],
      statusClass: statusClassMap[report.status],
    })

    groups.set(dayLabel, items)
  })

  return Array.from(groups.entries()).map(([dayLabel, items]) => ({
    dayLabel,
    items,
  }))
})

const chipClass = (value: FilterValue) => ({
  'chip-active': activeFilter.value === value,
  'chip-warn': value === 'warning',
})

const loadReports = async () => {
  isLoading.value = true
  errorMessage.value = ''
  hasMore.value = true
  nextCursor.value = undefined
  totalCount.value = undefined
  reports.value = []
  // send get to backend
  try {
    const result = await reportsApi.list({
      ...(activeFilter.value === 'all' ? {} : { status: activeFilter.value }),
      limit: PAGE_SIZE,
      offset: 0,
    })
    // update
    reports.value = result.items
    hasMore.value = result.hasMore
    nextCursor.value = result.nextCursor
    totalCount.value = result.total
  } catch (error) {
    reports.value = []
    errorMessage.value = toApiError(error).message
    hasMore.value = false
  } finally {
    isLoading.value = false
    await nextTick()
    tryLoadMore()
  }
}

const loadMoreReports = async () => {
  console.log('loadMoreReports')
  // 只在当前没有进行中的请求时，继续拉取下一页。
  if (isLoading.value || isLoadingMore.value || !hasMore.value) {
    return
  }

  isLoadingMore.value = true

  try {
    const result = await reportsApi.list({
      ...(activeFilter.value === 'all' ? {} : { status: activeFilter.value }),
      limit: PAGE_SIZE,
      offset: reports.value.length,
      cursor: nextCursor.value,
    })
    reports.value = [...reports.value, ...result.items]
    hasMore.value = result.hasMore
    nextCursor.value = result.nextCursor
    totalCount.value = result.total ?? totalCount.value
  } catch (error) {
    errorMessage.value = toApiError(error).message
  } finally {
    isLoadingMore.value = false
    await nextTick()
    tryLoadMore()
  }
}

// refresh list when change the type
watch(activeFilter, () => {
  void loadReports()
}, { immediate: true })

function handleScroll(event: Event) {
  const target = event.target as HTMLElement | null

  if (!target) {
    return
  }

  tryLoadMore()
}

function tryLoadMore() {
  const container = pullToRefreshRef.value?.containerRef

  if (!container || isLoading.value || isLoadingMore.value || !hasMore.value) {
    return
  }
  console.log('load more')
  // 提前一点发起下一页请求，避免用户滚到底部后才开始等待。
  const remaining = container.scrollHeight - container.scrollTop - container.clientHeight

  if (remaining <= 240 || container.scrollHeight <= container.clientHeight + 1) {
    void loadMoreReports()
  }
}

function formatDayLabel(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '未知日期'
  }

  const today = startOfDay(new Date())
  const target = startOfDay(date)
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000)
  const formatted = `${date.getMonth() + 1}月${date.getDate()}日`

  if (diffDays === 0) {
    return `今天 · ${formatted}`
  }

  if (diffDays === 1) {
    return `昨天 · ${formatted}`
  }

  return formatted
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}
</script>

<style scoped>
.timeline-top {
  height: 66px;
  padding: 12px 20px;
}

.title {
  margin: 0;
  color: var(--shell-text-strong);
  font-size: 20px;
  font-weight: 600;
}

.weather {
  color: var(--shell-text-subtle);
  font-size: 11px;
  font-weight: 500;
}

.timeline-body {
  padding: 16px 20px 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.timeline-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chip {
  border: 1px solid var(--shell-line);
  border-radius: 999px;
  background: var(--shell-bg-muted);
  color: var(--shell-text-subtle);
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 500;
}

.chip-active {
  border: 0;
  background: var(--shell-primary-soft);
  color: var(--shell-primary);
  font-weight: 600;
}

.chip-warn {
  color: var(--shell-warning);
}

.state-text {
  margin: 4px 0;
  color: var(--shell-text-muted);
  font-size: 12px;
}

.state-error {
  color: var(--shell-warning);
}

.end-text {
  color: var(--shell-text-muted);
}
</style>
