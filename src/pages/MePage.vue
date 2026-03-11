<template>
  <main class="app-page">
    <section class="phone-shell">
      <header class="top-bar me-top">
        <h1 class="me-title">我的</h1>
        <Bell :size="18" class="icon-top" />
      </header>

      <div class="body-scroll me-body">
        <article class="card profile-card">
          <div class="avatar"><User :size="18" /></div>
          <div class="profile-text">
            <p class="name">李晨 · 农场管理员</p>
            <p class="meta">北区农场 · 设备在线 12 台</p>
          </div>
          <ChevronRight :size="14" class="arrow" />
        </article>

        <section class="stat-row">
          <article class="card stat-card">
            <p class="value">28</p>
            <p class="label">本月巡检</p>
          </article>
          <article class="card stat-card">
            <p class="value green">96%</p>
            <p class="label">任务完成率</p>
          </article>
        </section>

        <section class="menu-section">
          <h2>偏好设置</h2>
          <article class="card menu-card">
            <button class="menu-row" type="button"><span>消息提醒</span><ChevronRight :size="14" /></button>
            <div class="divider" />
            <button class="menu-row" type="button"><span>显示与字体</span><ChevronRight :size="14" /></button>
            <div class="divider" />
            <button class="menu-row" type="button"><span>数据同步</span><ChevronRight :size="14" /></button>
          </article>
        </section>

        <section class="menu-section">
          <h2>支持</h2>
          <article class="card menu-card">
            <button class="menu-row" type="button"><span>帮助中心</span><ChevronRight :size="14" /></button>
            <div class="divider" />
            <button class="menu-row" type="button"><span>关于应用</span><ChevronRight :size="14" /></button>
          </article>
        </section>

        <button class="logout-btn btn-soft" type="button">退出登录</button>
        <div class="spacer" />
      </div>

      <BottomNav active="me" />
    </section>
  </main>
</template>

<script setup lang="ts">
import { Bell, ChevronRight, User } from 'lucide-vue-next'
import BottomNav from '../components/BottomNav.vue'
import '../styles/mobile-shell.css'
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
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 14px;
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
</style>
