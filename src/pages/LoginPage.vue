<template>
  <main class="app-page">
    <section class="phone-shell">
      <header class="top-bar login-top">
        <div class="brand-wrap">
          <div class="brand-icon-wrap">
            <Leaf :size="16" />
          </div>
          <span class="brand-name">Pencil Agro</span>
        </div>
        <span class="help-text">帮助</span>
      </header>

      <div class="body-scroll login-body">
        <section class="main-stack">
          <div class="title-group">
            <h1 class="title">欢迎回来</h1>
            <p class="subtitle">登录后查看地块巡查与虫情趋势</p>
          </div>
          <LoginTable v-if="loginFlag" />
          <RegisterTable v-else v-model="loginFlag" />
          <div class="alt-login-row">
            <div class="line" />
            <span class="alt-text">支持游客先体验图片检测</span>
            <div class="line" />
          </div>
        </section>

        <section class="login-bottom">
          <p class="register-text" v-if="loginFlag" @click="switchLoginRegister">没有账号？立即注册</p>
          <p class="policy-text">登录即同意《用户协议》与《隐私政策》</p>
        </section>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { Leaf } from 'lucide-vue-next'
import LoginTable from '../components/LoginTable.vue'
import '../styles/mobile-shell.css'
import { ref } from 'vue'
import RegisterTable from '../components/RegisteTable.vue'

const loginFlag = ref(true)

const switchLoginRegister = () => {
  loginFlag.value = !loginFlag.value
}
</script>

<style scoped>
.login-top {
  height: 68px;
  padding: 12px 20px;
}

.brand-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-icon-wrap {
  width: 28px;
  height: 28px;
  border: 1px solid var(--shell-line-strong);
  border-radius: 8px;
  background: var(--shell-primary-soft);
  color: var(--shell-primary);
  display: grid;
  place-items: center;
}

.brand-name {
  color: var(--shell-text-strong);
  font-size: 14px;
  font-weight: 600;
}

.help-text {
  color: var(--shell-text-muted);
  font-size: 12px;
  font-weight: 500;
}

.login-body {
  padding: 28px 20px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;
}

.main-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.title-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.title {
  margin: 0;
  color: var(--shell-text-main);
  font-size: 28px;
  font-weight: 700;
}

.subtitle {
  margin: 0;
  color: var(--shell-text-muted);
  font-size: 13px;
  font-weight: 500;
}

.alt-login-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.line {
  width: 92px;
  height: 1px;
  background: var(--shell-line);
}

.alt-text {
  color: var(--shell-text-muted);
  font-size: 12px;
  font-weight: 500;
}

.login-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.register-text {
  margin: 0;
  color: var(--shell-text-body);
  font-size: 12px;
  font-weight: 500;
}

.policy-text {
  margin: 0;
  color: var(--shell-text-subtle);
  font-size: 11px;
}
</style>
