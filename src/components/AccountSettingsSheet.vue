<template>
  <Teleport to="body">
    <Transition name="account-sheet">
      <div
        v-if="modelValue"
        class="account-sheet-mask"
        @click="emit('update:modelValue', false)"
      >
        <section class="account-sheet-panel" @click.stop>
          <header class="account-sheet-header">
            <button
              class="account-sheet-icon-btn account-sheet-icon-btn-soft"
              type="button"
              :aria-label="currentView === 'menu' ? 'close' : 'back'"
              @click="handleBack"
            >
              <ChevronLeft v-if="currentView !== 'menu'" :size="18" />
              <X v-else :size="18" />
            </button>

            <div class="account-sheet-title-wrap">
              <p class="account-sheet-title">{{ sheetTitle }}</p>
              <p class="account-sheet-subtitle">{{ sheetSubtitle }}</p>
            </div>

            <button
              class="account-sheet-icon-btn account-sheet-icon-btn-soft"
              type="button"
              aria-label="close"
              @click="emit('update:modelValue', false)"
            >
              <X :size="18" />
            </button>
          </header>

          <div class="account-sheet-body">
            <section v-if="currentView === 'menu'" class="account-menu">
              <button class="card account-menu-item" type="button" @click="openProfileForm">
                <div class="account-menu-copy">
                  <p class="account-menu-title">修改用户</p>
                  <p class="account-menu-text">更新当前账号的姓名展示信息</p>
                </div>
                <ChevronRight :size="16" class="menu-arrow" />
              </button>

              <button class="card account-menu-item" type="button" @click="openPasswordForm">
                <div class="account-menu-copy">
                  <p class="account-menu-title">修改密码</p>
                  <p class="account-menu-text">使用旧密码验证后设置新密码</p>
                </div>
                <ChevronRight :size="16" class="menu-arrow" />
              </button>
            </section>

            <form v-else-if="currentView === 'profile'" class="account-form" @submit.prevent="handleProfileSubmit">
              <article class="card account-form-card">
                <div class="field-block">
                  <label class="field-label" for="profile-name">姓名</label>
                  <div class="app-input">
                    <input
                      id="profile-name"
                      v-model="profileName"
                      type="text"
                      class="app-input-control"
                      placeholder="请输入姓名"
                      maxlength="20"
                    >
                  </div>
                </div>

                <p class="helper-text">仅支持修改当前展示姓名，最多 20 个字符。</p>
                <p v-if="profileErrorMessage" class="helper-text error-text">{{ profileErrorMessage }}</p>
                <p v-else-if="profileSuccessMessage" class="helper-text success-text">{{ profileSuccessMessage }}</p>
              </article>

              <button class="btn btn-primary submit-btn" type="submit" :disabled="isSubmittingProfile">
                {{ isSubmittingProfile ? '保存中...' : '保存资料' }}
              </button>
            </form>

            <form v-else class="account-form" @submit.prevent="handlePasswordSubmit">
              <article class="card account-form-card">
                <div class="field-block">
                  <label class="field-label" for="current-password">旧密码</label>
                  <div class="app-input row-between">
                    <input
                      id="current-password"
                      v-model="currentPassword"
                      :type="passwordFieldType"
                      class="app-input-control"
                      placeholder="请输入当前密码"
                    >
                    <EyeOff v-if="!showPassword" :size="16" class="icon-muted toggle-icon" @click="toggleShowPassword" />
                    <Eye v-else :size="16" class="icon-muted toggle-icon" @click="toggleShowPassword" />
                  </div>
                </div>

                <div class="field-block">
                  <label class="field-label" for="next-password">新密码</label>
                  <div class="app-input row-between">
                    <input
                      id="next-password"
                      v-model="newPassword"
                      :type="passwordFieldType"
                      class="app-input-control"
                      placeholder="请输入 6 位以上新密码"
                    >
                    <EyeOff v-if="!showPassword" :size="16" class="icon-muted toggle-icon" @click="toggleShowPassword" />
                    <Eye v-else :size="16" class="icon-muted toggle-icon" @click="toggleShowPassword" />
                  </div>
                </div>

                <div class="field-block">
                  <label class="field-label" for="confirm-password">确认密码</label>
                  <div class="app-input row-between">
                    <input
                      id="confirm-password"
                      v-model="confirmPassword"
                      :type="passwordFieldType"
                      class="app-input-control"
                      placeholder="请再次输入新密码"
                    >
                    <EyeOff v-if="!showPassword" :size="16" class="icon-muted toggle-icon" @click="toggleShowPassword" />
                    <Eye v-else :size="16" class="icon-muted toggle-icon" @click="toggleShowPassword" />
                  </div>
                </div>

                <p class="helper-text">密码长度至少 6 位，修改后当前登录状态保持不变。</p>
                <p v-if="passwordErrorMessage" class="helper-text error-text">{{ passwordErrorMessage }}</p>
                <p v-else-if="passwordSuccessMessage" class="helper-text success-text">{{ passwordSuccessMessage }}</p>
              </article>

              <button class="btn btn-primary submit-btn" type="submit" :disabled="isSubmittingPassword">
                {{ isSubmittingPassword ? '保存中...' : '修改密码' }}
              </button>
            </form>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight, Eye, EyeOff, X } from 'lucide-vue-next'

