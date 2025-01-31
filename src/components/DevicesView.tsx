"use client";

import { Suspense } from 'react'
import useSWR from 'swr'
import DeviceTable from '@/components/DeviceTable'
import type { Device, DeviceType } from '.prisma/client'
import type { DeviceWithConfig } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then(res => res.json())

function DevicesContent() {
  const { data: devices = [], error, isLoading } = useSWR<DeviceWithConfig[]>('/api/devices', fetcher)

  if (error) return <div className="p-8">Error al cargar los dispositivos</div>
  if (isLoading) return <div className="p-8">Cargando...</div>

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Dispositivos</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Total Dispositivos</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{devices.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Raspberry Pi</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {devices.filter((d) => d.type === 'RASPBERRY').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Linux PC</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {devices.filter((d) => d.type === 'LINUX_PC').length}
          </p>
        </div>
      </div>

      {/* Device Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <DeviceTable devices={devices} />
      </div>
    </div>
  )
}

export default function DevicesView() {
  return (
    <Suspense fallback={<div className="p-8">Cargando...</div>}>
      <DevicesContent />
    </Suspense>
  )
} 