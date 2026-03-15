<template>
  <main class="app-page">
    <section class="phone-shell">
      <header class="top-bar detect-top">
        <div>
          <h1 class="detect-title">实时检测</h1>
          <p class="detect-sub">上传一张叶面图片，快速查看虫害分析</p>
        </div>
        <span class="auth-chip" :class="isAuthenticated ? 'auth-chip-login' : 'auth-chip-guest'">
          {{ isAuthenticated ? '已登录' : '游客可用' }}
        </span>
      </header>

      <div class="body-scroll detect-body">
        <section class="card upload-card">
          <div class="row-between upload-head">
            <div>
              <p class="section-title">图片上传</p>
              <p class="eyebrow-text">支持 JPG / PNG，识别后预览区直接切换为框选结果</p>
            </div>
            <!-- <button class="select-btn btn-soft-primary" type="button" @click="openPicker">选取图片</button> -->
          </div>

          <input
            ref="fileInput"
            class="hidden-input"
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            @change="handleFileChange"
          >

          <button class="preview-shell" type="button" @click="openPicker">
            <img v-if="displayPreviewUrl" class="preview-image" :src="displayPreviewUrl" :alt="selectedFileName" />
            <div v-else class="preview-placeholder">
              <Search :size="22" class="icon-subtle" />
              <p class="placeholder-title">点击上传待检测图片</p>
              <p class="placeholder-sub">识别完成后会展示后端返回的框选图片与各类别害虫数量</p>
            </div>
            <span v-if="displayPreviewUrl" class="preview-badge">
              {{ analysis ? '框选结果' : '原始图片' }}
            </span>
          </button>

          <p class="file-name">{{ selectedFileName }}</p>
        </section>

        <section v-if="isAnalyzing" class="card analysis-card">
          <p class="section-title">图片分析</p>
          <p class="body-text">正在分析图片中的虫害特征，请稍候...</p>
        </section>

        <section v-else-if="analysis" class="card analysis-card">
          <div class="row-between analysis-head">
            <div>
              <p class="section-title">{{ analysis.title }}</p>
              <p class="eyebrow-text">识别置信度 {{ analysis.confidence }}%</p>
            </div>
            <span class="status-tag" :class="analysis.kind === 'pest' ? 'status-warm' : 'status-neutral'">
              {{ analysis.kind === 'pest' ? '疑似虫害' : '未见虫害' }}
            </span>
          </div>
          <p class="body-text">{{ analysis.summary }}</p>
        </section>

        <section v-if="analysis" class="card counts-card">
          <div class="row-between counts-head">
            <div>
              <p class="section-title">害虫统计</p>
              <p class="eyebrow-text">按类别汇总识别到的目标数量</p>
            </div>
            <div class="count-total">
              <strong>{{ totalDetectedCount }}</strong>
              <span>总数</span>
            </div>
          </div>

          <div v-if="analysis.pestCounts.length" class="counts-grid">
            <article v-for="item in analysis.pestCounts" :key="item.label" class="count-item">
              <p class="count-label">{{ item.label }}</p>
              <p class="count-value">{{ item.count }}</p>
            </article>
          </div>
          <p v-else class="body-text">当前图片未识别到虫害目标，各类别数量均为 0。</p>
        </section>

        <section v-if="hasDetectedPests" class="card advice-card">
          <div class="row-between advice-head">
            <div>
              <p class="section-title">处置建议</p>
              <p class="eyebrow-text">{{ analysis?.pestName ?? '虫害目标' }} · 严重程度 {{ analysis?.severity ?? '待确认' }}</p>
            </div>
            <span class="badge-warm">建议跟进</span>
          </div>
          <p class="body-text">{{ analysis?.advice ?? '建议尽快安排复核，并结合现场情况执行处置。' }}</p>
        </section>

        <section v-if="hasDetectedPests && isAuthenticated" class="card record-card">
          <p class="section-title">上传识别记录</p>
          <p class="body-text">检测到疑似虫害，是否将本次识别结果上传到巡检记录？</p>
          <div v-if="recordStatus === 'idle'" class="record-actions">
            <button class="btn-soft-primary record-btn" type="button" @click="markUploaded">上传记录</button>
            <button class="btn-soft record-btn" type="button" @click="skipUpload">暂不上传</button>
          </div>
          <p v-else class="record-note">
            {{ recordStatus === 'uploaded' ? '本次识别结果已标记为待上传记录。' : '你已选择暂不上传本次记录。' }}
          </p>
        </section>

        <section v-else-if="hasDetectedPests" class="card record-card">
          <p class="section-title">上传识别记录</p>
          <p class="body-text">登录后可将本次疑似虫害识别结果上传到巡检记录。</p>
          <RouterLink to="/login" class="login-link btn-soft-primary">登录后上传</RouterLink>
        </section>
      </div>

      <BottomNav active="detect" />
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { Search } from 'lucide-vue-next'

