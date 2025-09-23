-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "pdf" BYTEA;

-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "letter_pdf" BYTEA;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "receipt_pdf" BYTEA;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "id_card_pdf" BYTEA;
