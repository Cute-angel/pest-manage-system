<template>
  <article class="card analytics-card">
    <div class="row-between analytics-head">
      <div class="card-copy">
        <p class="card-label">{{ title }}</p>
        <p class="card-value">{{ total }} <span class="value-unit">{{ unit }}</span></p>
      </div>
      <div class="trend-pill">
        <TrendingUp :size="14" />
        <span>{{ trendText }}</span>
      </div>
    </div>

    <svg class="trend-svg" viewBox="0 0 300 150" :aria-label="`${title}折线图`" role="img">
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--shell-primary)" stop-opacity="0.24" />
          <stop offset="100%" stop-color="var(--shell-primary)" stop-opacity="0" />
        </linearGradient>
      </defs>

      <line
        v-for="guide in chartGuides"
        :key="guide"
        x1="24"
        :y1="guide"
        x2="276"
        :y2="guide"
        class="chart-guide"
      />
      <path :d="areaPath" class="area-path" :style="{ fill: `url(#${gradientId})` }" />
      <path :d="linePath" class="line-path" />
      <circle
        v-for="point in chartPoints"
        :key="point.label"
        :cx="point.x"
        :cy="point.y"
        r="4"
        class="chart-point"
      />
    </svg>

    <div class="x-axis">
      <span v-for="point in chartPoints" :key="point.label" class="axis-label">{{ point.label }}</span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp } from 'lucide-vue-next'

type PestDatum = {
  label: string
  value: number
}

type ChartPoint = PestDatum & {
  x: number
  y: number
}

const props = withDefaults(defineProps<{
  data: PestDatum[]
  title?: string
  unit?: string
  trendText?: string
}>(), {
  title: '近七天虫害',
  unit: '处',
  trendText: '较上周 +18%',
})

const chartWidth = 300
const chartPaddingX = 24
const chartTop = 20
const chartBottom = 118
const chartGuides = [24, 56, 88, 120]
const gradientId = `pestAreaFill-${Math.random().toString(36).slice(2, 8)}`


const total = computed(() => {
  if (props.data.length === 0) return 0
  let value = 0
  for (let i = 0; i < props.data.length; i++) {
    value += props.data[i].value
  }
  return value
})

const chartPoints = computed<ChartPoint[]>(() => {
  if (props.data.length === 0) {
    return []
  }

  const minValue = Math.min(...props.data.map((item) => item.value))
  const maxValue = Math.max(...props.data.map((item) => item.value))
  const valueRange = Math.max(maxValue - minValue, 1)

  return props.data.map((item, index) => {
    const x = props.data.length === 1
      ? chartWidth / 2
      : chartPaddingX + (index * (chartWidth - chartPaddingX * 2)) / (props.data.length - 1)
    const y = chartBottom - ((item.value - minValue) / valueRange) * (chartBottom - chartTop)

    return { ...item, x, y }
  })
})

const linePath = computed(() => chartPoints.value
  .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
  .join(' '))

const areaPath = computed(() => {
  if (chartPoints.value.length === 0) {
    return ''
  }

  const lastPoint = chartPoints.value[chartPoints.value.length - 1]
  const firstPoint = chartPoints.value[0]

  return `${linePath.value} L ${lastPoint.x} ${chartBottom} L ${firstPoint.x} ${chartBottom} Z`
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

.area-path {
  fill: none;
}

.line-path {
  fill: none;
  stroke: var(--shell-primary);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chart-point {
  fill: var(--shell-bg);
  stroke: var(--shell-primary);
  stroke-width: 3;
}

.x-axis {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
}

.axis-label {
  color: var(--shell-text-muted);
  font-size: 11px;
  text-align: center;
}
</style>