import { analyzePestImage } from '../api/detection'
import type { DetectionResult } from '../api/types'
import BottomNav from '../components/BottomNav.vue'
import '../styles/mobile-shell.css'

const AUTH_STORAGE_KEY = 'manage-system-authenticated'

const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref('')
const selectedFileName = ref('尚未选择图片')
const analysis = ref<DetectionResult | null>(null)
const isAnalyzing = ref(false)
const isAuthenticated = ref(localStorage.getItem(AUTH_STORAGE_KEY) === 'true')
const recordStatus = ref<'idle' | 'uploaded' | 'skipped'>('idle')

const totalDetectedCount = computed(() => {
  if (!analysis.value) {
    return 0
  }

  return analysis.value.pestCounts.reduce((sum, item) => sum + item.count, 0)
})

const hasDetectedPests = computed(() => totalDetectedCount.value > 0)

const annotatedImageUrl = computed(() => analysis.value?.annotatedImageUrl || previewUrl.value)
const displayPreviewUrl = computed(() => annotatedImageUrl.value || previewUrl.value)

function openPicker() {
  fileInput.value?.click()
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) {
    return
  }

  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }

  previewUrl.value = URL.createObjectURL(file)
  selectedFileName.value = file.name
  analysis.value = null
  recordStatus.value = 'idle'
  isAnalyzing.value = true

  try {
    analysis.value = await analyzePestImage(file)
    isAuthenticated.value = localStorage.getItem(AUTH_STORAGE_KEY) === 'true'
  } finally {
    isAnalyzing.value = false
  }
}

function markUploaded() {
  recordStatus.value = 'uploaded'
}

function skipUpload() {
  recordStatus.value = 'skipped'
}

onBeforeUnmount(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
</script>

<style scoped>
.detect-top {
  min-height: 80px;
  padding: 14px 20px;
}

.detect-title {
  margin: 0;
  color: var(--shell-text-strong);
  font-size: 20px;
  font-weight: 600;
}

.detect-sub {
  margin: 4px 0 0;
  color: var(--shell-text-muted);
  font-size: 12px;
}

.auth-chip {
  border-radius: 999px;
  padding: 7px 10px;
  font-size: 11px;
  font-weight: 600;
}

.auth-chip-login {
  background: var(--shell-primary-soft);
  color: var(--shell-primary);
}

.auth-chip-guest {
  background: var(--shell-bg-muted);
  color: var(--shell-text-subtle);
}

.detect-body {
  padding: 18px 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.upload-card,
.analysis-card,
.counts-card,
.advice-card,
.record-card {
  padding: 14px;
  gap: 12px;
}

.upload-head,
.analysis-head,
.counts-head,
.advice-head {
  gap: 12px;
}

.select-btn {
  border-radius: 10px;
  padding: 10px 14px;
}

.hidden-input {
  display: none;
}

.preview-shell {
  position: relative;
  width: 100%;
  min-height: 220px;
  border: 1px dashed color-mix(in oklab, var(--shell-primary-soft) 54%, var(--shell-primary));
  border-radius: 14px;
  background: color-mix(in oklab, var(--shell-primary-soft) 35%, white);
  padding: 0;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}

.preview-placeholder {
  min-height: 220px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.placeholder-title {
  margin: 0;
  color: var(--shell-text-strong);
  font-size: 15px;
  font-weight: 600;
}

.placeholder-sub,
.file-name,
.record-note {
  margin: 0;
  color: var(--shell-text-muted);
  font-size: 12px;
  line-height: 1.45;
}

.preview-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  border-radius: 999px;
  padding: 6px 10px;
  background: color-mix(in oklab, var(--shell-text-main) 72%, transparent);
  color: white;
  font-size: 11px;
  font-weight: 600;
}

.body-text {
  margin: 0;
  color: var(--shell-text-body);
  font-size: 13px;
  line-height: 1.5;
}

.count-total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.count-total strong {
  color: var(--shell-text-strong);
  font-size: 22px;
  line-height: 1;
}

.count-total span {
  color: var(--shell-text-muted);
  font-size: 11px;
}

.counts-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.count-item {
  border: 1px solid var(--shell-line);
  border-radius: 12px;
  background: color-mix(in oklab, var(--shell-bg) 82%, white);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.count-label {
  margin: 0;
  color: var(--shell-text-muted);
  font-size: 12px;
  font-weight: 500;
}

.count-value {
  margin: 0;
  color: var(--shell-text-strong);
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
}

.record-actions {
  display: flex;
  gap: 8px;
}

.record-btn,
.login-link {
  flex: 1;
  height: 42px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  display: grid;
  place-items: center;
  text-decoration: none;
}
</style>
