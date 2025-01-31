-- CreateEnum
CREATE TYPE "DatabaseType" AS ENUM ('POSTGRES', 'MYSQL', 'MONGODB', 'REDIS');

-- CreateEnum
CREATE TYPE "InstanceStatus" AS ENUM ('RUNNING', 'STOPPED', 'ERROR');

-- CreateTable
CREATE TABLE "DatabaseInstance" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dbType" "DatabaseType" NOT NULL,
    "subdomain" TEXT NOT NULL,
    "containerId" TEXT NOT NULL,
    "connectionUrl" TEXT NOT NULL,
    "status" "InstanceStatus" NOT NULL DEFAULT 'STOPPED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sslEnabled" BOOLEAN NOT NULL DEFAULT true,
    "portMappings" JSONB NOT NULL,
    "environment" JSONB NOT NULL,
    "volumes" TEXT,

    CONSTRAINT "DatabaseInstance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DatabaseInstance_subdomain_key" ON "DatabaseInstance"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "DatabaseInstance_containerId_key" ON "DatabaseInstance"("containerId");