import { type UserProfile, userApi, toApiError } from '../api'

type SheetView = 'menu' | 'profile' | 'password'

const props = defineProps<{
  modelValue: boolean
  profile: UserProfile | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  profileUpdated: [profile: UserProfile]
}>()

const currentView = ref<SheetView>('menu')
const profileName = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const isSubmittingProfile = ref(false)
const isSubmittingPassword = ref(false)
const profileErrorMessage = ref('')
const passwordErrorMessage = ref('')
const profileSuccessMessage = ref('')
const passwordSuccessMessage = ref('')

const passwordFieldType = computed(() => (showPassword.value ? 'text' : 'password'))
const sheetTitle = computed(() => {
  if (currentView.value === 'profile') {
    return '修改用户'
  }

  if (currentView.value === 'password') {
    return '修改密码'
  }

  return '账号设置'
})
const sheetSubtitle = computed(() => {
  if (currentView.value === 'profile') {
    return '更新当前账号的姓名显示信息'
  }

  if (currentView.value === 'password') {
    return '输入旧密码并设置新的登录密码'
  }

  return '选择需要调整的账号信息'
})

const resetProfileForm = () => {
  profileName.value = props.profile?.name ?? ''
  profileErrorMessage.value = ''
  profileSuccessMessage.value = ''
}

const resetPasswordForm = () => {
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  showPassword.value = false
  passwordErrorMessage.value = ''
  passwordSuccessMessage.value = ''
}

const resetSheetState = () => {
  currentView.value = 'menu'
  resetProfileForm()
  resetPasswordForm()
}

const openProfileForm = () => {
  resetProfileForm()
  currentView.value = 'profile'
}

const openPasswordForm = () => {
  resetPasswordForm()
  currentView.value = 'password'
}

const handleBack = () => {
  if (currentView.value === 'menu') {
    emit('update:modelValue', false)
    return
  }

  currentView.value = 'menu'
}

const toggleShowPassword = () => {
  showPassword.value = !showPassword.value
}

const handleProfileSubmit = async () => {
  const normalizedName = profileName.value.trim()

  if (!normalizedName) {
    profileErrorMessage.value = '请输入姓名'
    profileSuccessMessage.value = ''
    return
  }

  if (normalizedName.length > 20) {
    profileErrorMessage.value = '姓名不能超过 20 个字符'
    profileSuccessMessage.value = ''
    return
  }

  isSubmittingProfile.value = true
  profileErrorMessage.value = ''
  profileSuccessMessage.value = ''

  try {
    const updatedProfile = await userApi.updateMe({ name: normalizedName })

    emit('profileUpdated', updatedProfile)
    profileName.value = updatedProfile.name
    profileSuccessMessage.value = '资料已更新'
  } catch (error) {
    profileErrorMessage.value = toApiError(error).message
  } finally {
    isSubmittingProfile.value = false
  }
}

const handlePasswordSubmit = async () => {
  if (!currentPassword.value.trim() || !newPassword.value.trim() || !confirmPassword.value.trim()) {
    passwordErrorMessage.value = '请完整填写密码信息'
    passwordSuccessMessage.value = ''
    return
  }

  if (newPassword.value.trim().length < 6) {
    passwordErrorMessage.value = '新密码长度不能少于 6 位'
    passwordSuccessMessage.value = ''
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    passwordErrorMessage.value = '两次输入的新密码不一致'
    passwordSuccessMessage.value = ''
    return
  }

  if (currentPassword.value === newPassword.value) {
    passwordErrorMessage.value = '新密码不能与旧密码相同'
    passwordSuccessMessage.value = ''
    return
  }

  isSubmittingPassword.value = true
  passwordErrorMessage.value = ''
  passwordSuccessMessage.value = ''

  try {
    await userApi.changePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    })

    resetPasswordForm()
    passwordSuccessMessage.value = '密码已更新'
  } catch (error) {
    passwordErrorMessage.value = toApiError(error).message
  } finally {
    isSubmittingPassword.value = false
  }
}

