<template>
  <main class="app-page">
    <section class="phone-shell about-shell">
      <header class="top-bar about-top">
        <button class="back-btn" type="button" @click="goBack">
          <ArrowLeft :size="16" />
        </button>
        <div class="title-wrap">
          <h1 class="page-title">关于应用</h1>
          <p class="page-subtitle">应用信息与开源项目鸣谢。</p>
        </div>
      </header>

      <section class="about-hero">
        <div class="app-icon-wrap">
          <img class="app-icon" src="/tauri.svg" alt="应用图标" />
        </div>
        <h2>{{ appName }}</h2>
        <p>版本 {{ appVersion }}</p>
      </section>

      <section class="acknowledgement-section">
        <h2>开源鸣谢</h2>
        <article class="card acknowledgement-card">
          <div v-for="(project, index) in openSourceProjects" :key="project.name" class="acknowledgement-item">
            <div class="acknowledgement-row">
              <div class="acknowledgement-text">
                <p class="acknowledgement-name">{{ project.name }}</p>
                <p class="acknowledgement-desc">{{ project.description }}</p>
              </div>
              <span class="acknowledgement-tag">{{ project.type }}</span>
            </div>
            <div v-if="index < openSourceProjects.length - 1" class="divider" />
          </div>
        </article>
      </section>

      <p class="about-note">感谢以上开源项目为本应用的开发、构建和跨端运行提供支持。</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

import '../styles/mobile-shell.css'

const router = useRouter()

const appName = 'manage-system'
const appVersion = '0.1.0'

const openSourceProjects = [
  { name: 'Tauri', description: '桌面端应用框架，负责原生窗口与 Rust 后端集成。', type: '框架' },
  { name: 'Vue 3', description: '前端界面框架，支撑页面、组件和响应式状态。', type: '框架' },
  { name: 'TypeScript', description: '为前端业务代码提供静态类型检查。', type: '语言' },
  { name: 'Vite', description: '提供开发服务器和前端生产构建能力。', type: '构建' },
  { name: 'Tailwind CSS / DaisyUI', description: '提供样式工具和基础 UI 设计变量。', type: '样式' },
  { name: 'Pinia', description: 'Vue 生态的状态管理方案。', type: '状态' },
  { name: 'Vue Router', description: '负责应用页面路由与导航。', type: '路由' },
  { name: 'Axios', description: '负责浏览器端 HTTP 请求。', type: '网络' },
  { name: 'lucide-vue-next', description: '提供轻量、统一的 Vue 图标组件。', type: '图标' },
  { name: 'qweather-icons', description: '提供天气相关图标资源。', type: '图标' },
  { name: 'v-viewer / Viewer.js', description: '提供图片预览与查看能力。', type: '图片' },
  { name: 'vue-showdown', description: '提供 Markdown 内容渲染能力。', type: '内容' },
] as const

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  void router.push('/me')
}
</script>

<style scoped>
.about-shell {
  padding: 20px;
  gap: 16px;
  overflow-y: auto;
}

.about-top {
  min-height: 68px;
  padding: 0;
  align-items: flex-start;
  gap: 12px;
}

.back-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--shell-line);
  border-radius: 10px;
  background: color-mix(in oklab, var(--shell-bg) 82%, white);
  color: var(--shell-text-strong);
  display: grid;
  place-items: center;
}

.title-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  margin: 0;
  color: var(--shell-text-strong);
  font-size: 21px;
  font-weight: 600;
}

.page-subtitle {
  margin: 0;
  color: var(--shell-text-muted);
  font-size: 12px;
  line-height: 1.45;
}

.about-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 22px 0 8px;
  text-align: center;
}

.app-icon-wrap {
  width: 74px;
  height: 74px;
  border: 1px solid var(--shell-line);
  border-radius: 20px;
  background: color-mix(in oklab, var(--shell-bg) 84%, white);
  display: grid;
  place-items: center;
  box-shadow: 0 12px 24px color-mix(in oklab, var(--shell-primary) 8%, transparent);
}

.app-icon {
  width: 42px;
  height: 42px;
}

.about-hero h2 {
  margin: 8px 0 0;
  color: var(--shell-text-strong);
  font-size: 19px;
  font-weight: 700;
}

.about-hero p,
.about-note {
  margin: 0;
  color: var(--shell-text-muted);
  font-size: 12px;
  line-height: 1.45;
}

.acknowledgement-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.acknowledgement-section h2 {
  margin: 0;
  color: var(--shell-text-strong);
  font-size: 14px;
  font-weight: 600;
}

.acknowledgement-card {
  padding: 6px 12px;
}

.acknowledgement-item {
  display: flex;
  flex-direction: column;
}

.acknowledgement-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
}

.acknowledgement-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.acknowledgement-name {
  margin: 0;
  color: var(--shell-text-strong);
  font-size: 13px;
  font-weight: 600;
}

.acknowledgement-desc {
  margin: 0;
  color: var(--shell-text-muted);
  font-size: 11px;
  line-height: 1.45;
}

.acknowledgement-tag {
  flex: 0 0 auto;
  border-radius: 999px;
  background: var(--shell-primary-soft);
  color: var(--shell-primary);
  padding: 5px 9px;
  font-size: 10px;
  font-weight: 700;
}

.about-note {
  padding: 0 2px 10px;
}
</style>
