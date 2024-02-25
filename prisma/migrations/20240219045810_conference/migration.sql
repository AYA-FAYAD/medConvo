/*
  Warnings:

  - You are about to drop the `campgroundschema` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `campgroundschema`;

-- CreateTable
CREATE TABLE `conferenceschema` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NULL,
    `price` INTEGER NULL,
    `description` VARCHAR(1000) NULL,
    `location` VARCHAR(191) NULL,
    `image` VARCHAR(1000) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
