<template>
  <main class="app-page">
    <section class="phone-shell">
      <header class="top-bar detail-top">
        <button class="back-btn" type="button" @click="goBack">
          <ArrowLeft :size="16" />
        </button>
        <span class="top-title">虫害详情</span>
        <span class="top-spacer" />
      </header>

      <section v-if="isLoading" class="detail-empty">
        <h1 class="pest-name">正在加载</h1>
        <p class="empty-text">正在同步该条巡检记录，请稍候。</p>
      </section>

      <section v-else-if="errorMessage" class="detail-empty">
        <h1 class="pest-name">加载失败</h1>
        <p class="empty-text">{{ errorMessage }}</p>
        <RouterLink to="/timeline" class="empty-link btn-soft-primary">返回时间线</RouterLink>
      </section>

      <div v-else-if="report" class="body-scroll detail-body">
        <section class="title-wrap">
          <h1 class="pest-name">{{ report.title }}</h1>
          <span class="severity-badge" :class="severityBadgeClass">严重程度：{{ severityLabel }}</span>
        </section>
        <div class="images" v-viewer="{movable: false}">
          <img class="hero-image" :src="report.imageUrl" :alt="report.title" />
        </div>
        <article class="card meta-card">
          <div class="meta-row">
            <span class="meta-label">发现设备</span>
            <span class="meta-value">{{ report.deviceName }}</span>
          </div>
          <div class="divider" />
          <div class="meta-row">
            <span class="meta-label">发现地点</span>
            <span class="meta-value">{{ report.locationName }}</span>
          </div>
        </article>

        <section class="block">
          <h2 class="block-title">处置建议</h2>
          <article class="card info-card">
            <p class="body-text">{{ report.recommendationText }}</p>
            <div class="divider" />
            <p class="body-note">{{ report.recommendationNote }}</p>
            <div class="button-row">
              <button class="light-btn btn-soft-primary" type="button">确认执行</button>
              <button class="light-btn btn-soft" type="button">稍后处理</button>
            </div>
          </article>
        </section>
      </div>

      <section v-else class="detail-empty">
        <h1 class="pest-name">未找到虫害报告</h1>
        <p class="empty-text">当前记录不存在或已被移除，请返回时间线重新选择。</p>
        <RouterLink to="/timeline" class="empty-link btn-soft-primary">返回时间线</RouterLink>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import 'viewerjs/dist/viewer.css'

import { reportsApi, toApiError, type ReportDetail } from '../api'
import '../styles/mobile-shell.css'

const route = useRoute()
const router = useRouter()

const report = ref<ReportDetail | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')

const reportId = computed(() => {
  const rawId = route.params.id
  return Array.isArray(rawId) ? rawId[0] : rawId
})

const severityLabel = computed(() => {
  if (!report.value) {
    return ''
  }

  switch (report.value.severity) {
    case 'high':
      return '偏高'
    case 'medium':
      return '中等'
    default:
      return '轻度'
  }
})

const severityBadgeClass = computed(() => {
  return report.value?.severity === 'high' ? 'badge-warm' : 'badge-soft'
})

const loadReport = async (id?: string) => {
  if (!id) {
    report.value = null
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    report.value = await reportsApi.getById(id)
  } catch (error) {
    report.value = null
    errorMessage.value = toApiError(error).message
  } finally {
    isLoading.value = false
  }
}


watch(reportId, (id) => {
  void loadReport(id)
}, { immediate: true })

function goBack() {
  router.push('/timeline')
}
</script>

<style scoped>
.detail-top {
  height: 64px;
  padding: 12px 20px;
}

.back-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--shell-line);
  border-radius: 10px;
  background: color-mix(in oklab, var(--shell-bg) 82%, white);
  color: var(--shell-text-strong);
  display: grid;
  place-items: center;
}

.top-title {
  color: var(--shell-text-strong);
  font-size: 15px;
  font-weight: 600;
}

.top-spacer {
  width: 36px;
  height: 36px;
}

.detail-body {
  padding: 20px 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid var(--shell-line);
}

.title-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pest-name {
  margin: 0;
  color: var(--shell-text-strong);
  font-size: 24px;
  font-weight: 600;
}

.severity-badge {
  width: max-content;
}

.block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.block-title {
  margin: 0;
  color: var(--shell-text-strong);
  font-size: 15px;
  font-weight: 600;
}

.meta-card {
  padding: 14px;
  gap: 12px;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.meta-label {
  color: var(--shell-text-muted);
  font-size: 12px;
  font-weight: 500;
}

.meta-value {
  color: var(--shell-text-strong);
  font-size: 13px;
  font-weight: 600;
  text-align: right;
}

.info-card {
  padding: 14px;
  gap: 12px;
}

.body-text {
  margin: 0;
  color: var(--shell-text-body);
  font-size: 13px;
  line-height: 1.45;
}

.body-note {
  margin: 0;
  color: var(--shell-text-muted);
  font-size: 12px;
  line-height: 1.45;
}

.button-row {
  display: flex;
  gap: 8px;
}

.light-btn {
  flex: 1;
  padding: 8px 0;
  font-size: 12px;
}

.detail-empty {
  flex: 1;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

.empty-text {
  margin: 0;
  color: var(--shell-text-muted);
  font-size: 13px;
  line-height: 1.5;
}

.empty-link {
  width: 100%;
  height: 44px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  text-decoration: none;
}
</style>
