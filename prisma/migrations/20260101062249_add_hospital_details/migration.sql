-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hospital" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Korea',
    "phone" TEXT,
    "website" TEXT,
    "description" TEXT,
    "descriptionEn" TEXT,
    "imageUrl" TEXT,
    "rating" REAL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "operatingHours" TEXT,
    "operatingHoursEn" TEXT,
    "hasParking" BOOLEAN NOT NULL DEFAULT false,
    "parkingInfo" TEXT,
    "parkingInfoEn" TEXT,
    "isWheelchairAccessible" BOOLEAN NOT NULL DEFAULT false,
    "supportedLanguages" TEXT,
    "transportationInfo" TEXT,
    "transportationInfoEn" TEXT,
    "estimatedCost" TEXT,
    "estimatedCostEn" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Hospital" ("address", "city", "country", "createdAt", "description", "descriptionEn", "id", "imageUrl", "name", "nameEn", "phone", "rating", "reviewCount", "updatedAt", "website") SELECT "address", "city", "country", "createdAt", "description", "descriptionEn", "id", "imageUrl", "name", "nameEn", "phone", "rating", "reviewCount", "updatedAt", "website" FROM "Hospital";
DROP TABLE "Hospital";
ALTER TABLE "new_Hospital" RENAME TO "Hospital";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
