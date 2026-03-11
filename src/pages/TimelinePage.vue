<template>
  <main class="app-page">
    <section class="phone-shell">
      <header class="top-bar timeline-top">
        <h1 class="title">时间线</h1>
        <span class="weather">24°C · 北区</span>
      </header>

      <div class="body-scroll timeline-body">
        <div class="filter-row">
          <span class="chip chip-active">全部</span>
          <span class="chip">monitoring</span>
          <span class="chip chip-warn">warning</span>
        </div>

        <p class="date eyebrow-text">今天 · 2月23日</p>
        <article class="card timeline-card">
          <div class="row-between top-row">
            <div class="row-left name-row">
              <Bug :size="16" class="icon" />
              <p class="name">蚜虫复查</p>
            </div>
            <span class="badge-soft">中等</span>
          </div>
          <p class="summary">东侧幼苗区虫点增加，建议当日完成二次巡检。</p>
          <span class="status-tag status-neutral">monitoring</span>
        </article>

        <p class="date eyebrow-text">昨天 · 2月22日</p>
        <article class="card timeline-card">
          <div class="row-between top-row">
            <div class="row-left name-row">
              <Leaf :size="16" class="icon" />
              <p class="name">蓟马处置</p>
            </div>
            <span class="status-tag status-warm">warning</span>
          </div>
          <p class="summary">西区完成局部喷施，计划明早复检并更新风险等级。</p>
        </article>
      </div>

      <BottomNav active="timeline" />
    </section>
  </main>
</template>

<script setup lang="ts">
import { Bug, Leaf } from 'lucide-vue-next'
import BottomNav from '../components/BottomNav.vue'
import '../styles/mobile-shell.css'
</script>

<style scoped>
.timeline-top {
  height: 66px;
  padding: 12px 20px;
}

.title {
  margin: 0;
  color: var(--shell-text-strong);
  font-size: 20px;
  font-weight: 600;
}

.weather {
  color: var(--shell-text-subtle);
  font-size: 11px;
  font-weight: 500;
}

.timeline-body {
  padding: 16px 20px 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-row {
  display: flex;
  gap: 8px;
}

.chip {
  border: 1px solid var(--shell-line);
  border-radius: 999px;
  background: var(--shell-bg-muted);
  color: var(--shell-text-subtle);
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 500;
}

.chip-active {
  border: 0;
  background: var(--shell-primary-soft);
  color: var(--shell-primary);
  font-weight: 600;
}

.chip-warn {
  color: var(--shell-warning);
}

.timeline-card {
  padding: 12px;
  gap: 8px;
}

.top-row {
  gap: 10px;
}

.name-row {
  gap: 8px;
}

.icon {
  color: var(--shell-icon);
}

.name {
  margin: 0;
  color: var(--shell-text-strong);
  font-size: 14px;
  font-weight: 600;
}

.summary {
  margin: 0;
  color: var(--shell-text-body);
  font-size: 12px;
}
</style>
