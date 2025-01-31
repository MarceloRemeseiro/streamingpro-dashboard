import { z } from 'zod'

export const deviceRegistrationSchema = z.object({
  deviceId: z.string(),
  type: z.enum(['RASPBERRY', 'LINUX_PC']),
  arch: z.string(),
  os: z.string(),
  localIp: z.string(),
  publicIp: z.string(),
  capabilities: z.object({
    gpu: z.string(),
    resolution: z.string()
  })
})

export type DeviceRegistration = z.infer<typeof deviceRegistrationSchema>

export const deviceConfigSchema = z.object({
  clientServer: z.string().url(),
  srtUrl: z.string().url().optional(),
  updatedAt: z.date()
})

export type DeviceConfig = z.infer<typeof deviceConfigSchema> 