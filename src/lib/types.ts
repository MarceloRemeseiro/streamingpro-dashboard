export type DeviceType = 'RASPBERRY' | 'LINUX_PC'

export interface DeviceCapabilities {
  video?: string[];
  audio?: string[];
  network?: string[];
  storage?: {
    total: number;
    free: number;
  };
  memory?: {
    total: number;
    free: number;
  };
}

export interface Device {
  id: string
  deviceId: string
  type: DeviceType
  arch: string
  os: string
  localIp: string
  publicIp: string
  capabilities: DeviceCapabilities
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