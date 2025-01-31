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

  const databaseTypes: DatabaseType[] = Object.values(DatabaseType) as DatabaseType[];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/databases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Error al crear");

      onCreate();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error al crear la base de datos");
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
