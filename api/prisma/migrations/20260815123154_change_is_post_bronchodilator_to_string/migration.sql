/*
  Warnings:

  - You are about to alter the column `is_post_bronchodilator` on the `portal_observation` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(20)`.

*/
-- AlterTable
ALTER TABLE `portal_observation` MODIFY `is_post_bronchodilator` VARCHAR(20) NOT NULL DEFAULT 'standard';
