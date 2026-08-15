/*
  Warnings:

  - You are about to alter the column `is_post_bronchodilator` on the `portal_observation` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `TinyInt`.

*/
-- AlterTable
ALTER TABLE `portal_observation` MODIFY `is_post_bronchodilator` BOOLEAN NOT NULL DEFAULT false;
