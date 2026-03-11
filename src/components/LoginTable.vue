<template>
  <div>
    <article class="card form-card">
      <div class="field-block">
        <label class="field-label">手机号</label>
        <div class="app-input">
          <input
            v-model="phone"
            type="text"
            class="app-input-control"
            placeholder="请输入手机号"
          >
        </div>
      </div>

      <div class="field-block">
        <label class="field-label">密码</label>
        <div class="app-input row-between">
          <input
            v-model="password"
            :type="passwordFieldType"
            class="app-input-control"
            placeholder="请输入密码"
          >
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
        <span>登录</span>
      </button>
    </article>
  </div>
</template>

<script setup lang="ts">
import { Check, Eye, EyeOff, LockKeyhole } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const AUTH_STORAGE_KEY = 'manage-system-authenticated'

const phone = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const router = useRouter()
const route = useRoute()

const passwordFieldType = computed(() => (showPassword.value ? 'text' : 'password'))

const handleLogin = () => {
  if (!phone.value.trim() || !password.value.trim()) {
    return
  }

  localStorage.setItem(AUTH_STORAGE_KEY, 'true')

  const redirectTarget =
    typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
      ? route.query.redirect
      : '/home'

  router.push(redirectTarget)
}

const toggleRememberMe = () => {
  rememberMe.value = !rememberMe.value
}

const toggleShowPassword = () => {
  showPassword.value = !showPassword.value
}
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

.toggle-icon {
  cursor: pointer;
}
</style>
