-- CreateTable
CREATE TABLE "DisciplinaryRecord" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "warden_id" TEXT NOT NULL,
    "block_id" TEXT,
    "violation" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'minor',
    "description" TEXT,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "issued_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_on" TIMESTAMP(3),

    CONSTRAINT "DisciplinaryRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DisciplinaryRecord" ADD CONSTRAINT "DisciplinaryRecord_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplinaryRecord" ADD CONSTRAINT "DisciplinaryRecord_warden_id_fkey" FOREIGN KEY ("warden_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
