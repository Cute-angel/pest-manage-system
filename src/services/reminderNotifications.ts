import type { Router } from 'vue-router'
import type { ReminderSettings, PlannedTask } from '../stores/reminderStore'

const DAILY_REMINDER_NOTIFICATION_ID = 201001
const TASK_REMINDER_ROUTE = '/task-reminders'
const DEFAULT_REMINDER_TIME = '09:00'
const PENDING_NOTIFICATION_ROUTE_STORAGE_KEY = 'manage-system-pending-notification-route'
const ANDROID_NOTIFICATION_ACTION_EVENT = 'manage-system-notification-action'

type NotificationPlugin = typeof import('@tauri-apps/plugin-notification')
type NotificationRouteTarget = {
  id?: number
  extra?: Record<string, unknown>
}
type NotificationActionPayload = {
  actionId?: string
  inputValue?: string | null
  notification?: NotificationRouteTarget
}

declare global {
  interface Window {
    ManageSystemNotifications?: {
      consumePendingNotificationAction: () => string | null
    }
  }
}

let notificationActionListenerRegistered = false
let androidNotificationActionListenerRegistered = false

function isTauriRuntime() {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

async function loadNotificationPlugin(): Promise<NotificationPlugin | null> {
  if (!isTauriRuntime()) {
    return null
  }

  return import('@tauri-apps/plugin-notification')
}

function readPendingNotificationRoute() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(PENDING_NOTIFICATION_ROUTE_STORAGE_KEY)
}

function writePendingNotificationRoute(route: string) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(PENDING_NOTIFICATION_ROUTE_STORAGE_KEY, route)
}

function clearPendingNotificationRoute() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(PENDING_NOTIFICATION_ROUTE_STORAGE_KEY)
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

function resolveNotificationRoute(notification: NotificationRouteTarget) {
  const route = typeof notification.extra?.route === 'string' ? notification.extra.route : undefined

  if (notification.id === DAILY_REMINDER_NOTIFICATION_ID) {
    return route ?? TASK_REMINDER_ROUTE
  }

  if (route === TASK_REMINDER_ROUTE) {
    return route
  }

  return null
}

function parseNotificationActionPayload(value: unknown): NotificationActionPayload | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const payload = value as NotificationActionPayload

  if (!payload.notification || typeof payload.notification !== 'object') {
    return null
  }

  return payload
}

function resolveRouteFromActionPayload(payload: NotificationActionPayload | NotificationRouteTarget) {
  const notification: NotificationRouteTarget | undefined =
    typeof (payload as NotificationActionPayload).notification !== 'undefined'
      ? (payload as NotificationActionPayload).notification
      : (payload as NotificationRouteTarget)

  if (notification) {
    const resolvedRoute = resolveNotificationRoute(notification)

    if (resolvedRoute) {
      return resolvedRoute
    }
  }

  const actionId = (payload as NotificationActionPayload).actionId

  if (actionId === 'tap' || actionId === 'dev-notification-test' || actionId === 'daily-task-reminder') {
    return TASK_REMINDER_ROUTE
  }

  return TASK_REMINDER_ROUTE
}

function consumeAndroidPendingNotificationAction() {
  if (typeof window === 'undefined') {
    return null
  }

  const bridge = window.ManageSystemNotifications

  if (!bridge || typeof bridge.consumePendingNotificationAction !== 'function') {
    return null
  }

  const raw = bridge.consumePendingNotificationAction()

  if (!raw) {
    return null
  }

  try {
    return parseNotificationActionPayload(JSON.parse(raw))
  } catch (error) {
    console.warn('Failed to parse pending Android notification action', error)
    return null
  }
}

function matchesHandledNotificationRoute(router: Router, route: string) {
  const currentRoute = router.currentRoute.value
  const redirect =
    typeof currentRoute.query.redirect === 'string' ? currentRoute.query.redirect : undefined

  return currentRoute.path === route || (currentRoute.path === '/login' && redirect === route)
}

async function navigateFromNotification(router: Router, route: string) {
  writePendingNotificationRoute(route)

  try {
    await router.push(route)
  } catch (error) {
    console.warn('Failed to navigate after notification click', error)
    return
  }

  if (matchesHandledNotificationRoute(router, route)) {
    clearPendingNotificationRoute()
  }

  if (typeof window !== 'undefined') {
    window.focus()
  }
}

async function ensurePermission(plugin: NotificationPlugin) {
  let permissionGranted = await plugin.isPermissionGranted()

  if (!permissionGranted) {
    const permission = await plugin.requestPermission()
    permissionGranted = permission === 'granted'
  }

  return permissionGranted
}

async function handleNotificationAction(
  router: Router,
  payload: NotificationActionPayload | NotificationRouteTarget,
) {
  const route = resolveRouteFromActionPayload(payload)

  console.info('Handle notification action', payload, route)

  if (!route) {
    return
  }

  await navigateFromNotification(router, route)
}

function registerAndroidNotificationActionListener(router: Router) {
  if (androidNotificationActionListenerRegistered || typeof window === 'undefined') {
    return
  }

  androidNotificationActionListenerRegistered = true

  window.addEventListener(ANDROID_NOTIFICATION_ACTION_EVENT, (event) => {
    const raw =
      event instanceof CustomEvent && typeof event.detail === 'string'
        ? event.detail
        : undefined

    if (!raw) {
      return
    }

    try {
      const payload = parseNotificationActionPayload(JSON.parse(raw))

      if (!payload) {
        console.warn('Android notification action payload is invalid', raw)
        return
      }

      void consumeAndroidPendingNotificationAction()
      void handleNotificationAction(router, payload)
    } catch (error) {
      console.warn('Failed to parse Android notification action event', error)
    }
  })
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
  registerAndroidNotificationActionListener(router)

  if (!notificationActionListenerRegistered) {
    const plugin = await loadNotificationPlugin()

    if (plugin) {
      notificationActionListenerRegistered = true

      try {
        await plugin.onAction((payload) => {
          console.info('plugin.onAction payload', payload)
          const actionPayload = parseNotificationActionPayload(payload)

          if (actionPayload) {
            void handleNotificationAction(router, actionPayload)
            return
          }

          void handleNotificationAction(router, payload as NotificationRouteTarget)
        })
      } catch (error) {
        notificationActionListenerRegistered = false
        console.warn('Failed to register notification action listener', error)
      }
    }
  }

  const pendingAndroidAction = consumeAndroidPendingNotificationAction()

  if (pendingAndroidAction) {
    await handleNotificationAction(router, pendingAndroidAction)
  }

  await consumePendingNotificationNavigation(router)
}

export async function consumePendingNotificationNavigation(router: Router) {
  const route = readPendingNotificationRoute()

  if (!route) {
    return
  }

  await navigateFromNotification(router, route)
}
