<template>
  <div class="shell" data-theme="verdant-dawn">
    <router-view class="p-0" v-slot="{ Component, route }">
      <Transition
        :name="getRouteTransitionName(route.meta.transition)"
        :mode="getRouteTransitionMode(route.meta.transition)"
      >
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </Transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
function getRouteTransitionName(value: unknown) {
  return typeof value === 'string' ? value : 'route-fade'
}

function getRouteTransitionMode(value: unknown) {
  return value === 'route-fade' ? undefined : 'out-in'
}
</script>

<style scoped>
.shell {
  min-height: 100vh;
  background: var(--color-base-200);
  overflow: hidden;
}

.route-fade-enter-active,
.route-fade-leave-active,
.route-slide-left-enter-active,
.route-slide-left-leave-active,
.route-slide-right-enter-active,
.route-slide-right-leave-active {
  transition: opacity 220ms ease, transform 220ms ease;
}

.route-fade-enter-from,
.route-fade-leave-to {
  opacity: 0;
}

.route-slide-left-enter-from,
.route-slide-right-leave-to {
  opacity: 0;
  transform: translate3d(28px, 0, 0);
}

.route-slide-left-leave-to,
.route-slide-right-enter-from {
  opacity: 0;
  transform: translate3d(-28px, 0, 0);
}

</style>
