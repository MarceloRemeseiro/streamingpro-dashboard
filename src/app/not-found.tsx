import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404 - Página no encontrada</h1>
      <p className="mt-4">Lo sentimos, la página que buscas no existe.</p>
      <Link href="/" className="mt-4 text-blue-500 hover:text-blue-700">
        Volver al inicio
      </Link>
    </div>
  )
} 