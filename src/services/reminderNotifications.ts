import type { Router } from 'vue-router'
import type { ReminderSettings, PlannedTask } from '../stores/reminderStore'

const DAILY_REMINDER_NOTIFICATION_ID = 201001
const TASK_REMINDER_ROUTE = '/task-reminders'
const DEFAULT_REMINDER_TIME = '09:00'

type NotificationPlugin = typeof import('@tauri-apps/plugin-notification')

let notificationActionListenerRegistered = false

function isTauriRuntime() {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

async function loadNotificationPlugin(): Promise<NotificationPlugin | null> {
  if (!isTauriRuntime()) {
    return null
  }

  return import('@tauri-apps/plugin-notification')
}

function parseReminderTime(time: string) {
  const [hourPart, minutePart] = (time || DEFAULT_REMINDER_TIME).split(':')
  const hour = Number(hourPart)
  const minute = Number(minutePart)

  return {
    hour: Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : 9,
    minute: Number.isInteger(minute) && minute >= 0 && minute <= 59 ? minute : 0,
  }
}

function buildNotificationBody(tasks: PlannedTask[]) {
  const recommendationCount = tasks.filter((task) => task.sourceType === 'recommendation').length
  const reportCount = tasks.filter((task) => task.sourceType === 'report').length

  if (recommendationCount > 0 && reportCount > 0) {
    return `建议任务 ${recommendationCount} 条，巡检任务 ${reportCount} 条，点击查看详情。`
  }

  if (recommendationCount > 0) {
    return `当前有 ${recommendationCount} 条建议任务待处理，点击查看详情。`
  }

  if (reportCount > 0) {
    return `当前有 ${reportCount} 条巡检任务待处理，点击查看详情。`
  }

  return '你有待处理的每日计划，点击查看详情。'
}

async function ensurePermission(plugin: NotificationPlugin) {
  let permissionGranted = await plugin.isPermissionGranted()

  if (!permissionGranted) {
    const permission = await plugin.requestPermission()
    permissionGranted = permission === 'granted'
  }

  return permissionGranted
}

export async function syncDailyReminderNotification(settings: ReminderSettings, tasks: PlannedTask[]) {
  const plugin = await loadNotificationPlugin()

  if (!plugin) {
    return
  }

  try {
    await plugin.cancel([DAILY_REMINDER_NOTIFICATION_ID])
  } catch (error) {
    console.warn('Failed to cancel previous reminder notification', error)
  }

  if (!settings.enabled || tasks.length === 0) {
    return
  }

  const permissionGranted = await ensurePermission(plugin)

  if (!permissionGranted) {
    return
  }

  const { hour, minute } = parseReminderTime(settings.dailyTime)

  plugin.sendNotification({
    id: DAILY_REMINDER_NOTIFICATION_ID,
    title: '今日待办提醒',
    body: buildNotificationBody(tasks),
    schedule: plugin.Schedule.interval({ hour, minute, second: 0 }, true),
    autoCancel: true,
    extra: {
      route: TASK_REMINDER_ROUTE,
      notificationType: 'daily-task-reminder',
    },
  })
}

export async function initializeReminderNotifications(router: Router) {
  if (notificationActionListenerRegistered) {
    return
  }

  const plugin = await loadNotificationPlugin()

  if (!plugin) {
    return
  }

  notificationActionListenerRegistered = true

  try {
    await plugin.onAction((notification) => {
      const route = typeof notification.extra?.route === 'string' ? notification.extra.route : undefined

      if (notification.id !== DAILY_REMINDER_NOTIFICATION_ID && route !== TASK_REMINDER_ROUTE) {
        return
      }

      void router.push(TASK_REMINDER_ROUTE)
    })
  } catch (error) {
    console.warn('Failed to register notification action listener', error)
  }
}
