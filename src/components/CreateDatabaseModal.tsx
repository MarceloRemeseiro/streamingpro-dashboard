"use client";

import { useState } from "react";
import { DatabaseType } from "@prisma/client";

interface FormData {
  name: string;
  subdomain: string;
  dbType: DatabaseType;
  username: string;
  password: string;
  dbName: string;
}

type ImportType = 'NONE' | 'FILE' | 'EXTERNAL';

export default function CreateDatabaseModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: () => void;
}) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    subdomain: "",
    dbType: DatabaseType.POSTGRES,
    username: "admin",
    password: "",
    dbName: "defaultdb",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importType, setImportType] = useState<ImportType>('NONE');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [externalMode, setExternalMode] = useState(false);
  const [externalDb, setExternalDb] = useState({
    host: '',
    port: '',
    username: '',
    password: '',
    dbName: ''
  });

  const databaseTypes: DatabaseType[] = Object.values(DatabaseType) as DatabaseType[];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Crear la base de datos
      const response = await fetch("/api/databases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // 2. Si es modo externo, exportar e importar
      if (importType === 'EXTERNAL') {
        // Exportar de la DB externa
        const exportResponse = await fetch("/api/databases/external-export", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dbType: formData.dbType,
            ...externalDb
          })
        });

        if (!exportResponse.ok) throw new Error("Error exportando datos externos");

        // Convertir la respuesta a FormData para importar
        const blob = await exportResponse.blob();
        const importFormData = new FormData();
        importFormData.append('file', blob, `external-backup.${formData.dbType === 'POSTGRES' ? 'sql' : 'archive'}`);

        // Importar a la nueva DB
        const importResponse = await fetch(`/api/databases/${data.id}/import`, {
          method: 'POST',
          body: importFormData
        });

        if (!importResponse.ok) {
          const importError = await importResponse.json();
          throw new Error(importError.error);
        }
      } else if (importType === 'FILE' && importFile) {
        // Crear FormData para el archivo
        const importFormData = new FormData();
        importFormData.append('file', importFile);

        // Importar a la nueva DB
        const importResponse = await fetch(`/api/databases/${data.id}/import`, {
          method: 'POST',
          body: importFormData
        });

        if (!importResponse.ok) {
          const importError = await importResponse.json();
          throw new Error(importError.error);
        }
      }

      onCreate();
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Nueva Base de Datos</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">
              Tipo de base de datos
            </label>
            <select
              value={formData.dbType}
              onChange={(e) => setFormData({...formData, dbType: e.target.value as DatabaseType})}
              className="w-full p-2 border border-gray-300 rounded bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            >
              {databaseTypes.map((type) => (
                <option key={type} value={type} className="text-gray-900 dark:text-gray-200">
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">Subdominio</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formData.subdomain}
                onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="mi-db"
                required
              />
              <span className="whitespace-nowrap text-gray-900 dark:text-gray-200">.streamingpro.es</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">Usuario</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">Contraseña</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">
              Nombre de la base de datos
            </label>
            <input
              type="text"
              value={formData.dbName}
              onChange={(e) => setFormData({ ...formData, dbName: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-2 border border-gray-200 dark:border-gray-600 rounded p-4">
            <h3 className="font-medium text-gray-700 dark:text-gray-100 mb-2">Tipo de importación</h3>
            
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={importType === 'NONE'}
                onChange={() => setImportType('NONE')}
                name="importType"
              />
              <span className="text-gray-900 dark:text-gray-100">Base de datos nueva</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={importType === 'FILE'}
                onChange={() => setImportType('FILE')}
                name="importType"
              />
              <span className="text-gray-900 dark:text-gray-100">Importar base de datos desde archivo</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={importType === 'EXTERNAL'}
                onChange={() => setImportType('EXTERNAL')}
                name="importType"
              />
              <span className="text-gray-900 dark:text-gray-100">Importar base de datos externa</span>
            </label>
          </div>

          {importType === 'FILE' && (
            <div className="mb-4">
              <input
                type="file"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                accept={(() => {
                  switch (formData.dbType) {
                    case 'POSTGRES':
                      return '.sql';
                    case 'MONGODB':
                      return '.archive,.json';
                    default:
                      return '';
                  }
                })()}
              />
            </div>
          )}

          {importType === 'EXTERNAL' && (
            <div className="space-y-4 border border-gray-200 dark:border-gray-600 rounded p-4">
              <h3 className="font-medium text-gray-700 dark:text-gray-100 mb-2">Datos de conexión externa</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">
                  Host
                </label>
                <input
                  type="text"
                  placeholder="ejemplo.com"
                  value={externalDb.host}
                  onChange={(e) => setExternalDb({...externalDb, host: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required={importType === 'EXTERNAL'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">
                  Puerto
                </label>
                <input
                  type="text"
                  placeholder={formData.dbType === 'POSTGRES' ? '5432' : '27017'}
                  value={externalDb.port}
                  onChange={(e) => setExternalDb({...externalDb, port: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required={importType === 'EXTERNAL'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">
                  Usuario
                </label>
                <input
                  type="text"
                  placeholder="usuario"
                  value={externalDb.username}
                  onChange={(e) => setExternalDb({...externalDb, username: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required={importType === 'EXTERNAL'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={externalDb.password}
                  onChange={(e) => setExternalDb({...externalDb, password: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required={importType === 'EXTERNAL'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">
                  Nombre de la base de datos
                </label>
                <input
                  type="text"
                  placeholder="nombre_db"
                  value={externalDb.dbName}
                  onChange={(e) => setExternalDb({...externalDb, dbName: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required={importType === 'EXTERNAL'}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? "Creando..." : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
