<template>
  <main class="app-page">
    <section class="phone-shell">
      <header class="top-bar me-top">
        <h1 class="me-title">我的</h1>
        <Bell :size="18" class="icon-top" />
      </header>

      <PullToRefresh class="body-scroll" :on-refresh="loadPageData">
        <div class="me-body">
          <button class="card profile-card interactive-card" type="button" @click="isAccountSettingsOpen = true">
            <div class="avatar">
              <User :size="18" />
            </div>
            <div class="profile-text">
              <p class="name">{{ displayName }}</p>
              <p class="meta">{{ displayMeta }}</p>
            </div>
            <ChevronRight :size="14" class="arrow" />
          </button>

          <p v-if="errorMessage" class="page-error">{{ errorMessage }}</p>
          <!--        //-->
          <!--        <section class="stat-row">-->
          <!--          <article class="card stat-card">-->
          <!--            <p class="value">{{ monthlyInspections }}</p>-->
          <!--            <p class="label">本月巡检</p>-->
          <!--          </article>-->
          <!--          <article class="card stat-card">-->
          <!--            <p class="value green">{{ completionRate }}%</p>-->
          <!--            <p class="label">任务完成率</p>-->
          <!--          </article>-->
          <!--        </section>-->

          <section class="menu-section">
            <h2>偏好设置</h2>
            <article class="card menu-card">
              <button class="menu-row" type="button" @click="goToNotificationSettings"><span>消息提醒</span>
                <ChevronRight :size="14" />
              </button>
<!--              <div class="divider" />-->
<!--              <button class="menu-row" type="button"><span>显示与字体</span>-->
<!--                <ChevronRight :size="14" />-->
<!--              </button>-->
<!--              <div class="divider" />-->
<!--              <button class="menu-row" type="button"><span>数据同步</span>-->
<!--                <ChevronRight :size="14" />-->
<!--              </button>-->
            </article>
          </section>

          <section class="menu-section">
            <h2>支持</h2>
            <article class="card menu-card">
              <button class="menu-row" type="button"><span>帮助中心</span>
                <ChevronRight :size="14" />
              </button>
              <div class="divider" />
              <button class="menu-row" type="button"><span>关于应用</span>
                <ChevronRight :size="14" />
              </button>
            </article>
          </section>

          <!-- <section v-if="isDev" class="menu-section">
            <h2>开发调试</h2>
            <article class="card menu-card">
              <button class="menu-row" type="button" :disabled="isSendingDevNotification" @click="handleDevNotificationTest">
                <span>{{ isSendingDevNotification ? '通知发送中...' : '测试通知接口' }}</span>
                <ChevronRight :size="14" />
              </button>
            </article>
            <p v-if="devNotificationFeedback" class="dev-feedback">{{ devNotificationFeedback }}</p>
          </section> -->

          <button class="logout-btn btn-soft interactive-card" type="button" @click="handleLogout">
            {{ isLoggingOut ? '退出中...' : '退出登录' }}
          </button>
          <div class="spacer" />
        </div>

      </PullToRefresh>

      <BottomNav active="me" />
    </section>
  </main>

  <AccountSettingsSheet
    v-model="isAccountSettingsOpen"
    :profile="profile"
    @profile-updated="handleProfileUpdated"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Bell, ChevronRight, User } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

import { authApi, dashboardApi, toApiError, userApi, type DashboardSummary, type UserProfile } from '../api'
import AccountSettingsSheet from '../components/AccountSettingsSheet.vue'
import BottomNav from '../components/BottomNav.vue'
import PullToRefresh from '../components/PullToRefresh.vue'
import '../styles/mobile-shell.css'

const router = useRouter()

const profile = ref<UserProfile | null>(null)
const summary = ref<DashboardSummary | null>(null)
const errorMessage = ref('')
const isLoggingOut = ref(false)
const isAccountSettingsOpen = ref(false)
// const isSendingDevNotification = ref(false)
// const devNotificationFeedback = ref('')
//const isDev = import.meta.env.DEV

// const runDevNotificationTest = import.meta.env.DEV
//   ? async () => {
//       if (!(typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window)) {
//         return '当前不在 Tauri 环境，无法触发系统通知。'
//       }
//
//       const notification = await import('@tauri-apps/plugin-notification')
//       let permissionGranted = await notification.isPermissionGranted()
//
//       if (!permissionGranted) {
//         const permission = await notification.requestPermission()
//         permissionGranted = permission === 'granted'
//       }
//
//       if (!permissionGranted) {
//         return '通知权限未授权，测试通知未发送。'
//       }
//       console.log("send notification")
//
//       notification.sendNotification({
//         id: 920001,
//         title: '开发环境通知测试',
//         body: '这是一条仅用于开发调试的测试通知。',
//         autoCancel: true,
//         extra: {
//           route: '/task-reminders',
//           notificationType: 'dev-notification-test',
//         },
//       })
//
//       return '测试通知已发送。'
//     }
//   : undefined

