<template>
  <main class="app-page">
    <section class="phone-shell recommendation-shell">
      <button class="back-btn" type="button" @click="goBack">
        <ArrowLeft :size="16" />
      </button>

      <template v-if="isLoading">
        <h1 class="header">正在加载建议</h1>
        <p class="sub">正在同步最新监测建议，请稍候。</p>
      </template>

      <template v-else-if="errorMessage">
        <h1 class="header">建议加载失败</h1>
        <p class="sub">{{ errorMessage }}</p>
      </template>

      <template v-else-if="recommendation">
        <h1 class="header">{{ recommendation.title }}</h1>
        <p class="sub">{{ recommendation.summary }}</p>
        <div class="divider" />

        <section class="section">
          <h2>Situation Overview</h2>
          <p>{{ recommendation.situation }}</p>
        </section>
        <div class="divider " />

        <section class="section">
          <h2>Data Evidence</h2>
          <p>{{ recommendation.evidence }}</p>
        </section>
        <div class="divider" />

        <section class="section">
          <h2>Recommended Action</h2>
          <p>{{ recommendation.action }}</p>
        </section>
        <div class="divider" />

        <section class="section">
          <h2>Suggested Timeline</h2>
          <p>{{ recommendation.timeline }}</p>
        </section>
      </template>

      <template v-else>
        <h1 class="header">暂无建议详情</h1>
        <p class="sub">后端尚未返回可展示的建议内容。</p>
      </template>

      <div class="spacer" />
      <button class="confirm-btn btn-soft-primary" type="button">Confirm / Schedule Action</button>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'

import { recommendationsApi, toApiError, type RecommendationDetail } from '../api'
import '../styles/mobile-shell.css'

const route = useRoute()
const router = useRouter()

const recommendation = ref<RecommendationDetail | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')

const loadRecommendation = async (id?: string) => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    recommendation.value = id
      ? await recommendationsApi.getById(id)
      : await recommendationsApi.getLatest()
  } catch (error) {
    recommendation.value = null
    errorMessage.value = toApiError(error).message
  } finally {
    isLoading.value = false
  }
}

watch(
  () => {
    const rawId = route.query.id
    return Array.isArray(rawId) ? rawId[0] : rawId
  },
  (id) => {
    void loadRecommendation(id ?? undefined)
  },
  { immediate: true },
)

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/home')
}
</script>

<style scoped>
.recommendation-shell {
  padding: 20px 22px;
  gap: 8px;
}

.back-btn {
  width: max-content;
  border: 1px solid var(--shell-line);
  border-radius: 10px;
  background: color-mix(in oklab, var(--shell-bg) 82%, white);
  color: var(--shell-text-strong);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
}

.header {
  margin: 0;
  color: var(--shell-text-strong);
  font-size: 22px;
  font-weight: 600;
}

.sub {
  margin: 0;
  color: var(--shell-text-muted);
  font-size: 12px;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section h2 {
  margin: 0;
  color: var(--shell-text-strong);
  font-size: 14px;
  font-weight: 600;
}

.section p {
  margin: 0;
  color: var(--shell-text-body);
  font-size: 12px;
  line-height: 1.45;
}

.spacer {
  flex: 1;
}

.confirm-btn {
  width: 100%;
  height: 46px;
  font-size: 13px;
  font-weight: 600;
}
</style>
