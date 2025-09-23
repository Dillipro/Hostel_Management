-- AlterTable
ALTER TABLE "HostelBlock" ADD COLUMN     "closed_until" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "temp_closed_until" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "StudentPreference" ADD COLUMN     "weight" INTEGER;

-- AlterTable
ALTER TABLE "Waitlist" ADD COLUMN     "round_id" TEXT;

-- CreateTable
CREATE TABLE "Appeal" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "round_id" TEXT,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decision_by" TEXT,
    "decision_at" TIMESTAMP(3),
    "decision_note" TEXT,

    CONSTRAINT "Appeal_pkey" PRIMARY KEY ("id")
);
