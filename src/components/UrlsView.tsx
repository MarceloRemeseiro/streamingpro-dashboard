"use client";

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { LuPen, LuTrash2, LuPlus } from 'react-icons/lu';
import { UrlModal } from './UrlModal';
import type { StreamUrl } from '../types/StreamUrl';

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

  if (error) return <div className="p-8 text-gray-900 dark:text-white">Error al cargar las URLs</div>;
  if (isLoading) return <div className="p-8 text-gray-900 dark:text-white">Cargando...</div>;

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta URL?')) {
      await fetch(`/api/urls/${id}`, { method: 'DELETE' });
      mutate('/api/urls');
    }
  };

  const handleSave = async (data: Omit<StreamUrl, 'id' | 'createdAt' | 'updatedAt'>) => {
    const endpoint = editingUrl ? `/api/urls/${editingUrl.id}` : '/api/urls';
    const method = editingUrl ? 'PUT' : 'POST';
    
    await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    mutate('/api/urls');
    setIsModalOpen(false);
    setEditingUrl(null);
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
          onClose={() => {
            setIsModalOpen(false);
            setEditingUrl(null);
          }}
          onSave={handleSave}
        />
      )}
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