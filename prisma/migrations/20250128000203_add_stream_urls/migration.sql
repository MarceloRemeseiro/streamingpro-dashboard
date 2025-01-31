-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('RASPBERRY', 'LINUX_PC');

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "type" "DeviceType" NOT NULL,
    "arch" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "localIp" TEXT NOT NULL,
    "publicIp" TEXT NOT NULL,
    "capabilities" JSONB NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceConfig" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "clientServer" TEXT NOT NULL,
    "srtUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreamUrl" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StreamUrl_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Device_deviceId_key" ON "Device"("deviceId");

-- AddForeignKey
ALTER TABLE "DeviceConfig" ADD CONSTRAINT "DeviceConfig_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
