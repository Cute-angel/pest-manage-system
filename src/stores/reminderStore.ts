import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { RecommendationDetail } from '../api'
import type { ReportDetail } from '../api'
import { syncDailyReminderNotification } from '../services/reminderNotifications'

const TASKS_STORAGE_KEY = 'manage-system-planned-tasks'
const SETTINGS_STORAGE_KEY = 'manage-system-reminder-settings'

export type PlannedTaskSource = 'recommendation' | 'report'
export type PlannedTaskStatus = 'pending'

export interface PlannedTask {
  id: string
  sourceType: PlannedTaskSource
  sourceId: string
  categoryLabel: string
  title: string
  summary: string
  createdAt: string
  status: PlannedTaskStatus
}

export interface ReminderSettings {
  enabled: boolean
  dailyTime: string
}

type AddTaskResult = {
  added: boolean
  task: PlannedTask
}

const defaultSettings: ReminderSettings = {
  enabled: false,
  dailyTime: '09:00',
}

function readLocalStorage<T>(key: string, fallback: T) {
  try {
    const raw = localStorage.getItem(key)

    if (!raw) {
      return fallback
    }

    return JSON.parse(raw) as T
  } catch (error) {
    console.warn(`Failed to read persisted state for ${key}`, error)
    return fallback
  }
}

function writeLocalStorage(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

function createTaskId(sourceType: PlannedTaskSource, sourceId: string) {
  return `${sourceType}-${sourceId}`
}

export const useReminderStore = defineStore('reminder-store', () => {
  const tasks = ref<PlannedTask[]>(readLocalStorage<PlannedTask[]>(TASKS_STORAGE_KEY, []))
  const settings = ref<ReminderSettings>(readLocalStorage<ReminderSettings>(SETTINGS_STORAGE_KEY, defaultSettings))

  const pendingTasks = computed(() => tasks.value.filter((task) => task.status === 'pending'))
  const groupedPendingTasks = computed(() => {
    const recommendationTasks = pendingTasks.value.filter((task) => task.sourceType === 'recommendation')
    const reportTasks = pendingTasks.value.filter((task) => task.sourceType === 'report')

    return [
      { key: 'recommendation', label: '建议任务', items: recommendationTasks },
      { key: 'report', label: '巡检任务', items: reportTasks },
    ].filter((group) => group.items.length > 0)
  })

  function persistTasks() {
    writeLocalStorage(TASKS_STORAGE_KEY, tasks.value)
  }

  function persistSettings() {
    writeLocalStorage(SETTINGS_STORAGE_KEY, settings.value)
  }

  async function syncNotifications() {
    await syncDailyReminderNotification(settings.value, pendingTasks.value)
  }

  async function addRecommendationTask(recommendation: RecommendationDetail): Promise<AddTaskResult> {
    const existingTask = tasks.value.find(
      (task) => task.sourceType === 'recommendation' && task.sourceId === recommendation.id,
    )

    if (existingTask) {
      return { added: false, task: existingTask }
    }

    const nextTask: PlannedTask = {
      id: createTaskId('recommendation', recommendation.id),
      sourceType: 'recommendation',
      sourceId: recommendation.id,
      categoryLabel: '建议任务',
      title: recommendation.title,
      summary: recommendation.action || recommendation.summary,
      createdAt: new Date().toISOString(),
      status: 'pending',
    }

    tasks.value = [nextTask, ...tasks.value]
    persistTasks()
    await syncNotifications()

    return { added: true, task: nextTask }
  }

  async function addReportTask(report: ReportDetail): Promise<AddTaskResult> {
    const existingTask = tasks.value.find((task) => task.sourceType === 'report' && task.sourceId === report.id)

    if (existingTask) {
      return { added: false, task: existingTask }
    }

    const nextTask: PlannedTask = {
      id: createTaskId('report', report.id),
      sourceType: 'report',
      sourceId: report.id,
      categoryLabel: '巡检任务',
      title: report.title,
      summary: `${report.locationName} · ${report.summary}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
    }

    tasks.value = [nextTask, ...tasks.value]
    persistTasks()
    await syncNotifications()

    return { added: true, task: nextTask }
  }

  async function updateReminderSettings(nextSettings: ReminderSettings) {
    settings.value = {
      enabled: nextSettings.enabled,
      dailyTime: nextSettings.dailyTime || defaultSettings.dailyTime,
    }

    persistSettings()
    await syncNotifications()
  }

  async function syncReminderNotifications() {
    await syncNotifications()
  }

  return {
    tasks,
    settings,
    pendingTasks,
    groupedPendingTasks,
    addRecommendationTask,
    addReportTask,
    updateReminderSettings,
    syncReminderNotifications,
  }
})
