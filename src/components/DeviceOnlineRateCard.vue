<template>
  <article class="card analytics-card online-card">
    <div class="row-between analytics-head">
      <div class="card-copy">
        <p class="card-label">{{ title }}</p>
        <p class="card-value">{{ onlineRate }}<span class="value-unit">%</span></p>
      </div>
      <span class="status-tag status-neutral">{{ totalDevices }} 台设备</span>
    </div>

    <div class="online-layout">
      <div class="gauge-wrap">
        <svg class="gauge-svg" viewBox="0 0 120 120" :aria-label="`${title}图表`" role="img">
          <circle class="gauge-track" cx="60" cy="60" r="42" />
          <circle
            class="gauge-progress"
            cx="60"
            cy="60"
            r="42"
            :stroke-dasharray="gaugeCircumference"
            :stroke-dashoffset="gaugeOffset"
          />
        </svg>
        <div class="gauge-center">
          <strong>{{ onlineRate }}%</strong>
          <span>在线</span>
        </div>
      </div>

      <div class="status-list">
        <div v-for="item in items" :key="item.label" class="status-row">
          <div class="status-meta">
            <span class="status-dot" :class="item.tone" />
            <span class="status-name">{{ item.label }}</span>
          </div>
          <div class="status-stats">
            <span class="status-count">{{ item.count }} 台</span>
            <span class="status-rate">{{ itemRate(item) }}%</span>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type DeviceTone = 'dot-online' | 'dot-offline' | 'dot-maintenance'

type DeviceStatus = {
  label: string
  count: number
  tone: DeviceTone
}

const props = withDefaults(defineProps<{
  items?: DeviceStatus[]
  title?: string
}>(), {
  items: () => [
    { label: '在线', count: 5, tone: 'dot-online' },
    { label: '离线', count: 0, tone: 'dot-offline' },
    { label: '维护中', count: 1, tone: 'dot-maintenance' },
  ],
  title: '设备在线率',
})

const itemRate = (item: DeviceStatus) => {
  if (totalDevices.value === 0) {
    return 0
  }

  return Math.round((item.count / totalDevices.value) * 100)
}

const gaugeRadius = 42
const gaugeCircumference = 2 * Math.PI * gaugeRadius

const totalDevices = computed(() => props.items.reduce((sum, item) => sum + item.count, 0))
const onlineCount = computed(() => props.items[0]?.count ?? 0)
const onlineRate = computed(() => {
  if (totalDevices.value === 0) {
    return 0
  }

  return Math.round((onlineCount.value / totalDevices.value) * 100)
})
const gaugeOffset = computed(() => gaugeCircumference * (1 - onlineRate.value / 100))
</script>

<style scoped>
.analytics-card {
  padding: 14px;
  gap: 18px;
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

.online-layout {
  display: flex;
  align-items: center;
  gap: 16px;
}

.gauge-wrap {
  position: relative;
  width: 120px;
  height: 120px;
  flex: 0 0 120px;
}

.gauge-svg {
  width: 120px;
  height: 120px;
  transform: rotate(-90deg);
}

.gauge-track,
.gauge-progress {
  fill: none;
  stroke-width: 10;
}

.gauge-track {
  stroke: color-mix(in oklab, var(--shell-line) 90%, white);
}

.gauge-progress {
  stroke: var(--shell-primary);
  stroke-linecap: round;
  transition: stroke-dashoffset 240ms ease;
}

.gauge-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.gauge-center strong {
  color: var(--shell-text-strong);
  font-size: 24px;
  line-height: 1;
}

.gauge-center span {
  color: var(--shell-text-muted);
  font-size: 11px;
  font-weight: 500;
}

.status-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.status-meta,
.status-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
}

.dot-online {
  background: var(--shell-primary);
}

.dot-offline {
  background: var(--shell-warning);
}

.dot-maintenance {
  background: color-mix(in oklab, var(--shell-text-muted) 74%, white);
}

.status-name,
.status-count {
  color: var(--shell-text-body);
  font-size: 12px;
  font-weight: 500;
}

.status-rate {
  color: var(--shell-text-strong);
  font-size: 13px;
  font-weight: 600;
}

@media (max-width: 420px) {
  .online-layout {
    flex-direction: column;
    align-items: stretch;
  }

  .gauge-wrap {
    align-self: center;
  }
}
</style>
