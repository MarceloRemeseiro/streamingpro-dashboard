import React, { useState } from 'react';
import { StreamUrl } from '../types/StreamUrl';

interface UrlModalProps {
  url: StreamUrl | null;
  onClose: () => void;
  onSave: (data: Omit<StreamUrl, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

const domain = process.env.NEXT_PUBLIC_CENTRAL_SERVER;
export function UrlModal({ url, onClose, onSave }: UrlModalProps) {
  const [formData, setFormData] = useState({
    name: url?.name || '',
    subdomain: url?.url ? url.url.replace('https://', '').replace(`.${domain}`, '') : '',
    startDate: url?.startDate ? new Date(url.startDate).toISOString().split('T')[0] : '',
    endDate: url?.endDate ? new Date(url.endDate).toISOString().split('T')[0] : '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      name: formData.name,
      url: `https://${formData.subdomain}.${domain}`,
      startDate: new Date(formData.startDate + 'T00:00:00Z').toISOString(),
      endDate: new Date(formData.endDate + 'T23:59:59Z').toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
          {url ? 'Editar URL' : 'Nueva URL'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       text-gray-900 dark:text-white bg-white dark:bg-gray-700
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
              URL
            </label>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 
                           dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                https://
              </span>
              <input
                type="text"
                value={formData.subdomain}
                onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                className="flex-1 min-w-0 px-3 py-2 border border-gray-300 dark:border-gray-600
                         text-gray-900 dark:text-white bg-white dark:bg-gray-700
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                pattern="[a-zA-Z0-9-]+"
                title="Solo letras, números y guiones"
              />
              <span className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-gray-300 
                           dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                .{domain}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                         text-gray-900 dark:text-white bg-white dark:bg-gray-700
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
                Fecha de Fin
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                         text-gray-900 dark:text-white bg-white dark:bg-gray-700
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-900 dark:text-gray-300 hover:bg-gray-100 
                       dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                       transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 