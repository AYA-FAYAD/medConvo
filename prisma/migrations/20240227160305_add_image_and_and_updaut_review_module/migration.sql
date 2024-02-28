/*
  Warnings:

  - You are about to drop the column `image` on the `conferenceschema` table. All the data in the column will be lost.
  - You are about to drop the `_UserToreview` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `authorId` to the `review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_UserToreview` DROP FOREIGN KEY `_UserToreview_A_fkey`;

-- DropForeignKey
ALTER TABLE `_UserToreview` DROP FOREIGN KEY `_UserToreview_B_fkey`;

-- AlterTable
ALTER TABLE `conferenceschema` DROP COLUMN `image`;

-- AlterTable
ALTER TABLE `review` ADD COLUMN `authorId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `_UserToreview`;

-- CreateTable
CREATE TABLE `Image` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(1000) NOT NULL,
    `filename` VARCHAR(1000) NOT NULL,
    `conferenceschemaId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `review` ADD CONSTRAINT `review_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Image` ADD CONSTRAINT `Image_conferenceschemaId_fkey` FOREIGN KEY (`conferenceschemaId`) REFERENCES `conferenceschema`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
