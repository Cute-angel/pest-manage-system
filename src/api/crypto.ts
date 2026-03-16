const encoder = new TextEncoder()

export const sha256Hex = async (value: string) => {
  const buffer = encoder.encode(value)
  const digest = await crypto.subtle.digest('SHA-256', buffer)

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}
