<template>
  <main class="app-page">
    <section class="phone-shell">
      <header class="top-bar home-top">
        <div class="field-sel">
          <span class="field-text">{{ fieldName }}</span>
          <ChevronDown :size="14" class="icon-muted" />
        </div>
<!--        <div class="weather-wrap">-->
<!--          <CloudSun :size="16" class="icon-subtle" />-->
<!--          <span class="weather-text">{{ weatherText }}</span>-->
<!--        </div>-->
        <WeatherStatus :size="16" class="icon-mute" />
      </header>

      <PullToRefresh class="body-scroll home-body" :on-refresh="loadSummary">
        <RouterLink :to="recommendationLink">
          <LatestSuggestion :data="summary?.recommendation" :loading="isLoading" :error="errorMessage" />
        </RouterLink>

        <p v-if="errorMessage" class="page-error">{{ errorMessage }}</p>

        <div class="divider" />

        <section class="stack-16 ">
          <div class="section-head">
            <div>
              <h2 class="section-title">虫害监测概览</h2>
              <p class="eyebrow-text">近七天密度变化与设备状态</p>
            </div>
            <span class="badge-soft">实时更新</span>
          </div>

          <PestTrendCard :data="pestData" :trend-value="pestTrendChange" />
          <DeviceOnlineRateCard :items="deviceStatus" />
        </section>
      </PullToRefresh>

      <BottomNav active="home" />
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

import { dashboardApi, toApiError, type DashboardDeviceStatus, type DashboardSummary } from '../api'
import BottomNav from '../components/BottomNav.vue'
import DeviceOnlineRateCard from '../components/DeviceOnlineRateCard.vue'
import LatestSuggestion from '../components/LatestSuggestion.vue'
import PestTrendCard from '../components/PestTrendCard.vue'
import PullToRefresh from '../components/PullToRefresh.vue'
import '../styles/mobile-shell.css'
import WeatherStatus from "../components/weatherStatus.vue";

type DeviceTone = 'dot-online' | 'dot-offline' | 'dot-maintenance'

type DeviceStatusCardItem = {
  label: string
  count: number
  tone: DeviceTone
}

const summary = ref<DashboardSummary | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')

const toneMap: Record<DashboardDeviceStatus['status'], DeviceTone> = {
  online: 'dot-online',
  offline: 'dot-offline',
  maintenance: 'dot-maintenance',
}

const fieldName = computed(() => summary.value?.fieldName || '地块未配置')
const pestData = computed(() => summary.value?.pestTrend ?? [])
const pestTrendChange = computed(() => summary.value?.pestTrendChange ?? 0)
const deviceStatus = computed<DeviceStatusCardItem[]>(() => {
  return (summary.value?.deviceStatuses ?? []).map((item) => ({
    label: item.label,
    count: item.count,
    tone: toneMap[item.status],
  }))
})

const recommendationLink = computed(() => {
  const recommendationId = summary.value?.recommendation?.id

  if (!recommendationId) {
    return '/recommendation-detail'
  }

  return {
    path: '/recommendation-detail',
    query: {
      id: recommendationId,
    },
  }
})

const loadSummary = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    summary.value = await dashboardApi.getSummary()
  } catch (error) {
    errorMessage.value = toApiError(error).message
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void loadSummary()
})
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



.home-body {
  padding: 20px 20px 12px;
  display: flex;
  flex-direction: column;
}

.stack-16 {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 1rem;
}

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.page-error {
  margin: -12px 0 0;
  color: var(--shell-warning);
  font-size: 12px;
}
</style>
