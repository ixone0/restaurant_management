/*
  Warnings:

  - Added the required column `cost` to the `Menu` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Menu" ADD COLUMN     "cost" DOUBLE PRECISION NOT NULL;
