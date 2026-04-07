<template>
  <article ref="cardRef" class="card analytics-card">
    <div class="row-between analytics-head">
      <div class="card-copy">
        <p class="card-label">{{ title }}</p>
        <p class="card-value">{{ total }} <span class="value-unit">{{ unit }}</span></p>
      </div>
      <div class="trend-pill">
        <TrendingUp :size="14" />
        <span>{{ trendLabel }}</span>
      </div>
    </div>

    <div
      ref="chartShellRef"
      class="chart-shell"
      @mouseleave="handleChartMouseLeave"
      @focusout="handleChartFocusOut"
    >
      <svg class="trend-svg" viewBox="0 0 300 150" :aria-label="`${title}折线图`" role="img">
        <line
          v-for="guide in chartGuides"
          :key="guide"
          x1="24"
          :y1="guide"
          x2="276"
          :y2="guide"
          class="chart-guide"
        />
        <rect
          v-if="activeColumn"
          :x="activeColumn.left"
          y="16"
          :width="activeColumn.width"
          height="110"
          class="chart-active-band"
        />
        <line
          v-if="activeColumn"
          :x1="activeColumn.x"
          y1="16"
          :x2="activeColumn.x"
          y2="126"
          class="chart-active-line"
        />
        <rect
          v-for="column in chartColumns"
          :key="column.label"
          :x="column.left"
          y="16"
          :width="column.width"
          height="110"
          class="chart-hit-area"
          tabindex="0"
          role="button"
          :aria-label="`${column.label}虫害数量`"
          @mouseenter="showHoverTooltip(column.index)"
          @focus="showHoverTooltip(column.index)"
          @click="pinTooltip(column.index)"
          @keydown.enter.prevent="pinTooltip(column.index)"
          @keydown.space.prevent="pinTooltip(column.index)"
        />
        <template v-for="series in chartSeries" :key="series.kind">
          <path :d="series.linePath" class="line-path" :style="{ stroke: series.color }" />
          <circle
            v-for="point in series.points"
            :key="`${series.kind}-${point.label}`"
            :cx="point.x"
            :cy="point.y"
            r="4"
            class="chart-point"
            :class="{ 'is-active': tooltipState?.index === point.index && tooltipState?.activeKind === series.kind }"
            :style="{ stroke: series.color }"
            tabindex="0"
            role="button"
            :aria-label="`${point.label}${series.kind}数量${point.value}${unit}`"
            @mouseenter="showHoverTooltip(point.index, series.kind)"
            @focus="showHoverTooltip(point.index, series.kind)"
            @click.stop="pinTooltip(point.index, series.kind)"
            @keydown.enter.prevent="pinTooltip(point.index, series.kind)"
            @keydown.space.prevent="pinTooltip(point.index, series.kind)"
          />
        </template>
      </svg>

      <div
        v-if="tooltipDetail"
        class="chart-tooltip"
        :class="[`is-${tooltipDetail.align}`, { 'is-pinned': tooltipDetail.pinned }]"
        :style="tooltipStyle"
        role="status"
        aria-live="polite"
      >
        <div class="tooltip-head">
          <div>
            <p class="tooltip-label">{{ tooltipDetail.label }}</p>
            <p class="tooltip-total">总量 {{ tooltipDetail.total }}{{ unit }}</p>
          </div>
          <span v-if="tooltipDetail.pinned" class="tooltip-pin">已固定</span>
        </div>

        <div v-if="tooltipDetail.activeRow" class="tooltip-focus-row">
          <span class="legend-dot" :style="{ backgroundColor: tooltipDetail.activeRow.color }" aria-hidden="true" />
          <span class="tooltip-focus-name">{{ tooltipDetail.activeRow.kind }}</span>
          <span class="tooltip-focus-value">{{ tooltipDetail.activeRow.value }}{{ unit }}</span>
        </div>

        <div class="tooltip-list">
          <div
            v-for="row in tooltipDetail.rows"
            :key="`${tooltipDetail.label}-${row.kind}`"
            class="tooltip-row"
            :class="{ 'is-highlight': row.isActive }"
          >
            <div class="tooltip-row-main">
              <span class="legend-dot" :style="{ backgroundColor: row.color }" aria-hidden="true" />
              <span class="tooltip-row-name">{{ row.kind }}</span>
            </div>
            <span class="tooltip-row-value">{{ row.value }}{{ unit }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="x-axis" :style="axisStyle">
      <span v-for="label in chartLabels" :key="label" class="axis-label">{{ label }}</span>
    </div>

    <div v-if="legendItems.length" class="legend-list">
      <div v-for="item in legendItems" :key="item.kind" class="legend-item">
        <div class="legend-main">
          <span class="legend-dot" :style="{ backgroundColor: item.color }" aria-hidden="true" />
          <span class="legend-name">{{ item.kind }}</span>
        </div>
        <div class="legend-trend" :class="`trend-${item.trend}`">
          <TrendingUp v-if="item.trend === 'up'" :size="14" />
          <TrendingDown v-else-if="item.trend === 'down'" :size="14" />
          <Minus v-else :size="14" />
          <span>{{ item.label }}</span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Minus, TrendingDown, TrendingUp } from 'lucide-vue-next'
