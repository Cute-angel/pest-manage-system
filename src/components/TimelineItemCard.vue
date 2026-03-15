<template>
  <RouterLink v-if="to" :to="to" class="card-link">
    <article class="card card-12 interactive-card">
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
  </RouterLink>

  <article v-else class="card card-12">
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
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  item: {
    icon: Component
    name: string
    severity: string
    summary: string
    status: string
    severityClass: string
    statusClass: string
  }
  to?: string
}>()
</script>

<style scoped>
.card-link {
  display: block;
  text-decoration: none;
}

.card-12 {
  padding: 12px;
  gap: 8px;
}

.interactive-card {
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.interactive-card:hover {
  transform: translateY(-1px);
  border-color: color-mix(in oklab, var(--shell-primary-soft) 44%, var(--shell-primary));
  box-shadow: 0 10px 20px color-mix(in oklab, var(--shell-primary) 8%, transparent);
}

.name-wrap {
  gap: 8px;
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
</style>
