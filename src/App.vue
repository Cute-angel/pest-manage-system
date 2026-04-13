<template>
  <div class="shell" data-theme="verdant-dawn">
    <router-view  class="p-0"  v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script setup lang="ts">
//import AppNav from './components/AppNav.vue'
</script>

<style scoped>
.shell {
  min-height: 100vh;
  background: transparent;
}
</style>
