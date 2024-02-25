-- DropForeignKey
ALTER TABLE `review` DROP FOREIGN KEY `review_conferenceschemaId_fkey`;

-- AddForeignKey
ALTER TABLE `review` ADD CONSTRAINT `review_conferenceschemaId_fkey` FOREIGN KEY (`conferenceschemaId`) REFERENCES `conferenceschema`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
