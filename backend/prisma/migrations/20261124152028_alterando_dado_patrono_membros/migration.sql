-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_patronoId_fkey";

-- AlterTable
ALTER TABLE "Member" ALTER COLUMN "patronoId" SET DATA TYPE TEXT;
