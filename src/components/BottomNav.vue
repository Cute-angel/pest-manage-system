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
    <RouterLink to="/detail" class="tab" :class="{ active: active === 'alert' }">
      <TriangleAlert :size="17" />
      <span>预警</span>
    </RouterLink>
    <RouterLink to="/me" class="tab" :class="{ active: active === 'me' }">
      <User :size="17" />
      <span>我的</span>
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
import { Clock3, House, TriangleAlert, User } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    active?: 'home' | 'timeline' | 'alert' | 'me'
  }>(),
  {
    active: 'home',
  },
)
</script>
