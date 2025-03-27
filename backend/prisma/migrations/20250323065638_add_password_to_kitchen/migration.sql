/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - Added the required column `password` to the `Cashier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Kitchen` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('AVAILABLE', 'OCCUPIED');

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Cashier" ADD COLUMN     "password" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Kitchen" ADD COLUMN     "password" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "tableId" INTEGER;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email";

-- CreateTable
CREATE TABLE "Table" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,
    "status" "TableStatus" NOT NULL,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Table_number_key" ON "Table"("number");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;
