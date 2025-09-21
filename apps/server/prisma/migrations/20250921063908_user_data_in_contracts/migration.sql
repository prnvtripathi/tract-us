/*
  Warnings:

  - Added the required column `userId` to the `Contract` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Contract" ADD COLUMN     "url" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Contract" ADD CONSTRAINT "Contract_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("_id") ON DELETE CASCADE ON UPDATE CASCADE;
