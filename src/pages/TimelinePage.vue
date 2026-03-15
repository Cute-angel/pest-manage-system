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

        <section v-for="group in groupedReports" :key="group.dayLabel" class="timeline-group">
          <p class="date eyebrow-text">{{ group.dayLabel }}</p>
          <TimelineItemCard
            v-for="item in group.items"
            :key="item.id"
            :item="item"
            :to="`/timeline/${item.id}`"
          />
        </section>
      </div>


      <BottomNav active="timeline" />
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BottomNav from '../components/BottomNav.vue'
import TimelineItemCard from '../components/TimelineItemCard.vue'
import { pestReports } from '../data/pestReports'
import '../styles/mobile-shell.css'

const groupedReports = computed(() => {
  const groups = pestReports.reduce<Array<{ dayLabel: string; items: typeof pestReports }>>((acc, item) => {
    const existingGroup = acc.find((group) => group.dayLabel === item.dayLabel)

    if (existingGroup) {
      existingGroup.items.push(item)
      return acc
    }

    acc.push({ dayLabel: item.dayLabel, items: [item] })
    return acc
  }, [])

  return groups
})
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

.timeline-group {
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
</style>
