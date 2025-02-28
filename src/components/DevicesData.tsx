'use client'

import { useEffect, useState } from 'react'
import DeviceTable from '@/components/DeviceTable'
import type { DeviceWithConfig } from '@/lib/types'

export default function DevicesData() {
  const [devices, setDevices] = useState<DeviceWithConfig[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDevices() {
      try {
        const response = await fetch('/api/devices')
        if (!response.ok) {
          throw new Error('Error al cargar dispositivos')
        }
        const data = await response.json()
        setDevices(data)
      } catch (error) {
        console.error('Error cargando dispositivos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDevices()
  }, [])

  if (loading) {
    return <div className="text-center py-10">Cargando dispositivos...</div>
  }

  return (
    <>
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
    </>
  )
} 