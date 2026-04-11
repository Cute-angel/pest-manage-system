<template>
  <Teleport to="body">
    <Transition name="browser-sheet">
      <div
        v-if="modelValue"
        class="browser-sheet-mask"
        @click="emit('update:modelValue', false)"
      >
        <section class="browser-sheet-panel" @click.stop>
          <header class="browser-sheet-header">
            <button
              class="browser-sheet-icon-btn browser-sheet-icon-btn-muted"
              type="button"
              aria-label="关闭"
              @click="emit('update:modelValue', false)"
            >
              <X :size="18" />
            </button>

            <div class="browser-sheet-title-wrap">
              <p class="browser-sheet-title">{{ title }}</p>
              <div class="browser-sheet-progress-track">
                <div
                  class="browser-sheet-progress-bar"
                  :style="{ width: normalizedProgress + '%' }"
                />
              </div>
            </div>

            <button
              class="browser-sheet-icon-btn browser-sheet-icon-btn-muted"
              type="button"
              aria-label="菜单"
              @click="emit('menu')"
            >
              <Ellipsis :size="18" />
            </button>
          </header>

          <div class="browser-sheet-body">
            <slot>
              <iframe
                v-if="src"
                :src="src"
                class="browser-sheet-frame"
                title="网页内容预览"
              />
              <div v-else class="browser-sheet-placeholder">
                <p class="browser-sheet-placeholder-title">{{ title }}</p>
                <p class="browser-sheet-placeholder-text">这里可以放网页预览或自定义内容。</p>
              </div>
            </slot>
          </div>

          <footer class="browser-sheet-footer">
            <button
              class="browser-sheet-icon-btn browser-sheet-icon-btn-soft"
              type="button"
              aria-label="返回"
              @click="emit('back')"
            >
              <ChevronLeft :size="18" />
            </button>

            <div class="browser-sheet-footer-actions">
              <button
                class="browser-sheet-icon-btn browser-sheet-icon-btn-soft"
                type="button"
                aria-label="分享"
                @click="emit('share')"
              >
                <Share :size="18" />
              </button>

              <button
                class="browser-sheet-icon-btn browser-sheet-icon-btn-soft"
                type="button"
                aria-label="关闭"
                @click="emit('update:modelValue', false)"
              >
                <X :size="18" />
              </button>
            </div>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'
import { ChevronLeft, Ellipsis, Share, X } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    src?: string
    progress?: number
    lockScroll?: boolean
  }>(),
  {
    title: '网页预览',
    src: '',
    progress: 26,
    lockScroll: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  back: []
  share: []
  menu: []
}>()

const normalizedProgress = computed(() => {
  if (props.progress < 0) {
    return 0
  }

  if (props.progress > 100) {
    return 100
  }

  return props.progress
})

const setBodyOverflow = (locked: boolean) => {
  if (!props.lockScroll || typeof document === 'undefined') {
    return
  }

  document.body.style.overflow = locked ? 'hidden' : ''
}

watch(
  () => props.modelValue,
  (visible) => {
    setBodyOverflow(visible)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  setBodyOverflow(false)
})
</script>

<style scoped>
.browser-sheet-mask {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background:
    radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.08), transparent 30%),
    rgba(10, 14, 19, 0.82);
  backdrop-filter: blur(10px);
}

.browser-sheet-panel {
  width: min(100%, 430px);
  height: min(96vh, 860px);
  background: #f6f6f7;
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
  box-shadow: 0 -10px 34px rgba(0, 0, 0, 0.26);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.browser-sheet-header,
.browser-sheet-footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 18px 14px;
}

.browser-sheet-title-wrap {
  width: min(190px, 58%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.browser-sheet-title {
  margin: 0;
  max-width: 100%;
  color: #202124;
  font-size: 15px;
  line-height: 1.2;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.browser-sheet-progress-track {
  width: 100%;
  height: 4px;
  border-radius: 999px;
  background: rgba(32, 33, 36, 0.14);
  overflow: hidden;
}

.browser-sheet-progress-bar {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #69a1ff 0%, #375dfb 100%);
}

.browser-sheet-body {
  flex: 1;
  min-height: 0;
  background: #ffffff;
}

.browser-sheet-frame {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
  background: #ffffff;
}

.browser-sheet-placeholder {
  height: 100%;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #60646c;
  text-align: center;
}

.browser-sheet-placeholder-title {
  margin: 0;
  color: #202124;
  font-size: 18px;
  font-weight: 700;
}

.browser-sheet-placeholder-text {
  margin: 0;
  font-size: 14px;
}

.browser-sheet-footer {
  padding-top: 12px;
  padding-bottom: calc(14px + env(safe-area-inset-bottom, 0px));
}

.browser-sheet-footer-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.browser-sheet-icon-btn {
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    transform 180ms ease,
    background-color 180ms ease,
    opacity 180ms ease;
}

.browser-sheet-icon-btn:hover {
  transform: translateY(-1px);
}

.browser-sheet-icon-btn-muted {
  background: rgba(0, 0, 0, 0.12);
  color: #ffffff;
}

.browser-sheet-icon-btn-soft {
  background: rgba(17, 24, 39, 0.06);
  color: #22252b;
  box-shadow: 0 6px 18px rgba(17, 24, 39, 0.08);
}

.browser-sheet-enter-active,
.browser-sheet-leave-active {
  transition: opacity 240ms ease;
}

.browser-sheet-enter-active .browser-sheet-panel,
.browser-sheet-leave-active .browser-sheet-panel {
  transition:
    transform 320ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 320ms ease;
}

.browser-sheet-enter-from,
.browser-sheet-leave-to {
  opacity: 0;
}

.browser-sheet-enter-from .browser-sheet-panel,
.browser-sheet-leave-to .browser-sheet-panel {
  transform: translateY(54px) scale(0.985);
  opacity: 0.92;
}
</style>
