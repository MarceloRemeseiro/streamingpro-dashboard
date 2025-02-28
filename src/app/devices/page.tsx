import DevicesData from "@/components/DevicesData"

// Marcar esta página como dinámica para evitar la generación estática
export const dynamic = 'force-dynamic'

export default function DevicesPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Dispositivos</h1>
      <DevicesData />
    </div>
  )
} 