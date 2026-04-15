<template>
  <main class="app-page">
    <section class="phone-shell notification-settings-shell">
      <header class="top-bar settings-top">
        <button class="back-btn" type="button" @click="goBack">
          <ArrowLeft :size="16" />
        </button>
        <div class="title-wrap">
          <h1 class="page-title">消息提醒</h1>
          <p class="page-subtitle">设置每日固定时间的系统级待办提醒。</p>
        </div>
      </header>

      <section class="card settings-card">
        <div class="row-head">
          <div>
            <p class="row-title">开启每日提醒</p>
            <p class="row-meta">每天固定时间提醒你查看待办计划。</p>
          </div>
          <input v-model="enabled" class="toggle toggle-success" type="checkbox" />
        </div>

        <div class="divider" />

        <label class="time-field" :class="{ disabled: !enabled }">
          <span class="row-title">提醒时间</span>
          <input v-model="dailyTime" class="time-input" type="time" :disabled="!enabled" />
        </label>

        <div class="divider" />

        <div class="summary-row">
          <div>
            <p class="row-title">当前待办</p>
            <p class="row-meta">建议任务 {{ recommendationCount }} 条，巡检任务 {{ reportCount }} 条</p>
          </div>
          <span class="count-badge">{{ reminderStore.pendingTasks.length }}</span>
        </div>
      </section>

      <p class="helper-text">
        仅当你已添加待办任务时，系统才会按设定时间发送提醒。
      </p>

      <div class="spacer" />

      <p v-if="feedbackMessage" class="feedback-text">{{ feedbackMessage }}</p>
      <button class="save-btn btn-soft-primary" type="button" :disabled="isSaving" @click="saveSettings">
        {{ isSaving ? '保存中...' : '保存提醒设置' }}
      </button>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useReminderStore } from '../stores/reminderStore'
import '../styles/mobile-shell.css'

const router = useRouter()
const reminderStore = useReminderStore()
const { settings, groupedPendingTasks } = storeToRefs(reminderStore)

const enabled = ref(settings.value.enabled)
const dailyTime = ref(settings.value.dailyTime)
const isSaving = ref(false)
const feedbackMessage = ref('')

const recommendationCount = computed(
  () => groupedPendingTasks.value.find((group) => group.key === 'recommendation')?.items.length ?? 0,
)
const reportCount = computed(
  () => groupedPendingTasks.value.find((group) => group.key === 'report')?.items.length ?? 0,
)

async function saveSettings() {
  isSaving.value = true
  feedbackMessage.value = ''

  try {
    await reminderStore.updateReminderSettings({
      enabled: enabled.value,
      dailyTime: dailyTime.value,
    })
    feedbackMessage.value = '提醒设置已保存。'
  } finally {
    isSaving.value = false
  }
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  void router.push('/me')
}
</script>

<style scoped>
.notification-settings-shell {
  padding: 20px;
  gap: 14px;
}

.settings-top {
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

.settings-card {
  padding: 16px;
  gap: 14px;
}

.row-head,
.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.row-title {
  margin: 0;
  color: var(--shell-text-strong);
  font-size: 14px;
  font-weight: 600;
}

.row-meta {
  margin: 4px 0 0;
  color: var(--shell-text-muted);
  font-size: 12px;
  line-height: 1.4;
}

.time-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.time-field.disabled {
  opacity: 0.56;
}

.time-input {
  min-width: 124px;
  border: 1px solid var(--shell-line);
  border-radius: 10px;
  background: color-mix(in oklab, var(--shell-bg) 88%, white);
  color: var(--shell-text-strong);
  padding: 10px 12px;
  font-size: 13px;
}

.count-badge {
  min-width: 34px;
  height: 34px;
  border-radius: 999px;
  background: var(--shell-primary-soft);
  color: var(--shell-primary);
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 700;
}

.helper-text,
.feedback-text {
  margin: 0;
  color: var(--shell-text-muted);
  font-size: 12px;
  line-height: 1.45;
}

.feedback-text {
  color: var(--shell-primary);
}

.spacer {
  flex: 1;
}

.save-btn {
  width: 100%;
  height: 46px;
  font-size: 13px;
  font-weight: 600;
}
</style>
