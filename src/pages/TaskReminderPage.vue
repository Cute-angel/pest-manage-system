<template>
  <main class="app-page">
    <section class="phone-shell reminder-shell">
      <header class="top-bar reminder-top">
        <button class="back-btn" type="button" @click="goBack">
          <ArrowLeft :size="16" />
        </button>
        <div class="title-wrap">
          <h1 class="page-title">待办任务提醒</h1>
          <p class="page-subtitle">按来源查看你加入每日计划的待处理任务。</p>
        </div>
      </header>

      <div v-if="groupedPendingTasks.length === 0" class="empty-state">
        <h2>暂无待办任务</h2>
        <p>从建议详情确认执行，或在巡检详情里选择稍后处理后，这里会显示对应的每日计划。</p>
      </div>

      <div v-else class="task-list">
        <section v-for="group in groupedPendingTasks" :key="group.key" class="group-section">
          <div class="group-head">
            <h2>{{ group.label }}</h2>
            <span class="group-count">{{ group.items.length }}</span>
          </div>

          <RouterLink
            v-for="task in group.items"
            :key="task.id"
            class="card task-card"
            :to="taskLink(task)"
          >
            <div class="card-top">
              <span class="task-tag">{{ task.categoryLabel }}</span>
              <span class="task-time">{{ formatDate(task.createdAt) }}</span>
            </div>
            <h3>{{ task.title }}</h3>
            <p>{{ task.summary }}</p>
          </RouterLink>
        </section>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { RouterLink, useRouter } from 'vue-router'

import type { PlannedTask } from '../stores/reminderStore'
import { useReminderStore } from '../stores/reminderStore'
import '../styles/mobile-shell.css'

const router = useRouter()
const reminderStore = useReminderStore()
const { groupedPendingTasks } = storeToRefs(reminderStore)

function taskLink(task: PlannedTask) {
  if (task.sourceType === 'recommendation') {
    return {
      path: '/recommendation-detail',
      query: { id: task.sourceId },
    }
  }

  return `/timeline/${task.sourceId}`
}

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '刚刚加入'
  }

  return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  void router.push('/home')
}
</script>

<style scoped>
.reminder-shell {
  padding: 20px;
  gap: 14px;
}

.reminder-top {
  min-height: 68px;
  padding: 0;
  align-items: flex-start;
  gap: 12px;
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

.title-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  margin: 0;
  color: var(--shell-text-strong);
  font-size: 21px;
  font-weight: 600;
}

.page-subtitle {
  margin: 0;
  color: var(--shell-text-muted);
  font-size: 12px;
  line-height: 1.45;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}

.empty-state h2,
.group-head h2,
.task-card h3 {
  margin: 0;
  color: var(--shell-text-strong);
}

.empty-state p,
.task-card p {
  margin: 0;
  color: var(--shell-text-muted);
  font-size: 12px;
  line-height: 1.5;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.group-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.group-count {
  min-width: 28px;
  height: 28px;
  border-radius: 999px;
  background: var(--shell-bg-muted);
  color: var(--shell-text-subtle);
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 600;
}

.task-card {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-decoration: none;
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.task-tag {
  width: max-content;
  border-radius: 999px;
  background: var(--shell-primary-soft);
  color: var(--shell-primary);
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 600;
}

.task-time {
  color: var(--shell-text-subtle);
  font-size: 11px;
}
</style>
