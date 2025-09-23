-- CreateTable
CREATE TABLE "BlockQuota" (
    "id" TEXT NOT NULL,
    "block_id" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "quota_number" INTEGER NOT NULL,

    CONSTRAINT "BlockQuota_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BlockQuota" ADD CONSTRAINT "BlockQuota_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "HostelBlock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
