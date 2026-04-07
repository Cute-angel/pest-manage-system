<template>
  <main class="app-page">
    <section class="phone-shell">
      <header class="top-bar home-top">
        <button class="field-sel" style="anchor-name:--anchor-1" popovertarget="popover-1" type="button">
          <span class="field-text">{{ fieldName }}</span>
          <ChevronDown :size="14" class="icon-muted" />
        </button>
        <div ref="dropdownRef" popover id="popover-1" style="position-anchor: --anchor-1" class="dropdown">
          <button
            class="dropdown-item"
            :class="{ 'is-active': isGlobalView }"
            type="button"
            @click="selectGlobalView"
          >
            <div class="dropdown-copy">
              <span class="dropdown-title">{{ globalFieldName }}</span>
              <span class="dropdown-note">全局总览</span>
            </div>
            <span v-if="isGlobalView" class="dropdown-check">当前</span>
          </button>

          <p v-if="plotsError" class="dropdown-status">{{ plotsError }}</p>

          <button
            v-for="plot in plots"
            :key="plot.id"
            class="dropdown-item"
            :class="{ 'is-active': plot.id === selectedPlotId }"
            type="button"
            @click="selectPlot(plot.id)"
          >
            <div class="dropdown-copy">
              <span class="dropdown-title">{{ plot.name?.trim() || '未命名地块' }}</span>
              <span class="dropdown-note">地块视图</span>
            </div>
            <span v-if="plot.id === selectedPlotId" class="dropdown-check">当前</span>
          </button>
        </div>
<!--        <div class="weather-wrap">-->
<!--          <CloudSun :size="16" class="icon-subtle" />-->
<!--          <span class="weather-text">{{ weatherText }}</span>-->
<!--        </div>-->
        <WeatherStatus :size="16" class="icon-mute" />
      </header>

      <PullToRefresh class="body-scroll home-body" :on-refresh="loadHomeData">
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
          <PlotsDash v-if="isGlobalView" />
          <PestTrendCard :data="pestData" :trend-value="pestTrendChange" v-if="!isGlobalView"/>
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

import { dashboardApi, plotsInfoApi, toApiError, type DashboardDeviceStatus, type DashboardSummary, type Plot } from '../api'
import BottomNav from '../components/BottomNav.vue'
import DeviceOnlineRateCard from '../components/DeviceOnlineRateCard.vue'
import LatestSuggestion from '../components/LatestSuggestion.vue'
import PestTrendCard from '../components/PestTrendCard.vue'
import PlotsDash from '../components/PlotsDash.vue'
import PullToRefresh from '../components/PullToRefresh.vue'
import '../styles/mobile-shell.css'
import WeatherStatus from "../components/weatherStatus.vue";
import {useDashBoard} from "../stores/DashBoardStore.ts";
import {storeToRefs} from "pinia";

type DeviceTone = 'dot-online' | 'dot-offline' | 'dot-maintenance'

type DeviceStatusCardItem = {
  label: string
  count: number
  tone: DeviceTone
}

const DashBoardStore = useDashBoard();

const summary = ref<DashboardSummary | null>(null)
const plots = ref<Plot[]>([])
const { selectedPlots: selectedPlotId } = storeToRefs(DashBoardStore)
const globalFieldName = ref('农场总览')
const isLoading = ref(false)
const errorMessage = ref('')
const plotsError = ref('')
const dropdownRef = ref<HTMLDivElement | null>(null)

const toneMap: Record<DashboardDeviceStatus['status'], DeviceTone> = {
  online: 'dot-online',
  offline: 'dot-offline',
  maintenance: 'dot-maintenance',
}

const isGlobalView = computed(() => selectedPlotId.value === null)
const selectedPlot = computed(() => {
  return plots.value.find((plot) => plot.id === selectedPlotId.value) ?? null
})
const fieldName = computed(() => {
  if (isGlobalView.value) {
    return globalFieldName.value || summary.value?.fieldName || '农场总览'
  }

  return selectedPlot.value?.name?.trim() || summary.value?.fieldName || '未命名地块'
})
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

const closeDropdown = () => {
  dropdownRef.value?.hidePopover()
}

const loadPlots = async () => {
  plotsError.value = ''

  try {
    plots.value = await plotsInfoApi.getPlotsInfo()
  } catch (error) {
    plots.value = []
    plotsError.value = '地块列表加载失败'
  }
}

const loadHomeData = async () => {
  isLoading.value = true
  errorMessage.value = ''
  summary.value = null

  try {
    const nextSummary = selectedPlotId.value
      ? await dashboardApi.getPlotSummary(selectedPlotId.value.toString())
      : await dashboardApi.getSummary()

    summary.value = nextSummary

    if (isGlobalView.value && nextSummary.fieldName.trim()) {
      globalFieldName.value = nextSummary.fieldName
    }
  } catch (error) {
    errorMessage.value = toApiError(error).message
  } finally {
    isLoading.value = false
  }
}

const selectGlobalView = async () => {
  if (selectedPlotId.value === null) {
    closeDropdown()
    return
  }

  DashBoardStore.setSelectedPlots(null)
  closeDropdown()
  await loadHomeData()
}

const selectPlot = async (plotId: string) => {
  if (selectedPlotId.value === plotId) {
    closeDropdown()
    return
  }

  DashBoardStore.setSelectedPlots(plotId)
  closeDropdown()
  await loadHomeData()
}

onMounted(() => {
  void Promise.allSettled([loadPlots(), loadHomeData()])
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
  color: inherit;
}

.field-text {
  color: var(--shell-text-strong);
  font-size: 13px;
  font-weight: 500;
}

.dropdown {
  width: min(240px, calc(100vw - 40px));
  margin: 10px 0 0;
  padding: 8px;
  border: 1px solid var(--shell-line);
  border-radius: 12px;
  background: color-mix(in oklab, var(--shell-bg) 92%, white);
  box-shadow: 0 16px 36px color-mix(in oklab, var(--color-base-content) 12%, transparent);
}

.dropdown::backdrop {
  background: transparent;
}

.dropdown-item {
  width: 100%;
  border: 0;
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: transparent;
  text-align: left;
}

.dropdown-item + .dropdown-item {
  margin-top: 4px;
}

.dropdown-item.is-active {
  background: color-mix(in oklab, var(--shell-primary-soft) 88%, white);
}

.dropdown-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dropdown-title {
  color: var(--shell-text-strong);
  font-size: 13px;
  font-weight: 600;
}

.dropdown-note {
  color: var(--shell-text-muted);
  font-size: 11px;
  font-weight: 500;
}

.dropdown-check {
  color: var(--shell-primary);
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
}

.dropdown-status {
  margin: 6px 4px 2px;
  color: var(--shell-warning);
  font-size: 11px;
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