import type { DashboardTrendPoint } from '../api'

type ChartPoint = {
  index: number
  label: string
  value: number
  x: number
  y: number
}

type ChartSeries = {
  kind: string
  color: string
  linePath: string
  points: ChartPoint[]
}

type ChartColumn = {
  index: number
  label: string
  x: number
  left: number
  width: number
}

type TrendDirection = 'up' | 'down' | 'flat'

type LegendItem = {
  kind: string
  color: string
  label: string
  trend: TrendDirection
}

type TooltipRow = {
  kind: string
  color: string
  value: number
  isActive: boolean
}

type TooltipState = {
  index: number
  activeKind: string | null
  pinned: boolean
}

const props = withDefaults(defineProps<{
  data: DashboardTrendPoint[]
  title?: string
  unit?: string
  trendValue?: number
}>(), {
  title: '近七天虫害',
  unit: '处',
  trendValue: 18,
})

const chartWidth = 300
const chartPaddingX = 24
const chartTop = 20
const chartBottom = 118
const chartGuides = [24, 56, 88, 120]
const seriesColors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899']
const flatThreshold = 1
const tooltipInset = 10

const cardRef = ref<HTMLElement | null>(null)
const chartShellRef = ref<HTMLDivElement | null>(null)
const tooltipState = ref<TooltipState | null>(null)

const total = computed(() => {
  if (props.data.length === 0) return 0
  let value = 0
  for (let i = 0; i < props.data.length; i++) {
    for (let j = 0; j < props.data[i].values.length; j++) {
      value += props.data[i].values[j].value
    }
  }
  return value
})

const trendLabel = computed(() => {
  if (props.trendValue > 0) {
    return `较上周 +${props.trendValue}%`
  }

  return `较上周 ${props.trendValue}%`
})

const chartLabels = computed(() => props.data.map((item) => item.label))

const chartColumns = computed<ChartColumn[]>(() => {
  if (props.data.length === 0) {
    return []
  }

  return props.data.map((item, index) => {
    const x = props.data.length === 1
      ? chartWidth / 2
      : chartPaddingX + (index * (chartWidth - chartPaddingX * 2)) / (props.data.length - 1)
    const previousX = index === 0 ? chartPaddingX : (
      props.data.length === 1
        ? chartPaddingX
        : chartPaddingX + ((index - 1) * (chartWidth - chartPaddingX * 2)) / (props.data.length - 1)
    )
    const nextX = index === props.data.length - 1 ? chartWidth - chartPaddingX : (
      props.data.length === 1
        ? chartWidth - chartPaddingX
        : chartPaddingX + ((index + 1) * (chartWidth - chartPaddingX * 2)) / (props.data.length - 1)
    )
    const left = index === 0 ? chartPaddingX : (previousX + x) / 2
    const right = index === props.data.length - 1 ? chartWidth - chartPaddingX : (x + nextX) / 2

    return {
      index,
      label: item.label,
      x,
      left,
      width: right - left,
    }
  })
})

const normalizedSeries = computed(() => {
  if (props.data.length === 0) {
    return []
  }

  const seriesMap = new Map<string, number[]>()

  props.data.forEach((point, pointIndex) => {
    point.values.forEach((valueItem) => {
      if (!seriesMap.has(valueItem.kind)) {
        seriesMap.set(valueItem.kind, Array(props.data.length).fill(0))
      }
      seriesMap.get(valueItem.kind)![pointIndex] = valueItem.value
    })
  })

  return Array.from(seriesMap.entries()).map(([kind, values], index) => ({
    kind,
    color: seriesColors[index % seriesColors.length],
    values,
  }))
})

