"use client";

import { useState } from 'react';
import { DatabaseInstance, DatabaseType, InstanceStatus } from '@prisma/client'
import { DatabaseActionsModal } from './DatabaseActionsModal';

interface Props {
  databases: DatabaseInstance[]
  onRefresh?: () => void  // Hacer opcional para mantener compatibilidad
}

export default function DatabaseTable({ databases, onRefresh }: Props) {
  const [selectedDb, setSelectedDb] = useState<DatabaseInstance | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING': return 'bg-green-500';
      case 'STOPPED': return 'bg-red-500';
      case 'ERROR': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  }

  const getTypeIcon = (type: DatabaseType) => {
    // Puedes añadir iconos específicos para cada tipo
    return '🛢️';
  }

  return (
    <>
      <table className="w-full">
        <thead className="border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="text-left p-4">Nombre</th>
            <th className="text-left p-4">Tipo</th>
            <th className="text-left p-4">Subdominio</th>
            <th className="text-left p-4">Estado</th>
            <th className="text-left p-4">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {databases.map(db => (
            <tr key={db.id} className="border-b border-gray-100 dark:border-gray-800">
              <td className="p-4">{db.name}</td>
              <td className="p-4">{db.dbType}</td>
              <td className="p-4">{db.subdomain}</td>
              <td className="p-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(db.status)}`}>
                  {db.status}
                </span>
              </td>
              <td className="p-4">
                <button
                  onClick={() => setSelectedDb(db)}
                  className="text-sm px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                >
                  Gestionar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedDb && (
        <DatabaseActionsModal
          database={selectedDb}
          isOpen={!!selectedDb}
          onClose={() => setSelectedDb(null)}
          onStatusChange={() => {
            // Llamar a onRefresh si existe
            onRefresh?.()
            // Cerrar el modal
            setSelectedDb(null)
          }}
        />
      )}
    </>
  )
} 