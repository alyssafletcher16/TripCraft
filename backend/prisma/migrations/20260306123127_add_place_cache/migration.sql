-- CreateTable
CREATE TABLE "PlaceCache" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "reviewCount" INTEGER NOT NULL,
    "priceLevel" INTEGER,
    "reviews" JSONB NOT NULL,
    "photos" JSONB NOT NULL,
    "address" TEXT NOT NULL,
    "website" TEXT,
    "phone" TEXT,
    "hours" JSONB,
    "lastFetched" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaceCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlaceCache_placeId_key" ON "PlaceCache"("placeId");
