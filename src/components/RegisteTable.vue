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
            maxlength="11"
          >
        </div>
      </div>


      <div class="field-block">
        <label class="field-label">设置密码</label>
        <div class="app-input row-between">
          <input
            v-model="password"
            :type="passwordFieldType"
            class="app-input-control"
            placeholder="请输入 6 位以上密码"
          >
          <EyeOff v-if="!showPassword" :size="16" class="icon-muted toggle-icon" @click="toggleShowPassword" />
          <Eye v-else :size="16" class="icon-muted toggle-icon" @click="toggleShowPassword" />
        </div>
      </div>

      <div class="field-block">
        <label class="field-label">确认密码</label>
        <div class="app-input row-between">
          <input
            v-model="confirmPassword"
            :type="passwordFieldType"
            class="app-input-control"
            placeholder="请再次输入密码"
          >
          <EyeOff
            v-if="!showPassword"
            :size="16"
            class="icon-muted toggle-icon"
            @click="toggleShowPassword"
          />
          <Eye
            v-else
            :size="16"
            class="icon-muted toggle-icon"
            @click="toggleShowPassword"
          />
        </div>
      </div>

      <div class="row-between actions-row">
        <div class="remember-row">
          <button class="check-wrap" type="button" @click="toggleAgreement">
            <Check v-if="agreed" :size="12" color="#ffffff" />
          </button>
          <span class="remember-text">我已阅读并同意用户协议</span>
        </div>
        <button class="link-btn" type="button" @click="backToLogin">去登录</button>
      </div>

      <button class="btn btn-primary register-btn" type="button" @click="handleRegister">
        <LockKeyhole :size="14" color="#ffffff" />
        <span>注册账号</span>
      </button>

      <p class="helper-text">注册成功后将跳转到登录页</p>
    </article>
  </div>
</template>

<script setup lang="ts">
import { Check, Eye, EyeOff, LockKeyhole } from 'lucide-vue-next'
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'

const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const agreed = ref(true)
const showPassword = ref(false)
const router = useRouter()

let countdownTimer: ReturnType<typeof setInterval> | null = null

const isPhoneValid = computed(() => /^1\d{10}$/.test(phone.value.trim()))
const passwordFieldType = computed(() => (showPassword.value ? 'text' : 'password'))

const loginFlag = defineModel()


const backToLogin = () => {
  loginFlag.value = true
}

const showMessage = (message: string) => {
  window.alert(message)
}


const handleRegister = () => {
  if (!phone.value.trim()  || !password.value.trim() || !confirmPassword.value.trim()) {
    showMessage('请完整填写注册信息')
    return
  }

  if (!isPhoneValid.value) {
    showMessage('请输入正确的 11 位手机号')
    return
  }

  if (password.value.trim().length < 6) {
    showMessage('密码长度不能少于 6 位')
    return
  }

  if (password.value !== confirmPassword.value) {
    showMessage('两次输入的密码不一致')
    return
  }

  if (!agreed.value) {
    showMessage('请先同意用户协议')
    return
  }

  localStorage.setItem('manage-system-register-phone', phone.value.trim())
  showMessage('注册成功，请登录')
  backToLogin()
}

const toggleShowPassword = () => {
  showPassword.value = !showPassword.value
}


const toggleAgreement = () => {
  agreed.value = !agreed.value
}

onBeforeUnmount(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
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
  flex-shrink: 0;
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
  flex-shrink: 0;
}

.code-btn {
  border: 0;
  background: transparent;
  color: var(--shell-primary);
  font-size: 12px;
  font-weight: 600;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
}

.code-btn:disabled {
  color: var(--shell-text-subtle);
  cursor: not-allowed;
}

.register-btn {
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

.helper-text {
  margin: 0;
  color: var(--shell-text-subtle);
  font-size: 11px;
  text-align: center;
}

.toggle-icon {
  cursor: pointer;
}
</style>
