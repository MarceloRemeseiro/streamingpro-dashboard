'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { DatabaseInstance } from '@prisma/client'
import { useState } from 'react'

interface Props {
  database: DatabaseInstance
  isOpen: boolean
  onClose: () => void
  onStatusChange: () => void
}

export function DatabaseActionsModal({ database, isOpen, onClose, onStatusChange }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleToggleStatus = async () => {
    setIsLoading(true)
    try {
      const action = database.status === 'RUNNING' ? 'stop' : 'start'
      const response = await fetch(
        `/api/databases/${database.id}/actions?action=${action}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }
      )
      
      if (!response.ok) throw new Error('Error en la acción')
      
      onStatusChange()
      onClose()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al realizar la acción')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar esta base de datos?')) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/databases/${database.id}`, { 
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete database')
      }
      
      onClose()
      onStatusChange()
    } catch (error) {
      console.error('Error deleting database:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch(
        `/api/databases/${database.id}/export`,
        { method: 'POST' }
      )
      
      if (!response.ok) throw new Error('Error en la exportación')
      
      // Obtener el blob de la respuesta
      const blob = await response.blob()
      
      // Determinar la extensión del archivo según el tipo de BD
      const extension = (() => {
        switch (database.dbType) {
          case 'POSTGRES': return 'sql'
          case 'MYSQL': return 'sql'
          case 'MONGODB': return 'json'
          case 'REDIS': return 'rdb'
          default: return 'backup'
        }
      })()
      
      // Crear URL para descarga
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${database.name}-backup.${extension}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
    } catch (error) {
      console.error('Error:', error)
      alert('Error al exportar la base de datos')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-[500px]">
          <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Gestionar Base de Datos
          </Dialog.Title>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Conexión Standard:</h3>
              <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded text-sm text-gray-900 dark:text-gray-100 overflow-auto">
                {database.connectionUrl}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Conexión Prisma:</h3>
              <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded text-sm text-gray-900 dark:text-gray-100 overflow-auto">
                {`datasource db {
  provider = "${database.dbType.toLowerCase()}"
  url = "${database.connectionUrl}"
}`}
              </pre>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleToggleStatus}
                disabled={isLoading}
                className={`px-4 py-2 rounded-md ${
                  database.status === 'RUNNING'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                } text-white`}
              >
                {database.status === 'RUNNING' ? 'Detener' : 'Iniciar'}
              </button>
              
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 rounded-md border border-red-500 text-red-500 hover:bg-red-50"
              >
                Eliminar
              </button>

              {['POSTGRES', 'MYSQL', 'MONGODB', 'REDIS'].includes(database.dbType) && (
                <button
                  onClick={handleExport}
                  disabled={isExporting || database.status !== 'RUNNING'}
                  className="px-4 py-2 rounded-md bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
                >
                  {isExporting ? 'Exportando...' : 'Exportar datos'}
                </button>
              )}
            </div>
          </div>

          <Dialog.Close className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
            ✕
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
} 