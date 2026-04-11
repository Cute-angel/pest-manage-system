<template>
  <header class="top-nav">
    <RouterLink to="/home">首页</RouterLink>
    <RouterLink to="/login">登录</RouterLink>
    <RouterLink to="/detail">详情</RouterLink>
    <RouterLink to="/recommendation-detail">建议</RouterLink>
    <RouterLink to="/timeline">时间线</RouterLink>
    <RouterLink to="/me">我的</RouterLink>
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
