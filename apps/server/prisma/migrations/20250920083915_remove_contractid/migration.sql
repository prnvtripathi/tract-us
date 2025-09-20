/*
  Warnings:

  - You are about to drop the column `contractId` on the `Contract` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Contract_contractId_key";

-- AlterTable
ALTER TABLE "public"."Contract" DROP COLUMN "contractId";
