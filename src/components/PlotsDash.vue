<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { plotsInfoApi, toApiError, type Plot } from '../api'

type PlotSeverity = '轻微' | '一般' | '较重' | '严重'

type PlotSeverityItem = {
  id: string
  name: string
  risk: number
  percent: number
  severity: PlotSeverity
  color: string
}

const props = withDefaults(defineProps<{
  title?: string
}>(), {
  title: '地块虫灾程度',
})

const plots = ref<Plot[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const riskToPercent = (risk: number) => Math.round((risk / 255) * 100)

const getSeverity = (percent: number): PlotSeverity => {
  if (percent <= 25) {
    return '轻微'
  }

  if (percent <= 50) {
    return '一般'
  }

  if (percent <= 75) {
    return '较重'
  }

  return '严重'
}

const getRiskColor = (percent: number) => {
  const hue = 120 - (clamp(percent, 0, 100) / 100) * 120
  return `hsl(${hue} 72% 45%)`
}

const plotItems = computed<PlotSeverityItem[]>(() => {
  return plots.value.map((plot) => {
    const percent = riskToPercent(plot.risk)

    return {
      id: plot.id,
      name: plot.name?.trim() || '未命名地块',
      risk: plot.risk,
      percent,
      severity: getSeverity(percent),
      color: getRiskColor(percent),
    }
  })
})

const averagePercent = computed(() => {
  if (plotItems.value.length === 0) {
    return 0
  }

  const total = plotItems.value.reduce((sum, item) => sum + item.percent, 0)
  return Math.round(total / plotItems.value.length)
})

const loadPlots = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    plots.value = await plotsInfoApi.getPlotsInfo()
  } catch (error) {
    errorMessage.value = toApiError(error).message
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void loadPlots()
})
</script>

<template>
  <article class="card analytics-card plots-card">
    <div class="row-between analytics-head">
      <div class="card-copy">
        <p class="card-label">{{ title }}</p>
        <p class="card-value">{{ averagePercent }}<span class="value-unit">%</span></p>
      </div>
      <span class="status-tag status-neutral">{{ plotItems.length }} 个地块</span>
    </div>

    <div class="legend-wrap" aria-hidden="true">
      <div class="legend-bar" />
      <div class="legend-scale">
        <span>轻微</span>
        <span>一般</span>
        <span>较重</span>
        <span>严重</span>
      </div>
    </div>

    <div v-if="isLoading" class="state-wrap">
      <p class="state-text">正在加载地块虫灾数据...</p>
    </div>

    <div v-else-if="errorMessage" class="state-wrap state-error">
      <p class="state-text">{{ errorMessage }}</p>
    </div>

    <div v-else-if="plotItems.length === 0" class="state-wrap">
      <p class="state-text">暂无地块虫灾数据</p>
    </div>

    <div v-else class="plot-list">
      <div v-for="item in plotItems" :key="item.id" class="plot-row">
        <div class="plot-meta">
          <span class="plot-dot" :style="{ backgroundColor: item.color }" />
          <div class="plot-copy">
            <p class="plot-name">{{ item.name }}</p>
            <p class="plot-severity">{{ item.severity }}</p>
          </div>
        </div>

        <div class="plot-stats">
          <span class="plot-risk">{{ item.risk }}/255</span>
          <strong class="plot-percent" :style="{ color: item.color }">{{ item.percent }}%</strong>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.analytics-card {
  padding: 14px;
  gap: 16px;
}

.analytics-head {
  gap: 12px;
}

.card-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-label {
  margin: 0;
  color: var(--shell-text-muted);
  font-size: 12px;
  font-weight: 500;
}

.card-value {
  margin: 0;
  color: var(--shell-text-strong);
  font-size: 24px;
  font-weight: 600;
  line-height: 1;
}

.value-unit {
  margin-left: 2px;
  font-size: 13px;
  color: var(--shell-text-muted);
  font-weight: 500;
}

.legend-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-bar {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(90deg, #3cbf63 0%, #90c93f 32%, #d5a632 60%, #c95b35 82%, #7f1d1d 100%);
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--shell-line) 72%, white);
}

.legend-scale {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.legend-scale span {
  color: var(--shell-text-muted);
  font-size: 11px;
  text-align: center;
}

.plot-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.plot-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: color-mix(in oklab, var(--shell-bg) 84%, white);
  border: 1px solid color-mix(in oklab, var(--shell-line) 74%, white);
}

.plot-meta {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.plot-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  box-shadow: 0 0 0 4px color-mix(in oklab, currentColor 12%, transparent);
  flex: 0 0 10px;
}

.plot-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.plot-name,
.plot-severity,
.plot-risk {
  margin: 0;
}

.plot-name {
  color: var(--shell-text-strong);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plot-severity {
  color: var(--shell-text-muted);
  font-size: 11px;
  font-weight: 500;
}

.plot-stats {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-shrink: 0;
}

.plot-risk {
  color: var(--shell-text-muted);
  font-size: 11px;
  font-weight: 500;
}

.plot-percent {
  font-size: 16px;
  line-height: 1;
}

.state-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 112px;
  border-radius: 10px;
  border: 1px dashed color-mix(in oklab, var(--shell-line) 78%, white);
  background: color-mix(in oklab, var(--shell-bg) 88%, white);
}

.state-error {
  border-color: color-mix(in oklab, var(--shell-warning) 32%, var(--shell-line));
  background: color-mix(in oklab, var(--shell-warning-soft) 24%, white);
}

.state-text {
  margin: 0;
  color: var(--shell-text-muted);
  font-size: 12px;
  font-weight: 500;
  text-align: center;
}

@media (max-width: 420px) {
  .plot-row {
    align-items: flex-start;
  }

  .plot-stats {
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }
}
</style>
