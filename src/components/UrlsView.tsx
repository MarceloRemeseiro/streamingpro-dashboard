"use client";

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { LuPen, LuTrash2, LuPlus } from 'react-icons/lu';

interface StreamUrl {
  id: string;
  name: string;
  url: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

function calculateDuration(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  // Ajustar meses y años si los días son negativos
  if (days < 0) {
    months--;
    const lastMonth = new Date(end.getFullYear(), end.getMonth() - 1, 0);
    days += lastMonth.getDate();
  }

  // Ajustar años si los meses son negativos
  if (months < 0) {
    years--;
    months += 12;
  }

  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'año' : 'años'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mes' : 'meses'}`);
  if (days > 0) parts.push(`${days} ${days === 1 ? 'día' : 'días'}`);

  return parts.length > 0 ? parts.join(', ') : '0 días';
}

function UrlsContent() {
  const { data: urls = [], error, isLoading } = useSWR<StreamUrl[]>('/api/urls', fetcher);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUrl, setEditingUrl] = useState<StreamUrl | null>(null);

  if (error) return <div className="p-8">Error al cargar las URLs</div>;
  if (isLoading) return <div className="p-8">Cargando...</div>;

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta URL?')) {
      await fetch(`/api/urls/${id}`, { method: 'DELETE' });
      mutate('/api/urls');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">URLs</h1>
        <button
          onClick={() => {
            setEditingUrl(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <LuPlus className="w-5 h-5" />
          <span>Nueva URL</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nombre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fecha de Inicio
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fecha de Fin
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Duración
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  URL
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {urls.map((url) => (
                <tr key={url.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                    {url.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(url.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(url.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {calculateDuration(url.startDate, url.endDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <a href={url.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                      {url.url}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingUrl(url);
                          setIsModalOpen(true);
                        }}
                        className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <LuPen className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(url.id)}
                        className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <LuTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <UrlModal
          url={editingUrl}
          onClose={() => setIsModalOpen(false)}
          onSave={async (data) => {
            const endpoint = editingUrl ? `/api/urls/${editingUrl.id}` : '/api/urls';
            const method = editingUrl ? 'PUT' : 'POST';
            
            await fetch(endpoint, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
            
            mutate('/api/urls');
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

interface UrlModalProps {
  url: StreamUrl | null;
  onClose: () => void;
  onSave: (data: Omit<StreamUrl, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

function UrlModal({ url, onClose, onSave }: UrlModalProps) {
  const [formData, setFormData] = useState({
    name: url?.name || '',
    subdomain: url?.url ? url.url.replace('https://', '').replace('.streamingpro.es', '') : '',
    startDate: url?.startDate ? new Date(url.startDate).toISOString().split('T')[0] : '',
    endDate: url?.endDate ? new Date(url.endDate).toISOString().split('T')[0] : '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      name: formData.name,
      url: `https://${formData.subdomain}.streamingpro.es`,
      startDate: new Date(formData.startDate + 'T00:00:00Z').toISOString(),
      endDate: new Date(formData.endDate + 'T23:59:59Z').toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {url ? 'Editar URL' : 'Nueva URL'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-2 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-md">
                https://
              </span>
              <input
                type="text"
                value={formData.subdomain}
                onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                required
                pattern="[a-zA-Z0-9-]+"
                title="Solo letras, números y guiones"
              />
              <span className="text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md">
                .streamingpro.es
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha de Inicio
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha de Fin
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-900 dark:text-white"
              required
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UrlsView() {
  return (
    <div>
      <UrlsContent />
    </div>
  );
} 