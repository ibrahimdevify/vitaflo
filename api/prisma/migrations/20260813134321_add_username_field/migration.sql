/*
  Warnings:

  - A unique constraint covering the columns `[userName]` on the table `dc_users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `dc_users` ADD COLUMN `userName` VARCHAR(100) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `dc_users_userName_key` ON `dc_users`(`userName`);