const setBodyOverflow = (locked: boolean) => {
  if (typeof document === 'undefined') {
    return
  }

  document.body.style.overflow = locked ? 'hidden' : ''
}

watch(
  () => props.modelValue,
  (visible) => {
    setBodyOverflow(visible)

    if (visible) {
      resetSheetState()
    }
  },
  { immediate: true },
)

watch(
  () => props.profile?.name,
  () => {
    if (!props.modelValue || currentView.value === 'password') {
      return
    }

    profileName.value = props.profile?.name ?? ''
  },
)

onBeforeUnmount(() => {
  setBodyOverflow(false)
})
</script>

<style scoped>
.account-sheet-mask {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background:
    radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.08), transparent 30%),
    rgba(10, 14, 19, 0.72);
  backdrop-filter: blur(10px);
}

.account-sheet-panel {
  width: min(100%, 430px);
  min-height: 48vh;
  max-height: min(84vh, 760px);
  background: color-mix(in oklab, var(--shell-bg) 92%, white);
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
  box-shadow: 0 -10px 34px rgba(0, 0, 0, 0.22);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.account-sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 18px 14px;
  border-bottom: 1px solid color-mix(in oklab, var(--shell-line) 78%, white);
}

.account-sheet-title-wrap {
  min-width: 0;
  flex: 1;
  text-align: center;
}

.account-sheet-title,
.account-sheet-subtitle {
  margin: 0;
}

.account-sheet-title {
  color: var(--shell-text-strong);
  font-size: 16px;
  font-weight: 700;
}

.account-sheet-subtitle {
  margin-top: 4px;
  color: var(--shell-text-muted);
  font-size: 12px;
}

.account-sheet-icon-btn {
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.account-sheet-icon-btn-soft {
  background: color-mix(in oklab, var(--shell-bg-muted) 84%, white);
  color: var(--shell-text-subtle);
}

.account-sheet-body {
  flex: 1;
  min-height: 0;
  padding: 18px 18px calc(18px + env(safe-area-inset-bottom, 0px));
  overflow: auto;
}

.account-menu,
.account-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.account-menu-item {
  border: 1px solid color-mix(in oklab, var(--shell-line) 88%, white);
  padding: 16px;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  text-align: left;
  cursor: pointer;
}

.account-menu-copy {
  flex: 1;
}

.account-menu-title,
.account-menu-text {
  margin: 0;
}

.account-menu-title {
  color: var(--shell-text-strong);
  font-size: 14px;
  font-weight: 600;
}

.account-menu-text {
  margin-top: 4px;
  color: var(--shell-text-muted);
  font-size: 12px;
}

.menu-arrow {
  color: var(--shell-text-subtle);
  flex-shrink: 0;
}

.account-form-card {
  padding: 14px;
  gap: 14px;
}

.field-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  color: var(--shell-text-body);
  font-size: 12px;
  font-weight: 500;
}

.helper-text {
  margin: 0;
  color: var(--shell-text-subtle);
  font-size: 11px;
  text-align: center;
}

.error-text {
  color: var(--shell-warning);
}

.success-text {
  color: var(--shell-primary);
}

.submit-btn {
  height: 46px;
  min-height: 46px;
  border: 0;
  border-radius: 10px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  box-shadow: none;
}

.submit-btn:disabled {
  opacity: 0.7;
}

.toggle-icon {
  cursor: pointer;
  flex-shrink: 0;
}

.account-sheet-enter-active,
.account-sheet-leave-active {
  transition: opacity 240ms ease;
}

.account-sheet-enter-active .account-sheet-panel,
.account-sheet-leave-active .account-sheet-panel {
  transition:
    transform 320ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 320ms ease;
}

.account-sheet-enter-from,
.account-sheet-leave-to {
  opacity: 0;
}

.account-sheet-enter-from .account-sheet-panel,
.account-sheet-leave-to .account-sheet-panel {
  transform: translateY(54px) scale(0.985);
  opacity: 0.92;
}
</style>
