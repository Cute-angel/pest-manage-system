<template>
  <section class="stack-10">
    <h2 class="section-title">Today’s Recommendation</h2>
    <article class="card card-14">
      <div class="row-between">
        <p class="card-heading">{{ headingText }}</p>
        <ArrowRight :size="14" class="icon-muted" />
      </div>
      <p class="card-text">{{ bodyText }}</p>
      <p class="card-note">{{ noteText }}</p>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight } from 'lucide-vue-next'

import type { DashboardRecommendationPreview } from '../api'

const props = withDefaults(
  defineProps<{
    data?: DashboardRecommendationPreview | null
    loading?: boolean
    error?: string
  }>(),
  {
    data: null,
    loading: false,
    error: '',
  },
)

const headingText = computed(() => {
  if (props.loading) {
    return '正在获取最新建议'
  }

  if (props.data?.title) {
    return props.data.title
  }

  if (props.error) {
    return '建议加载失败'
  }

  return '暂无建议'
})

const bodyText = computed(() => {
  if (props.loading) {
    return '正在同步监测数据与处置建议，请稍候。'
  }

  if (props.data?.description) {
    return props.data.description
  }

  if (props.error) {
    return props.error
  }

  return '当前没有可展示的处置建议。'
})

const noteText = computed(() => {
  if (props.data?.evidence) {
    return `数据依据：${props.data.evidence}`
  }

  return '数据依据将在后端返回后展示。'
})
</script>

<style scoped>
.card-14 {
  padding: 14px;
  gap: 8px;
}

.stack-10 {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-heading {
  margin: 0;
  color: var(--shell-text-strong);
  font-size: 14px;
  font-weight: 500;
}

.card-text {
  margin: 0;
  color: var(--shell-text-body);
  font-size: 13px;
}

.card-note {
  margin: 0;
  color: var(--shell-text-muted);
  font-size: 11px;
}

.row-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
