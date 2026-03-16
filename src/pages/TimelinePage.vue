<template>
  <main class="app-page">
    <section class="phone-shell">
      <header class="top-bar timeline-top">
        <h1 class="title">时间线</h1>
        <span class="weather">{{ timelineMetaText }}</span>
      </header>

      <div class="body-scroll timeline-body">
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
        <p v-else-if="groupedReports.length === 0" class="state-text">当前没有可展示的巡检记录。</p>

        <section v-for="group in groupedReports" :key="group.dayLabel" class="timeline-group">
          <p class="date eyebrow-text">{{ group.dayLabel }}</p>
          <TimelineItemCard
            v-for="item in group.items"
            :key="item.id"
            :item="item"
            :to="`/timeline/${item.id}`"
          />
        </section>
      </div>

      <BottomNav active="timeline" />
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Bug, Leaf, ShieldCheck } from 'lucide-vue-next'
import type { Component } from 'vue'

import { reportsApi, toApiError, type ReportSeverity, type ReportStatus, type ReportSummary } from '../api'
import BottomNav from '../components/BottomNav.vue'
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

const filters: Array<{ label: string; value: FilterValue }> = [
  { label: '全部', value: 'all' },
  { label: 'monitoring', value: 'monitoring' },
  { label: 'warning', value: 'warning' },
  { label: 'treated', value: 'treated' },
]

const reports = ref<ReportSummary[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const activeFilter = ref<FilterValue>('all')

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
  monitoring: 'monitoring',
  warning: 'warning',
  treated: 'treated',
}

const timelineMetaText = computed(() => {
  if (reports.value.length === 0) {
    return '暂无数据'
  }

  return `${reports.value.length} 条巡检记录`
})

const groupedReports = computed(() => {
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

  try {
    reports.value = await reportsApi.list(activeFilter.value === 'all' ? undefined : { status: activeFilter.value })
  } catch (error) {
    reports.value = []
    errorMessage.value = toApiError(error).message
  } finally {
    isLoading.value = false
  }
}

watch(activeFilter, () => {
  void loadReports()
}, { immediate: true })

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
</style>
