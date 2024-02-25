-- CreateTable
CREATE TABLE `_UserToconferenceschema` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_UserToconferenceschema_AB_unique`(`A`, `B`),
    INDEX `_UserToconferenceschema_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_UserToconferenceschema` ADD CONSTRAINT `_UserToconferenceschema_A_fkey` FOREIGN KEY (`A`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserToconferenceschema` ADD CONSTRAINT `_UserToconferenceschema_B_fkey` FOREIGN KEY (`B`) REFERENCES `conferenceschema`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
