<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue'

import { weatherApiHost, weatherApiKey, weatherDefaultLocation, weatherJwtToken } from '../api'

interface WeatherNowData {
  obsTime: string
  temp: string
  feelsLike: string
  icon: string
  text: string
  wind360: string
  windDir: string
  windScale: string
  windSpeed: string
  humidity: string
  precip: string
  pressure: string
  vis: string
  cloud?: string
  dew?: string
}

interface WeatherNowResponse {
  code: string
  updateTime: string
  fxLink?: string
  now?: WeatherNowData
}

const props = withDefaults(
  defineProps<{
    size?: number
    location?: string
    lang?: string
    unit?: 'm' | 'i'
    apiKey?: string
    jwtToken?: string
    showText?: boolean
  }>(),
  {
    size: 16,
    location: '',
    lang: 'zh',
    unit: 'm',
    apiKey: '',
    jwtToken: '',
    showText: true,
  },
)

const weather = ref<WeatherNowData | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')

const resolvedLocation = computed(() => props.location.trim() || weatherDefaultLocation)
const resolvedApiKey = computed(() => props.apiKey.trim() || weatherApiKey)
const resolvedJwtToken = computed(() => props.jwtToken.trim() || weatherJwtToken)
const hasAuthConfig = computed(() => Boolean(resolvedApiKey.value || resolvedJwtToken.value))
const iconClass = computed(() => `qi-${weather.value?.icon || '999'}`)
const temperatureText = computed(() => {
  if (!weather.value?.temp) {
    return '--'
  }

  const unitSuffix = props.unit === 'i' ? '°F' : '°C'
  return `${weather.value.temp}${unitSuffix}`
})
const weatherLabel = computed(() => weather.value?.text || (errorMessage.value ? '天气获取失败' : '天气待同步'))
const accessibleLabel = computed(() => {
  if (weather.value) {
    return `${weather.value.text}，${temperatureText.value}`
  }

  return weatherLabel.value
})

const weatherHttp = axios.create({
  baseURL: weatherApiHost,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const loadWeather = async () => {
  if (!resolvedLocation.value || !hasAuthConfig.value) {
    weather.value = null
    errorMessage.value = hasAuthConfig.value ? '缺少地区配置' : '缺少天气接口认证配置'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const headers: Record<string, string> = {}

    if (resolvedJwtToken.value) {
      headers.Authorization = `Bearer ${resolvedJwtToken.value}`
    } else if (resolvedApiKey.value) {
      headers['X-QW-Api-Key'] = resolvedApiKey.value
    }

    const response = await weatherHttp.get<WeatherNowResponse>('/v7/weather/now', {
      params: {
        location: resolvedLocation.value,
        lang: props.lang,
        unit: props.unit,
      },
      headers,
    })

    if (response.data.code !== '200' || !response.data.now) {
      throw new Error(`天气接口返回异常: ${response.data.code || 'unknown'}`)
    }

    weather.value = response.data.now
  } catch (error) {
    weather.value = null
    errorMessage.value = error instanceof Error ? error.message : '天气获取失败'
  } finally {
    isLoading.value = false
  }
}

watch(
  () => [props.location, props.lang, props.unit, props.apiKey, props.jwtToken],
  () => {
    void loadWeather()
  },
)

onMounted(() => {
  void loadWeather()
})
</script>

<template>
  <div
    class="weather-status"
    :class="{ 'is-loading': isLoading, 'is-error': Boolean(errorMessage) }"
    :aria-label="accessibleLabel"
    :title="accessibleLabel"
  >
    <i class="weather-icon" :class="iconClass" :style="{ fontSize: `${size}px` }" aria-hidden="true"></i>
    <span class="weather-text">{{ temperatureText }}</span>
    <span v-if="showText" class="weather-desc">{{ weatherLabel }}</span>
  </div>
</template>

<style scoped>
.weather-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 20px;
  color: var(--shell-text-body);
}

.weather-icon {
  color: var(--shell-icon);
  line-height: 1;
}

.weather-text,
.weather-desc {
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
}

.weather-desc {
  color: var(--shell-text-muted, var(--shell-text-body));
}

.is-loading,
.is-error {
  opacity: 0.78;
}
</style>
