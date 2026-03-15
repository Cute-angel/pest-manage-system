<template>
  <nav class="bottom-nav" aria-label="Bottom navigation">
    <RouterLink to="/home" class="tab" :class="{ active: active === 'home' }">
      <House :size="17" />
      <span>首页</span>
    </RouterLink>
    <RouterLink to="/timeline" class="tab" :class="{ active: active === 'timeline' }">
      <Clock3 :size="17" />
      <span>时间线</span>
    </RouterLink>
    <RouterLink to="/detect" class="tab" :class="{ active: active === 'detect' }">
      <Search :size="17" />
      <span>检测</span>
    </RouterLink>
    <RouterLink to="/me" class="tab" :class="{ active: active === 'me' }">
      <User :size="17" />
      <span>我的</span>
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
import { Clock3, House, Search, User } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    active?: 'home' | 'timeline' | 'detect' | 'me'
  }>(),
  {
    active: 'home',
  },
)
</script>
