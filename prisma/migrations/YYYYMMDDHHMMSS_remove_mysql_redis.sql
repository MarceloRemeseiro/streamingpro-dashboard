-- AlterTable
ALTER TABLE "DatabaseInstance" ALTER COLUMN "dbType" DROP DEFAULT;

-- AlterEnum
BEGIN;
CREATE TYPE "DatabaseType_new" AS ENUM ('POSTGRES', 'MONGODB');
ALTER TABLE "DatabaseInstance" ALTER COLUMN "dbType" TYPE "DatabaseType_new" USING ("dbType"::text::"DatabaseType_new");
DROP TYPE "DatabaseType";
ALTER TYPE "DatabaseType_new" RENAME TO "DatabaseType";
COMMIT; 