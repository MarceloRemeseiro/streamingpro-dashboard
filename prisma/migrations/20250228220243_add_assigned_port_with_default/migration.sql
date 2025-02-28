-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DatabaseInstance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "dbType" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "containerId" TEXT NOT NULL,
    "connectionUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'STOPPED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "sslEnabled" BOOLEAN NOT NULL DEFAULT true,
    "portMappings" JSONB NOT NULL,
    "environment" JSONB NOT NULL,
    "volumes" TEXT,
    "assignedPort" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_DatabaseInstance" ("assignedPort", "connectionUrl", "containerId", "createdAt", "dbType", "environment", "id", "name", "portMappings", "sslEnabled", "status", "subdomain", "updatedAt", "volumes") SELECT "assignedPort", "connectionUrl", "containerId", "createdAt", "dbType", "environment", "id", "name", "portMappings", "sslEnabled", "status", "subdomain", "updatedAt", "volumes" FROM "DatabaseInstance";
DROP TABLE "DatabaseInstance";
ALTER TABLE "new_DatabaseInstance" RENAME TO "DatabaseInstance";
CREATE UNIQUE INDEX "DatabaseInstance_subdomain_key" ON "DatabaseInstance"("subdomain");
CREATE UNIQUE INDEX "DatabaseInstance_containerId_key" ON "DatabaseInstance"("containerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
