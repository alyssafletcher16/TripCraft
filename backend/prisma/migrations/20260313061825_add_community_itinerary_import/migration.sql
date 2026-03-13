-- CreateTable
CREATE TABLE "Community" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "friendsOnly" BOOLEAN NOT NULL DEFAULT false,
    "upvotes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Community_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItineraryImport" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "sourceFormat" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "parseNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItineraryImport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Community_tripId_key" ON "Community"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "ItineraryImport_tripId_key" ON "ItineraryImport"("tripId");

-- AddForeignKey
ALTER TABLE "Community" ADD CONSTRAINT "Community_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItineraryImport" ADD CONSTRAINT "ItineraryImport_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