const displayName = computed(() => {
  if (!profile.value) {
    return '用户信息待同步'
  }

  return `${profile.value.name} · ${profile.value.role}`
})

const onlineDeviceCount = computed(() => {
  if (!summary.value) {
    return '--'
  }

  return String(summary.value.deviceStatuses.find((item) => item.status === 'online')?.count ?? 0)
})

const displayMeta = computed(() => {
  if (!profile.value) {
    return '农场信息待同步'
  }

  return `${profile.value.farmName} · 设备在线 ${onlineDeviceCount.value} 台`
})

// const monthlyInspections = computed(() => profile.value?.monthlyInspections ?? '--')
// const completionRate = computed(() => profile.value?.taskCompletionRate ?? '--')

const loadPageData = async () => {
  errorMessage.value = ''

  const [profileResult, summaryResult] = await Promise.allSettled([userApi.getMe(), dashboardApi.getSummary()])

  if (profileResult.status === 'fulfilled') {
    profile.value = profileResult.value
  } else {
    errorMessage.value = toApiError(profileResult.reason).message
  }

  if (summaryResult.status === 'fulfilled') {
    summary.value = summaryResult.value
  } else if (!errorMessage.value) {
    errorMessage.value = toApiError(summaryResult.reason).message
  }
}

const handleLogout = async () => {
  isLoggingOut.value = true

  try {
    await authApi.logout()
    await router.push('/login')
  } finally {
    isLoggingOut.value = false
  }
}

const handleProfileUpdated = (nextProfile: UserProfile) => {
  profile.value = nextProfile
}

const goToNotificationSettings = () => {
  void router.push('/notification-settings')
}

// const handleDevNotificationTest = async () => {
//   if (!runDevNotificationTest || isSendingDevNotification.value) {
//     return
//   }
//
//   isSendingDevNotification.value = true
//   devNotificationFeedback.value = ''
//
//   try {
//     devNotificationFeedback.value = await runDevNotificationTest()
//   } catch (error) {
//     devNotificationFeedback.value = `测试通知发送失败：${toApiError(error).message}`
//   } finally {
//     isSendingDevNotification.value = false
//   }
// }

onMounted(() => {
  void loadPageData()
})
</script>

<style scoped>
.me-top {
  height: 66px;
  padding: 12px 20px;
}

.me-title {
  margin: 0;
  color: var(--shell-text-strong);
  font-size: 20px;
  font-weight: 600;
}

.icon-top,
.arrow,
.menu-row :deep(svg) {
  color: var(--shell-text-subtle);
}

.me-body {
  padding: 18px 20px 8px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.profile-card {
  border: 1px solid var(--shell-line);
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 14px;
  text-align: left;
  cursor: pointer;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: var(--shell-primary-soft);
  color: var(--shell-primary);
  display: grid;
  place-items: center;
}

.profile-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name {
  margin: 0;
  color: var(--shell-text-strong);
  font-size: 14px;
  font-weight: 600;
}

.meta {
  margin: 0;
  color: var(--shell-text-muted);
  font-size: 11px;
}

.page-error {
  margin: -4px 0 0;
  color: var(--shell-warning);
  font-size: 12px;
}

.dev-feedback {
  margin: 0;
  color: var(--shell-primary);
  font-size: 12px;
  line-height: 1.45;
}

.stat-row {
  display: flex;
  gap: 10px;
}

.stat-card {
  flex: 1;
  border-radius: 10px;
  padding: 10px;
  gap: 4px;
}

.value {
  margin: 0;
  color: var(--shell-text-strong);
  font-size: 18px;
  font-weight: 600;
}

.value.green {
  color: var(--shell-primary);
}

.label {
  margin: 0;
  color: var(--shell-text-muted);
  font-size: 11px;
}

.menu-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-section h2 {
  margin: 0;
  color: var(--shell-text-strong);
  font-size: 14px;
  font-weight: 600;
}

.menu-card {
  padding: 6px 12px;
}

.menu-row {
  width: 100%;
  border: 0;
  background: transparent;
  padding: 10px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--shell-text-body);
  font-size: 13px;
  font-weight: 500;
}

.logout-btn {
  width: 100%;
  height: 40px;
  font-size: 12px;
  font-weight: 500;
}

.spacer {
  flex: 1;
}

.interactive-card {
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.interactive-card:hover {
  transform: translateY(-1px);
  border-color: color-mix(in oklab, var(--shell-primary-soft) 44%, var(--shell-primary));
  box-shadow: 0 10px 20px color-mix(in oklab, var(--shell-primary) 8%, transparent);
}
</style>
