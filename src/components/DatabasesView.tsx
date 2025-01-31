"use client";

import { Suspense, useState } from 'react'
import useSWR from 'swr'
import DatabaseTable from '@/components/DatabaseTable'
import type { DatabaseInstance } from '@prisma/client'
import CreateDatabaseModal from '@/components/CreateDatabaseModal'
import {DatabaseActionsModal} from '@/components/DatabaseActionsModal'

const fetcher = (url: string) => fetch(url).then(res => res.json())

function DatabasesContent() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { data: databases = [], error, isLoading, mutate } = useSWR<DatabaseInstance[]>('/api/databases', fetcher)
  const [selectedDatabase, setSelectedDatabase] = useState<DatabaseInstance | null>(null)

  if (error) return <div className="p-8 text-gray-900 dark:text-white">Error al cargar las bases de datos</div>
  if (isLoading) return <div className="p-8">Cargando...</div>

  const refreshDatabases = async () => {
    const res = await fetch('/api/databases');
    const data = await res.json();
    mutate(data);
    setSelectedDatabase(null);
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bases de datos</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Nueva Base de Datos
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <DatabaseTable 
          databases={databases} 
          onRefresh={() => mutate()}
        />
      </div>
      
      {showCreateModal && (
        <CreateDatabaseModal
          onClose={() => setShowCreateModal(false)}
          onCreate={() => mutate()}
        />
      )}

      {selectedDatabase && (
        <DatabaseActionsModal
          database={selectedDatabase}
          isOpen={!!selectedDatabase}
          onClose={() => setSelectedDatabase(null)}
          onStatusChange={() => {
            refreshDatabases()
          }}
        />
      )}
    </div>
  )
}

export default function DatabasesView() {
  return (
    <Suspense fallback={<div className="p-8">Cargando...</div>}>
      <DatabasesContent />
    </Suspense>
  )
} 