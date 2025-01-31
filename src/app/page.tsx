"use client";

import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'

const DevicesView = dynamic(() => import('@/components/DevicesView'), {
  loading: () => <div className="p-8">Cargando vista de dispositivos...</div>
})

const UrlsView = dynamic(() => import('@/components/UrlsView'), {
  loading: () => <div className="p-8">Cargando vista de URLs...</div>
})

const CentralView = dynamic(() => import('@/components/CentralView'), {
  loading: () => <div className="p-8">Cargando central de emisión...</div>
})

const DatabasesView = dynamic(() => import('@/components/DatabasesView'), {
  loading: () => <div className="p-8">Cargando bases de datos...</div>
})

export default function HomePage() {
  const searchParams = useSearchParams()
  const view = searchParams.get('view')

  if (view === 'devices') {
    return <DevicesView />
  }

  if (view === 'urls') {
    return <UrlsView />
  }

  if (view === 'central') {
    return <CentralView />
  }

  if (view === 'databases') {
    return <DatabasesView />
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
        Bienvenido a StreamingPro
      </h1>
      <p className="text-gray-600 dark:text-gray-300">
        Selecciona una opción del menú para comenzar.
      </p>
    </div>
  )
}
