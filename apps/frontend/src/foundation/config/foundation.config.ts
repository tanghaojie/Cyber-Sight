function configuredPort(value: string | undefined, fallback: number): number {
  const parsed = Number(value?.trim())
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 65535 ? parsed : fallback
}

export const foundationConfig = Object.freeze({
  frontendPort: configuredPort(import.meta.env.VITE_PORT, 3333),
  backendPort: configuredPort(import.meta.env.VITE_BACKEND_PORT, 3000),
})
