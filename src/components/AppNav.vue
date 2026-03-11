<template>
  <header class="top-nav">
    <RouterLink to="/home">Home</RouterLink>
    <RouterLink to="/login">Login</RouterLink>
    <RouterLink to="/detail">Detail</RouterLink>
    <RouterLink to="/recommendation-detail">Recommendation</RouterLink>
    <RouterLink to="/timeline">Timeline</RouterLink>
    <RouterLink to="/me">Me</RouterLink>
  </header>
</template>

<script setup lang="ts"></script>

<style scoped>
.top-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  gap: 12px;
  padding: 10px 16px;
  background: var(--shell-bg-soft);
  border-bottom: 1px solid var(--shell-line);
  overflow-x: auto;
}

.top-nav a {
  color: var(--shell-text-body);
  text-decoration: none;
  font: 600 13px/1.2 Inter, sans-serif;
  white-space: nowrap;
}

.top-nav a.router-link-active {
  color: var(--shell-primary);
}
</style>
