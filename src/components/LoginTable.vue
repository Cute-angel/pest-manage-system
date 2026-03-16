<template>
  <div>
    <article class="card form-card">
      <div class="field-block">
        <label class="field-label">手机号</label>
        <div class="app-input">
          <input v-model="phone" type="text" class="app-input-control" placeholder="请输入手机号">
        </div>
      </div>

      <div class="field-block">
        <label class="field-label">密码</label>
        <div class="app-input row-between">
          <input v-model="password" :type="passwordFieldType" class="app-input-control" placeholder="请输入密码">
          <EyeOff v-if="!showPassword" :size="16" class="icon-muted toggle-icon" @click="toggleShowPassword" />
          <Eye v-else :size="16" class="icon-muted toggle-icon" @click="toggleShowPassword" />
        </div>
      </div>

      <div class="row-between actions-row">
        <div class="remember-row">
          <button class="check-wrap" type="button" @click="toggleRememberMe">
            <Check v-if="rememberMe" :size="12" color="#ffffff" />
          </button>
          <span class="remember-text">记住我</span>
        </div>
        <button class="link-btn" type="button">忘记密码？</button>
      </div>

      <button class="btn btn-primary login-btn" type="button" @click="handleLogin">
        <LockKeyhole :size="14" color="#ffffff" />
        <span>{{ isSubmitting ? '登录中...' : '登录' }}</span>
      </button>

      <button class="btn-soft guest-btn" type="button" @click="handleGuestLogin">
        游客登录，先体验图片检测
      </button>

      <p v-if="errorMessage" class="helper-text error-text">{{ errorMessage }}</p>
    </article>
  </div>
</template>

<script setup lang="ts">
import { Check, Eye, EyeOff, LockKeyhole } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  authApi,
  clearRememberedPhone,
  getRememberedPhone,
  setGuestSession,
  setRememberedPhone,
  toApiError,
} from '../api'

const phone = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const router = useRouter()
const route = useRoute()

const passwordFieldType = computed(() => (showPassword.value ? 'text' : 'password'))

const handleLogin = async () => {
  if (!phone.value.trim() || !password.value.trim()) {
    errorMessage.value = '请输入手机号和密码'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    await authApi.login({
      phone: phone.value.trim(),
      password: password.value,
    })

    if (rememberMe.value) {
      setRememberedPhone(phone.value.trim())
    } else {
      clearRememberedPhone()
    }

    const redirectTarget =
      typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
        ? route.query.redirect
        : '/home'

    await router.push(redirectTarget)
  } catch (error) {
    errorMessage.value = toApiError(error).message
  } finally {
    isSubmitting.value = false
  }
}

const handleGuestLogin = () => {
  setGuestSession()
  router.push('/detect')
}

const toggleRememberMe = () => {
  rememberMe.value = !rememberMe.value
}

const toggleShowPassword = () => {
  showPassword.value = !showPassword.value
}

onMounted(() => {
  const rememberedPhone = getRememberedPhone()
  const registerPhone = localStorage.getItem('manage-system-register-phone') ?? ''

  if (!rememberedPhone && !registerPhone) {
    return
  }

  phone.value = rememberedPhone || registerPhone
  rememberMe.value = Boolean(rememberedPhone)
})
</script>

<style lang="css" scoped>
.form-card {
  border-radius: 14px;
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

.actions-row {
  gap: 12px;
}

.remember-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.check-wrap {
  width: 16px;
  height: 16px;
  border: 0;
  border-radius: 5px;
  background: var(--shell-primary);
  display: grid;
  place-items: center;
  padding: 0;
  cursor: pointer;
}

.remember-text {
  color: var(--shell-text-body);
  font-size: 12px;
  font-weight: 500;
}

.link-btn {
  border: 0;
  background: transparent;
  color: var(--shell-primary);
  font-size: 12px;
  font-weight: 600;
  padding: 0;
}

.login-btn {
  height: 46px;
  min-height: 46px;
  border: 0;
  border-radius: 10px;
  gap: 6px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  box-shadow: none;
}

.guest-btn {
  height: 42px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
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

.toggle-icon {
  cursor: pointer;
}
</style>
