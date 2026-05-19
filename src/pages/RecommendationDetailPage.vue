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
        <VueShowdown
          class="sub markdown-body"
          :markdown="normalizeMarkdown(recommendation.summary)"
          :options="markdownOptions"
        />
        <div class="divider" />

        <section class="section">
          <h2>情况概览</h2>
          <VueShowdown
            class="section-content markdown-body"
            :markdown="normalizeMarkdown(recommendation.situation)"
            :options="markdownOptions"
          />
        </section>
        <div class="divider " />

        <section class="section">
          <h2>数据</h2>
          <VueShowdown
            class="section-content markdown-body"
            :markdown="normalizeMarkdown(recommendation.evidence)"
            :options="markdownOptions"
          />
        </section>
        <div class="divider" />

        <section class="section">
          <h2>建议方案</h2>
          <VueShowdown
            class="section-content markdown-body"
            :markdown="normalizeMarkdown(recommendation.action)"
            :options="markdownOptions"
          />
        </section>
        <div class="divider" />

        <section class="section">
          <h2>建议时机</h2>
          <VueShowdown
            class="section-content markdown-body"
            :markdown="normalizeMarkdown(recommendation.timeline)"
            :options="markdownOptions"
          />
        </section>
        <p v-if="actionFeedback" class="action-feedback">{{ actionFeedback }}</p>
      </template>

      <template v-else>
        <h1 class="header">暂无建议详情</h1>
        <p class="sub">后端尚未返回可展示的建议内容。</p>
      </template>

      <div class="spacer" />
      <button
        class="confirm-btn"
        :class="isTaskAdded ? 'btn-disabled' : 'btn-soft-primary'"
        type="button"
        :disabled="isScheduling || isTaskAdded || !recommendation"
        @click="handleConfirmSchedule"
      >
        {{ confirmButtonText }}
      </button>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { VueShowdown } from 'vue-showdown'
import { ArrowLeft } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'

import { recommendationsApi, toApiError, type RecommendationDetail } from '../api'
import { useReminderStore } from '../stores/reminderStore'
import '../styles/mobile-shell.css'

const route = useRoute()
const router = useRouter()
const reminderStore = useReminderStore()

const recommendation = ref<RecommendationDetail | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')
const isScheduling = ref(false)
const actionFeedback = ref('')
const markdownOptions = {
  simpleLineBreaks: true,
}

function normalizeMarkdown(text: string): string {
  return text.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n')
}

const recommendationId = computed(() => {
  const rawId = route.query.id
  return Array.isArray(rawId) ? rawId[0] : rawId
})

const isTaskAdded = computed(() => {
  if (!recommendation.value) {
    return false
  }

  return reminderStore.tasks.some(
    (task) => task.sourceType === 'recommendation' && task.sourceId === recommendation.value?.id,
  )
})

const confirmButtonText = computed(() => {
  if (isScheduling.value) {
    return '加入中...'
  }

  if (isTaskAdded.value) {
    return '已添加'
  }

  return '确认 / 安排执行'
})

const loadRecommendation = async (id?: string) => {
  isLoading.value = true
  errorMessage.value = ''
  actionFeedback.value = ''

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
  recommendationId,
  (id) => {
    void loadRecommendation(id ?? undefined)
  },
  { immediate: true },
)

async function handleConfirmSchedule() {
  if (!recommendation.value || isScheduling.value || isTaskAdded.value) {
    return
  }

  isScheduling.value = true
  actionFeedback.value = ''

  try {
    const result = await reminderStore.addRecommendationTask(recommendation.value)
    actionFeedback.value = result.added ? '已加入每日计划，后续会按提醒时间通知。' : '该建议已加入每日计划。'
  } finally {
    isScheduling.value = false
  }
}

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

.section-content {
  margin: 0;
  color: var(--shell-text-body);
  font-size: 12px;
  line-height: 1.45;
}

.markdown-body :deep(p),
.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 0;
}

.markdown-body :deep(p + p),
.markdown-body :deep(p + ul),
.markdown-body :deep(p + ol),
.markdown-body :deep(ul + p),
.markdown-body :deep(ol + p) {
  margin-top: 8px;
}

.action-feedback {
  margin: 8px 0 0;
  color: var(--shell-primary);
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

.btn-disabled {
  background: var(--shell-bg-muted);
  color: var(--shell-text-subtle);
  border: 1px solid var(--shell-line);
  cursor: not-allowed;
}
</style>
