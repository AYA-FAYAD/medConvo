-- CreateTable
CREATE TABLE `_UserToreview` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_UserToreview_AB_unique`(`A`, `B`),
    INDEX `_UserToreview_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_UserToreview` ADD CONSTRAINT `_UserToreview_A_fkey` FOREIGN KEY (`A`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserToreview` ADD CONSTRAINT `_UserToreview_B_fkey` FOREIGN KEY (`B`) REFERENCES `review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
