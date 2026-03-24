const DEFAULT_QWEATHER_API_HOST = 'https://pe4wcuwmfc.re.qweatherapi.com'
const DEFAULT_QWEATHER_LOCATION = '101280101'

const normalizeApiHost = (value?: string) => {
  const trimmed = value?.trim()

  if (!trimmed) {
    return DEFAULT_QWEATHER_API_HOST
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  return `https://${trimmed}`
}

export const weatherApiHost = normalizeApiHost(import.meta.env.VITE_QWEATHER_API_HOST)
export const weatherDefaultLocation = import.meta.env.VITE_QWEATHER_LOCATION?.trim() || DEFAULT_QWEATHER_LOCATION
export const weatherApiKey = import.meta.env.VITE_QWEATHER_API_KEY?.trim() || ''
export const weatherJwtToken = import.meta.env.VITE_QWEATHER_JWT_TOKEN?.trim() || ''

