<template>
  <main class="app-page">
    <section class="phone-shell">
      <div class="body-scroll detail-body">
        <img
          class="hero-image"
          src="https://images.unsplash.com/photo-1640818865404-8adb9c90a097?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzE4NDU4NjR8&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Crop"
        />

        <section class="title-wrap">
          <h1 class="pest-name">蚜虫监测报告</h1>
          <p class="science">Aphidoidea · Hemiptera</p>
          <span class="severity-badge badge-soft">严重度：中等</span>
        </section>

        <section class="block">
          <h2 class="block-title">虫口密度趋势</h2>
          <article class="card chart-card">
            <div class="rule" />
            <div class="trend-row">
              <span class="dot" />
              <span class="line active" />
              <span class="dot" />
              <span class="line active" />
              <span class="dot" />
              <span class="line active" />
              <span class="dot" />
            </div>
            <div class="rule muted" />
          </article>
        </section>

        <section class="block">
          <h2 class="block-title">Analysis</h2>
          <article class="card info-card">
            <p class="body-text">过去7日密度缓慢上行，最近两次采样达到局部峰值。</p>
            <div class="divider" />
            <p class="body-text">建议优先处理高湿区域，并在24小时后复测。</p>
          </article>
        </section>

        <section class="block">
          <h2 class="block-title">Recommendation</h2>
          <article class="card info-card">
            <p class="body-text">建议今晚18:00前完成北区点状防治并记录。</p>
            <div class="button-row">
              <button class="light-btn btn-soft-primary" type="button">确认执行</button>
              <button class="light-btn btn-soft" type="button">稍后处理</button>
            </div>
          </article>
        </section>

        <section class="block map-block">
          <h2 class="map-title">Map Preview</h2>
          <div class="map-frame">地块 N-3 边界预览</div>
        </section>
      </div>

      <BottomNav active="alert" />
    </section>
  </main>
</template>

<script setup lang="ts">
import BottomNav from '../components/BottomNav.vue'
import '../styles/mobile-shell.css'
</script>

<style scoped>
.detail-body {
  padding: 0 20px 4px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hero-image {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 0;
}

.title-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pest-name {
  margin: 0;
  color: var(--shell-text-strong);
  font-size: 22px;
  font-weight: 600;
}

.science {
  margin: 0;
  color: var(--shell-text-muted);
  font-size: 12px;
}

.severity-badge {
  width: max-content;
}

.block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.block-title {
  margin: 0;
  color: var(--shell-text-strong);
  font-size: 15px;
  font-weight: 600;
}

.chart-card {
  height: 92px;
  padding: 10px;
  gap: 6px;
}

.rule {
  width: 100%;
  height: 1px;
  background: color-mix(in oklab, var(--shell-line) 66%, white);
}

.rule.muted {
  background: var(--shell-line);
}

.trend-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dot {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: var(--shell-primary);
}

.line.active {
  width: 52px;
  height: 1px;
  background: var(--shell-primary);
}

.info-card {
  padding: 10px;
  gap: 8px;
}

.body-text {
  margin: 0;
  color: var(--shell-text-body);
  font-size: 12px;
  line-height: 1.45;
}

.button-row {
  display: flex;
  gap: 8px;
}

.light-btn {
  flex: 1;
  padding: 8px 0;
  font-size: 12px;
}

.map-block {
  gap: 8px;
}

.map-title {
  margin: 0;
  color: var(--shell-text-strong);
  font-size: 14px;
  font-weight: 600;
}

.map-frame {
  height: 56px;
  border: 1px solid var(--shell-line);
  border-radius: 10px;
  background: var(--shell-bg-soft);
  color: var(--shell-text-muted);
  font-size: 12px;
  font-weight: 500;
  display: grid;
  place-items: center;
}
</style>
