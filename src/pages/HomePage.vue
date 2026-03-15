<template>
  <main class="app-page">
    <section class="phone-shell">
      <header class="top-bar home-top">
        <div class="field-sel">
          <span class="field-text">北区地块</span>
          <ChevronDown :size="14" class="icon-muted" />
        </div>
        <div class="weather-wrap">
          <CloudSun :size="16" class="icon-subtle" />
          <span class="weather-text">24°C · 微风</span>
        </div>
      </header>

      <div class="body-scroll home-body">
        <RouterLink to="/recommendation-detail">

          <LatestSuggestion />

        </RouterLink>

        <div class="divider" />

        <section class="stack-16">
          <div class="section-head">
            <div>
              <h2 class="section-title">虫害监测概览</h2>
              <p class="eyebrow-text">近七天密度变化与设备状态</p>
            </div>
            <span class="badge-soft">实时更新</span>
          </div>

          <PestTrendCard :data="pestData" />
          <DeviceOnlineRateCard :items="deviceStatus" />
        </section>
      </div>

      <BottomNav active="home" />
    </section>
  </main>
</template>

<script setup lang="ts">
import { ChevronDown, CloudSun } from 'lucide-vue-next'
import BottomNav from '../components/BottomNav.vue'
import DeviceOnlineRateCard from '../components/DeviceOnlineRateCard.vue'
import LatestSuggestion from '../components/LatestSuggestion.vue'
import PestTrendCard from '../components/PestTrendCard.vue'
import '../styles/mobile-shell.css'

type PestDatum = {
  label: string
  value: number
}

type DeviceStatus = {
  label: string
  count: number
  rate: number
  tone: 'dot-online' | 'dot-offline' | 'dot-maintenance'
}

const pestData: PestDatum[] = [
  { label: '3/08', value: 12 },
  { label: '3/09', value: 15 },
  { label: '3/10', value: 14 },
  { label: '3/11', value: 199 },
  { label: '3/12', value: 20 },
  { label: '3/13', value: 24 },
  { label: '3/14', value: 11 },
]

const deviceStatus: DeviceStatus[] = [
  { label: '在线', count: 1, rate: 87, tone: 'dot-online' },
  { label: '离线', count: 3, rate: 9, tone: 'dot-offline' },
  { label: '维护中', count: 1, rate: 4, tone: 'dot-maintenance' },
]
</script>

<style scoped>
.home-top {
  height: 68px;
  padding: 12px 20px;
}

.field-sel {
  border: 1px solid var(--shell-line);
  border-radius: 8px;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: color-mix(in oklab, var(--shell-bg) 82%, white);
}

.field-text {
  color: var(--shell-text-strong);
  font-size: 13px;
  font-weight: 500;
}

.weather-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.weather-text {
  color: var(--shell-text-body);
  font-size: 12px;
  font-weight: 500;
}

.home-body {
  padding: 20px 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stack-16 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.fab-row {
  padding: 0 20px 8px;
  display: flex;
  justify-content: flex-end;
}

.fab {
  width: 52px;
  height: 52px;
  border: 0;
  border-radius: 999px;
  background: var(--shell-primary);
  display: grid;
  place-items: center;
  box-shadow: 0 10px 20px color-mix(in oklab, var(--shell-primary) 22%, transparent);
}
</style>
