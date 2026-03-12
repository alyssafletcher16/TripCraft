-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "budgetType" TEXT NOT NULL DEFAULT 'total';

-- CreateTable
CREATE TABLE "BookingClick" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tripId" TEXT,
    "blockId" TEXT,
    "activityTitle" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingClick_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BookingClick" ADD CONSTRAINT "BookingClick_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
