-- CreateTable
CREATE TABLE `review` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `body` VARCHAR(191) NULL,
    `rating` INTEGER NULL,
    `conferenceschemaId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `review` ADD CONSTRAINT `review_conferenceschemaId_fkey` FOREIGN KEY (`conferenceschemaId`) REFERENCES `conferenceschema`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
