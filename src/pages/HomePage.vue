<template>
  <main class="app-page">
    <section class="phone-shell">
      <header class="top-bar home-top">
        <div class="field-sel">
          <span class="field-text">北区地块</span>
          <ChevronDown :size="14" class="icon-muted" />
        </div>
        <div class="weather-wrap">
          <CloudSun :size="16" class="icon-subtle" />
          <span class="weather-text">24°C · 微风</span>
        </div>
      </header>

      <div class="body-scroll home-body">
        <section class="stack-10">
          <h2 class="section-title">Today’s Recommendation</h2>
          <article class="card card-14">
            <div class="row-between">
              <p class="card-heading">优先巡查北区幼苗地块</p>
              <ArrowRight :size="14" class="icon-muted" />
            </div>
            <p class="card-text">建议在今日 15:00 前完成蚜虫热点复查。</p>
            <p class="card-note">数据依据：捕获量 +18%，湿度 82%，风险持续上行。</p>
            <div class="divider" />
          </article>
        </section>

        <section class="stack-12">
          <h2 class="section-title">Pest Timeline</h2>
          <p class="date-label eyebrow-text">今天 · 2月23日</p>

          <article class="card card-12" v-for="item in todayItems" :key="item.name">
            <div class="row-between">
              <div class="row-left name-wrap">
                <component :is="item.icon" :size="16" class="icon-subtle" />
                <p class="item-name">{{ item.name }}</p>
              </div>
              <span :class="item.severityClass">{{ item.severity }}</span>
            </div>
            <p class="item-summary">{{ item.summary }}</p>
            <span class="status-tag" :class="item.statusClass">{{ item.status }}</span>
          </article>

          <div class="divider" />
          <p class="date-label eyebrow-text">昨天 · 2月22日</p>

          <article class="card card-12" v-for="item in yesterdayItems" :key="item.name">
            <div class="row-between">
              <div class="row-left name-wrap">
                <component :is="item.icon" :size="16" class="icon-subtle" />
                <p class="item-name">{{ item.name }}</p>
              </div>
              <span :class="item.severityClass">{{ item.severity }}</span>
            </div>
            <p class="item-summary">{{ item.summary }}</p>
            <span class="status-tag" :class="item.statusClass">{{ item.status }}</span>
          </article>
        </section>
      </div>

      <div class="fab-row">
        <button class="fab" type="button" aria-label="Add">
          <Plus :size="20" color="#FFFFFF" />
        </button>
      </div>

      <BottomNav active="home" />
    </section>
  </main>
</template>

<script setup lang="ts">
import { ArrowRight, Bug, ChevronDown, CloudSun, Leaf, Plus, ShieldCheck } from 'lucide-vue-next'
import BottomNav from '../components/BottomNav.vue'
import '../styles/mobile-shell.css'

type TimelineItem = {
  icon: unknown
  name: string
  severity: string
  summary: string
  status: string
  severityClass: string
  statusClass: string
}

const todayItems: TimelineItem[] = [
  {
    icon: Bug,
    name: '蚜虫',
    severity: '中等',
    summary: '东侧叶背发现集中虫点，数量较昨日略增。',
    status: 'monitoring',
    severityClass: 'badge-soft',
    statusClass: 'status-neutral',
  },
]

const yesterdayItems: TimelineItem[] = [
  {
    icon: Leaf,
    name: '蓟马',
    severity: '偏高',
    summary: '西区样本显示斑点扩散，需复核并快速处置。',
    status: 'warning',
    severityClass: 'badge-warm',
    statusClass: 'status-warm',
  },
  {
    icon: ShieldCheck,
    name: '白粉虱',
    severity: '轻度',
    summary: '已完成局部处理，虫口密度回落至安全区间。',
    status: 'treated',
    severityClass: 'badge-soft',
    statusClass: 'status-neutral',
  },
]
</script>

<style scoped>
.home-top {
  height: 68px;
  padding: 12px 20px;
}

.field-sel {
  border: 1px solid var(--shell-line);
  border-radius: 8px;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: color-mix(in oklab, var(--shell-bg) 82%, white);
}

.field-text {
  color: var(--shell-text-strong);
  font-size: 13px;
  font-weight: 500;
}

.weather-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.weather-text {
  color: var(--shell-text-body);
  font-size: 12px;
  font-weight: 500;
}

.home-body {
  padding: 20px 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stack-10 {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stack-12 {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-14 {
  padding: 14px;
  gap: 8px;
}

.card-12 {
  padding: 12px;
  gap: 8px;
}

.name-wrap {
  gap: 8px;
}

.card-heading {
  margin: 0;
  color: var(--shell-text-strong);
  font-size: 14px;
  font-weight: 500;
}

.card-text {
  margin: 0;
  color: var(--shell-text-body);
  font-size: 13px;
}

.card-note {
  margin: 0;
  color: var(--shell-text-muted);
  font-size: 11px;
}

.item-name {
  margin: 0;
  color: var(--shell-text-strong);
  font-size: 14px;
  font-weight: 600;
}

.item-summary {
  margin: 0;
  color: var(--shell-text-body);
  font-size: 12px;
}

.date-label {
  margin: 0;
}

.fab-row {
  padding: 0 20px 8px;
  display: flex;
  justify-content: flex-end;
}

.fab {
  width: 52px;
  height: 52px;
  border: 0;
  border-radius: 999px;
  background: var(--shell-primary);
  display: grid;
  place-items: center;
  box-shadow: 0 10px 20px color-mix(in oklab, var(--shell-primary) 22%, transparent);
}
</style>
