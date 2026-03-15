<template>
  <main class="app-page">
    <section class="phone-shell recommendation-shell">
      <button class="back-btn" type="button" @click="goBack">
        <ArrowLeft :size="16" />
      </button>

      <h1 class="header">建议详情</h1>
      <p class="sub">基于最新监测数据生成的处置建议</p>
      <div class="divider" />

      <section class="section">
        <h2>Situation Overview</h2>
        <p>北区幼苗叶背虫点密度上升，局部区域已有扩散迹象。</p>
      </section>
      <div class="divider " />

      <section class="section">
        <h2>Data Evidence</h2>
        <p>48小时捕获量 +18%，湿度 82%，温度 24°C，趋势连续上行。</p>
      </section>
      <div class="divider" />

      <section class="section">
        <h2>Recommended Action</h2>
        <p>优先对第 8-12 行进行点状防治，并标记高风险边缘带。</p>
      </section>
      <div class="divider" />

      <section class="section">
        <h2>Suggested Timeline</h2>
        <p>今天 18:00 前完成处理，明天 08:00 完成首次复检。</p>
      </section>

      <div class="spacer" />
      <button class="confirm-btn btn-soft-primary" type="button">Confirm / Schedule Action</button>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

import '../styles/mobile-shell.css'

const router = useRouter()

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/home')
}
</script>

<style scoped>
.recommendation-shell {
  padding: 20px 22px;
  gap: 8px;
}

.back-btn {
  width: max-content;
  border: 1px solid var(--shell-line);
  border-radius: 10px;
  background: color-mix(in oklab, var(--shell-bg) 82%, white);
  color: var(--shell-text-strong);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
}

.header {
  margin: 0;
  color: var(--shell-text-strong);
  font-size: 22px;
  font-weight: 600;
}

.sub {
  margin: 0;
  color: var(--shell-text-muted);
  font-size: 12px;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section h2 {
  margin: 0;
  color: var(--shell-text-strong);
  font-size: 14px;
  font-weight: 600;
}

.section p {
  margin: 0;
  color: var(--shell-text-body);
  font-size: 12px;
  line-height: 1.45;
}

.spacer {
  flex: 1;
}

.confirm-btn {
  width: 100%;
  height: 46px;
  font-size: 13px;
  font-weight: 600;
}
</style>
