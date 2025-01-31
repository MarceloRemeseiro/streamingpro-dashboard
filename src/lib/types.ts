export type DeviceType = 'RASPBERRY' | 'LINUX_PC'

export interface Device {
  id: string
  deviceId: string
  type: DeviceType
  arch: string
  os: string
  localIp: string
  publicIp: string
  capabilities: any
  lastSeen: Date
  createdAt: Date
}

export interface DeviceConfig {
  id: string
  clientServer: string
  srtUrl: string | null
  updatedAt: Date
}

export interface DeviceWithConfig extends Device {
  configs: DeviceConfig[]
} 