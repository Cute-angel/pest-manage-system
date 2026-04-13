<template>
  <div
    ref="containerRef"
    class="pull-refresh"
    :data-debug-saved-scroll-top="debugSavedScrollTop"
    :data-debug-live-scroll-top="debugLiveScrollTop"
    :data-debug-scroll-height="debugScrollHeight"
    :data-debug-client-height="debugClientHeight"
    v-bind="$attrs"
    @scroll.passive="syncDebugMetricsFromScroll"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchCancel"
  >
    <div class="pull-refresh-indicator" :style="indicatorStyle">
      <RefreshCw
        class="pull-refresh-spinner"
        :class="{ 'is-refreshing': isRefreshing }"
        :style="spinnerStyle"
        :size="18"
      />
      <span class="pull-refresh-text">{{ indicatorText }}</span>
    </div>
    <div class="pull-refresh-content" :style="contentStyle">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onActivated, onMounted, ref } from 'vue'
import { RefreshCw } from 'lucide-vue-next'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  onRefresh: () => Promise<void> | void
  threshold?: number
  maxPull?: number
  disabled?: boolean
  pullingText?: string
  releaseText?: string
  loadingText?: string
}>(), {
  threshold: 20,
  maxPull: 48,
  disabled: false,
  pullingText: '下拉刷新',
  releaseText: '松开刷新',
  loadingText: '正在刷新...',
})

const containerRef = ref<HTMLElement | null>(null)
const pullDistance = ref(0)
const isPulling = ref(false)
const isRefreshing = ref(false)
const debugSavedScrollTop = ref(0)
const debugLiveScrollTop = ref(0)
const debugScrollHeight = ref(0)
const debugClientHeight = ref(0)

let startY = 0

const contentOffset = computed(() => {
  if (isRefreshing.value) {
    return props.threshold
  }

  return pullDistance.value
})

const indicatorStyle = computed(() => ({
  height: `${contentOffset.value}px`,
  opacity: contentOffset.value > 0 ? '1' : '0',
}))

const contentStyle = computed(() => ({
  transform: `translateY(${contentOffset.value}px)`,
}))

const indicatorText = computed(() => {
  if (isRefreshing.value) {
    return props.loadingText
  }

  if (pullDistance.value >= props.threshold) {
    return props.releaseText
  }

  return props.pullingText
})

const spinnerStyle = computed(() => {
  if (isRefreshing.value) {
    return undefined
  }

  const progress = Math.min(pullDistance.value / props.threshold, 1)
  const rotate = progress * 180
  const opacity = Math.max(progress, 0.2)

  return {
    transform: `rotate(${rotate}deg)`,
    opacity: String(opacity),
  }
})

defineExpose({
  containerRef,
})

onMounted(() => {
  syncDebugMetrics()
})

onActivated(() => {
  syncDebugMetrics()
  requestAnimationFrame(() => {
    // Keep-alive restores component state before the inner scroller fully settles.
    restoreSavedScrollPosition()
    syncDebugMetrics()
    requestAnimationFrame(() => {
      syncDebugMetrics()
    })
  })
})

function handleTouchStart(event: TouchEvent) {
  if (props.disabled || isRefreshing.value) {
    return
  }

  const container = containerRef.value

  if (!container || container.scrollTop > 0) {
    isPulling.value = false
    return
  }

  startY = event.touches[0]?.clientY ?? 0
  isPulling.value = true
}

function handleTouchMove(event: TouchEvent) {
  if (!isPulling.value || props.disabled || isRefreshing.value) {
    return
  }

  const currentY = event.touches[0]?.clientY ?? 0
  const delta = currentY - startY

  if (delta <= 0) {
    pullDistance.value = 0
    return
  }

  const dampedDistance = Math.min(delta * 0.45, props.maxPull)
  pullDistance.value = dampedDistance

  if (dampedDistance > 0) {
    event.preventDefault()
  }
}

async function handleTouchEnd() {
  if (!isPulling.value) {
    return
  }

  isPulling.value = false

  if (pullDistance.value >= props.threshold && !isRefreshing.value) {
    isRefreshing.value = true

    try {
      await props.onRefresh()
    } finally {
      isRefreshing.value = false
    }
  }

  pullDistance.value = 0
}

function handleTouchCancel() {
  isPulling.value = false
  pullDistance.value = 0
}

function syncDebugMetricsFromScroll(event: Event) {
  const target = event.target as HTMLElement | null

  if (!target) {
    return
  }

  debugSavedScrollTop.value = Math.round(target.scrollTop)
  syncDebugMetrics(target)
}

function syncDebugMetrics(target = containerRef.value) {
  if (!target) {
    return
  }

  debugLiveScrollTop.value = Math.round(target.scrollTop)
  debugScrollHeight.value = Math.round(target.scrollHeight)
  debugClientHeight.value = Math.round(target.clientHeight)
}

function restoreSavedScrollPosition() {
  const target = containerRef.value

  if (!target || debugSavedScrollTop.value <= 0) {
    return
  }

  // Apply the last observed scroll position back to the live scroller.
  target.scrollTop = debugSavedScrollTop.value
  debugLiveScrollTop.value = Math.round(target.scrollTop)
}
</script>

<style scoped>
.pull-refresh {
  position: relative;
  overflow: auto;
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
}

.pull-refresh-indicator {
  position: absolute;
  top: 8px;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  pointer-events: none;
  transition: height 180ms ease, opacity 180ms ease;
}

.pull-refresh-spinner {
  margin-bottom: 8px;
  color: var(--shell-primary);
  transform-origin: center;
  transition: transform 180ms ease, opacity 180ms ease;
  filter: drop-shadow(0 3px 10px color-mix(in oklab, var(--shell-primary) 14%, transparent));
}

.pull-refresh-spinner.is-refreshing {
  opacity: 1;
  animation: pull-refresh-spin 720ms linear infinite;
}

.pull-refresh-text {
  margin-bottom: 8px;
  padding: 6px 12px;
  border: 1px solid color-mix(in oklab, var(--shell-line) 78%, white);
  border-radius: 999px;
  background: color-mix(in oklab, var(--shell-bg) 82%, white);
  color: var(--shell-text-muted);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  backdrop-filter: blur(8px);
}

.pull-refresh-content {
  position: relative;
  z-index: 0;
  min-height: 100%;
  transition: transform 180ms ease;
}

@keyframes pull-refresh-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