const chartSeries = computed<ChartSeries[]>(() => {
  if (normalizedSeries.value.length === 0) {
    return []
  }

  const allValues = normalizedSeries.value.flatMap((series) => series.values)
  const minValue = Math.min(...allValues)
  const maxValue = Math.max(...allValues)
  const valueRange = maxValue - minValue
  const chartMiddle = (chartTop + chartBottom) / 2

  return normalizedSeries.value.map((series) => {
    const points = series.values.map((value, index) => {
      const x = series.values.length === 1
      ? chartWidth / 2
      : chartPaddingX + (index * (chartWidth - chartPaddingX * 2)) / (series.values.length - 1)
      const y = valueRange === 0
        ? chartMiddle
        : chartBottom - ((value - minValue) / valueRange) * (chartBottom - chartTop)

      return {
        index,
        label: props.data[index]?.label ?? '',
        value,
        x,
        y,
      }
    })

    return {
      kind: series.kind,
      color: series.color,
      points,
      linePath: points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' '),
    }
  })
})

const activeColumn = computed(() => {
  if (!tooltipState.value) {
    return null
  }

  return chartColumns.value[tooltipState.value.index] ?? null
})

const tooltipDetail = computed(() => {
  if (!tooltipState.value) {
    return null
  }

  const column = chartColumns.value[tooltipState.value.index]
  if (!column) {
    return null
  }

  const rows = normalizedSeries.value.map<TooltipRow>((series) => ({
    kind: series.kind,
    color: series.color,
    value: series.values[tooltipState.value!.index] ?? 0,
    isActive: series.kind === tooltipState.value?.activeKind,
  }))
  const totalValue = rows.reduce((sum, row) => sum + row.value, 0)
  const activeRow = rows.find((row) => row.isActive) ?? null
  const leftRatio = column.x / chartWidth
  const align = leftRatio < 0.28 ? 'left' : leftRatio > 0.72 ? 'right' : 'center'

  return {
    label: column.label,
    x: column.x,
    total: totalValue,
    pinned: tooltipState.value.pinned,
    activeRow,
    rows,
    align,
  }
})

const tooltipStyle = computed(() => {
  if (!tooltipDetail.value) {
    return {}
  }

  const leftPercent = (tooltipDetail.value.x / chartWidth) * 100

  return {
    left: `calc(${leftPercent}% - ${tooltipInset}px)`,
  }
})

const legendItems = computed<LegendItem[]>(() => {
  return normalizedSeries.value.map((series) => {
    const firstValue = series.values[0] ?? 0
    const lastValue = series.values[series.values.length - 1] ?? 0
    const delta = lastValue - firstValue

    if (delta > flatThreshold) {
      return {
        kind: series.kind,
        color: series.color,
        label: '增长',
        trend: 'up',
      }
    }

    if (delta < -flatThreshold) {
      return {
        kind: series.kind,
        color: series.color,
        label: '减少',
        trend: 'down',
      }
    }

    return {
      kind: series.kind,
      color: series.color,
      label: '变化不大',
      trend: 'flat',
    }
  })
})

const axisStyle = computed(() => {
  const columnCount = Math.max(chartLabels.value.length, 1)
  return {
    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
  }
})

const showHoverTooltip = (index: number, activeKind: string | null = null) => {
  if (tooltipState.value?.pinned) {
    return
  }

  tooltipState.value = {
    index,
    activeKind,
    pinned: false,
  }
}

const pinTooltip = (index: number, activeKind: string | null = null) => {
  tooltipState.value = {
    index,
    activeKind,
    pinned: true,
  }
}

const clearTooltip = () => {
  tooltipState.value = null
}

const handleChartMouseLeave = () => {
  if (tooltipState.value?.pinned) {
    return
  }

  clearTooltip()
}

const handleChartFocusOut = (event: FocusEvent) => {
  if (tooltipState.value?.pinned) {
    return
  }

  const nextTarget = event.relatedTarget
  if (nextTarget instanceof Node && chartShellRef.value?.contains(nextTarget)) {
    return
  }

  clearTooltip()
}

const handleDocumentPointerDown = (event: PointerEvent) => {
  if (!tooltipState.value?.pinned) {
    return
  }

  const target = event.target
  if (!(target instanceof Node)) {
    return
  }

  if (!cardRef.value?.contains(target)) {
    clearTooltip()
  }
}

const handleDocumentKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && tooltipState.value?.pinned) {
    clearTooltip()
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', handleDocumentPointerDown)
  document.addEventListener('keydown', handleDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
  document.removeEventListener('keydown', handleDocumentKeydown)
})
</script>

<style scoped>
.analytics-card {
  padding: 14px;
  gap: 14px;
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
  margin-left: 4px;
  font-size: 13px;
  color: var(--shell-text-muted);
  font-weight: 500;
}

.trend-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 999px;
  background: color-mix(in oklab, var(--shell-primary-soft) 88%, white);
  color: var(--shell-primary);
  font-size: 11px;
  font-weight: 600;
}

.chart-shell {
  position: relative;
}

.trend-svg {
  width: 100%;
  height: 150px;
  overflow: visible;
}

.chart-guide {
  stroke: color-mix(in oklab, var(--shell-line) 76%, white);
  stroke-width: 1;
  stroke-dasharray: 4 6;
}

.chart-active-band {
  fill: color-mix(in oklab, var(--shell-primary-soft) 42%, transparent);
  rx: 14px;
}

.chart-active-line {
  stroke: color-mix(in oklab, var(--shell-primary) 35%, white);
  stroke-width: 1.5;
  stroke-dasharray: 3 5;
}

.chart-hit-area {
  fill: transparent;
  cursor: pointer;
}

.line-path {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chart-point {
  fill: var(--shell-bg);
  stroke-width: 3;
  cursor: pointer;
}

.chart-point.is-active {
  r: 5;
  filter: drop-shadow(0 0 8px color-mix(in oklab, var(--shell-primary) 32%, transparent));
}

.chart-tooltip {
  position: absolute;
  top: 8px;
  z-index: 2;
  width: min(216px, calc(100% - 20px));
  padding: 12px;
  border: 1px solid color-mix(in oklab, var(--shell-line) 72%, white);
  border-radius: 14px;
  background: color-mix(in oklab, var(--shell-bg) 96%, white);
  box-shadow: 0 18px 36px color-mix(in oklab, var(--color-base-content) 14%, transparent);
  backdrop-filter: blur(10px);
}

.chart-tooltip.is-center {
  transform: translateX(-50%);
}

.chart-tooltip.is-left {
  transform: translateX(0);
}

.chart-tooltip.is-right {
  transform: translateX(-100%);
}

.tooltip-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.tooltip-label {
  margin: 0;
  color: var(--shell-text-strong);
  font-size: 12px;
  font-weight: 700;
}

.tooltip-total {
  margin: 4px 0 0;
  color: var(--shell-text-muted);
  font-size: 11px;
  font-weight: 500;
}

.tooltip-pin {
  color: var(--shell-primary);
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

.tooltip-focus-row {
  margin-top: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: color-mix(in oklab, var(--shell-primary-soft) 74%, white);
}

.tooltip-focus-name {
  min-width: 0;
  color: var(--shell-text-strong);
  font-size: 12px;
  font-weight: 600;
}

.tooltip-focus-value {
  margin-left: auto;
  color: var(--shell-text-strong);
  font-size: 12px;
  font-weight: 700;
}

.tooltip-list {
  display: grid;
  gap: 6px;
  margin-top: 10px;
}

.tooltip-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.tooltip-row.is-highlight {
  color: var(--shell-text-strong);
}

.tooltip-row-main {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tooltip-row-name {
  color: var(--shell-text-muted);
  font-size: 11px;
  font-weight: 500;
}

.tooltip-row.is-highlight .tooltip-row-name {
  color: var(--shell-text-strong);
  font-weight: 600;
}

.tooltip-row-value {
  color: var(--shell-text-strong);
  font-size: 11px;
  font-weight: 700;
}

.x-axis {
  display: grid;
  gap: 8px;
}

.axis-label {
  color: var(--shell-text-muted);
  font-size: 11px;
  text-align: center;
}

.legend-list {
  display: grid;
  gap: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.legend-main {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  flex-shrink: 0;
}

.legend-name {
  color: var(--shell-text-strong);
  font-size: 12px;
  font-weight: 600;
}

.legend-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.trend-up {
  color: #dc2626;
}

.trend-down {
  color: #16a34a;
}

.trend-flat {
  color: var(--shell-text-muted);
}
</style>
