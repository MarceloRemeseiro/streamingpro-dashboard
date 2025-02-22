"use client";

import { useState } from 'react';
import { DatabaseInstance } from '@prisma/client'
import { DatabaseActionsModal } from './DatabaseActionsModal';

interface Props {
  databases: DatabaseInstance[]
  onRefresh?: () => void
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

  return (
    <>
      <table className="w-full">
        <thead className="border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="text-left p-4 text-gray-900 dark:text-white">Nombre</th>
            <th className="text-left p-4 text-gray-900 dark:text-white">Tipo</th>
            <th className="text-left p-4 text-gray-900 dark:text-white">Subdominio</th>
            <th className="text-left p-4 text-gray-900 dark:text-white">Estado</th>
            <th className="text-left p-4 text-gray-900 dark:text-white">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {databases.map(db => (
            <tr key={db.id} className="border-b border-gray-100 dark:border-gray-800">
              <td className="p-4 text-gray-900 dark:text-gray-200">{db.name}</td>
              <td className="p-4 text-gray-900 dark:text-gray-200">{db.dbType}</td>
              <td className="p-4 text-gray-900 dark:text-gray-200">{db.subdomain}</td>
              <td className="p-4 text-gray-900 dark:text-gray-200">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(db.status)}`}>
                  {db.status}
                </span>
              </td>
              <td className="p-4 text-gray-900 dark:text-gray-200">
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
            onRefresh?.()
            setSelectedDb(null)
          }}
        />
      )}
    </>
  )
} 