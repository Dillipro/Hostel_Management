-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "due_at" TIMESTAMP(3),
ADD COLUMN     "impact" TEXT,
ADD COLUMN     "started_at" TIMESTAMP(3),
ADD COLUMN     "stopped_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "gateway_ref" TEXT,
ADD COLUMN     "gateway_status" TEXT;

-- AlterTable
ALTER TABLE "RCNotice" ADD COLUMN     "dept_targets" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "pinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "year_targets" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "maintenance" BOOLEAN DEFAULT false;

-- CreateTable
CREATE TABLE "PaymentEvent" (
    "id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoticeRead" (
    "id" TEXT NOT NULL,
    "notice_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoticeRead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AllotmentSnapshot" (
    "id" TEXT NOT NULL,
    "round_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meta" JSONB,

    CONSTRAINT "AllotmentSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AllotmentSnapshotItem" (
    "id" TEXT NOT NULL,
    "snapshot_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "block_id" TEXT NOT NULL,

    CONSTRAINT "AllotmentSnapshotItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PaymentEvent" ADD CONSTRAINT "PaymentEvent_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoticeRead" ADD CONSTRAINT "NoticeRead_notice_id_fkey" FOREIGN KEY ("notice_id") REFERENCES "RCNotice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllotmentSnapshotItem" ADD CONSTRAINT "AllotmentSnapshotItem_snapshot_id_fkey" FOREIGN KEY ("snapshot_id") REFERENCES "AllotmentSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
