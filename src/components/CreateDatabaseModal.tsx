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
  const [importMode, setImportMode] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

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

      if (!response.ok) {
        throw new Error(data.error || "Error al crear la base de datos");
      }

      // 2. Si hay archivo, esperar a que el contenedor esté listo y luego importar
      if (importMode && importFile) {
        // Esperar a que el contenedor esté listo (polling)
        let retries = 0;
        const maxRetries = 10;
        
        while (retries < maxRetries) {
          const statusResponse = await fetch(`/api/databases/${data.id}`);
          const statusData = await statusResponse.json();
          
          if (statusData.status === 'RUNNING') {
            // Contenedor listo, proceder con la importación
            const formData = new FormData();
            formData.append('file', importFile);
            
            const importResponse = await fetch(`/api/databases/${data.id}/import`, {
              method: 'POST',
              body: formData
            });

            if (!importResponse.ok) {
              const importError = await importResponse.json();
              throw new Error(importError.error || "Error al importar datos");
            }
            break;
          }

          await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
          retries++;
        }

        if (retries >= maxRetries) {
          throw new Error("Timeout esperando que la base de datos esté lista");
        }
      }

      onCreate();
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al crear la base de datos");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Nueva Base de Datos</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Tipo de base de datos
            </label>
            <select
              value={formData.dbType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dbType: e.target.value as DatabaseType,
                })
              }
              className="w-full p-2 border rounded text-gray-900 dark:bg-gray-700 dark:text-gray-100"
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
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-2 border rounded text-gray-900 dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Subdominio</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formData.subdomain}
                onChange={(e) =>
                  setFormData({ ...formData, subdomain: e.target.value })
                }
                className="w-full p-2 border rounded text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                placeholder="mi-db"
                required
              />
              <span className="whitespace-nowrap text-gray-900 dark:text-gray-200">.streamingpro.es</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Usuario</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full p-2 border rounded text-gray-900 dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Contraseña</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full p-2 border rounded text-gray-900 dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Nombre de la base de datos
            </label>
            <input
              type="text"
              value={formData.dbName}
              onChange={(e) =>
                setFormData({ ...formData, dbName: e.target.value })
              }
              className="w-full p-2 border rounded text-gray-900 dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={importMode}
                onChange={(e) => setImportMode(e.target.checked)}
              />
              Importar datos existentes
            </label>
          </div>

          {importMode && (
            <div className="mb-4">
              <input
                type="file"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                accept={(() => {
                  switch (formData.dbType) {
                    case 'POSTGRES':
                    case 'MYSQL':
                      return '.sql';
                    case 'MONGODB':
                      return '.archive,.json';  // Aceptar ambos formatos
                    case 'REDIS':
                      return '.rdb,.txt';
                    default:
                      return '';
                  }
                })()}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Creando..." : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
