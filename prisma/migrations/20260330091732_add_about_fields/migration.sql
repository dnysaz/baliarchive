/*
  Warnings:

  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `category` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `hashtagId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `kabupaten` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `locationId` on the `Post` table. All the data in the column will be lost.
  - Added the required column `regencyId` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Location_name_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Location";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Regency" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "title" TEXT,
    "description" TEXT,
    "keywords" TEXT,
    "ogImage" TEXT,
    "favicon" TEXT,
    "aboutTitle" TEXT NOT NULL DEFAULT 'Welcome to Bali Archive',
    "aboutContent" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_HashtagToPost" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_HashtagToPost_A_fkey" FOREIGN KEY ("A") REFERENCES "Hashtag" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_HashtagToPost_B_fkey" FOREIGN KEY ("B") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Image" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'IMAGE',
    "postId" INTEGER NOT NULL,
    CONSTRAINT "Image_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Image" ("id", "postId", "url") SELECT "id", "postId", "url" FROM "Image";
DROP TABLE "Image";
ALTER TABLE "new_Image" RENAME TO "Image";
CREATE TABLE "new_Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "regencyId" INTEGER NOT NULL,
    "province" TEXT NOT NULL DEFAULT 'Bali',
    "title" TEXT NOT NULL,
    "slug" TEXT,
    "tagline" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "bestTime" TEXT NOT NULL,
    "howToGet" TEXT NOT NULL,
    "cost" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "venue" TEXT,
    "guidePdfUrl" TEXT,
    "guidePrice" TEXT,
    "googleMapsUrl" TEXT,
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lemonSqueezyUrl" TEXT,
    "isAd" BOOLEAN NOT NULL DEFAULT false,
    "advertiserName" TEXT,
    CONSTRAINT "Post_regencyId_fkey" FOREIGN KEY ("regencyId") REFERENCES "Regency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Post" ("bestTime", "body", "cost", "createdAt", "guidePdfUrl", "guidePrice", "howToGet", "id", "likes", "province", "saves", "tagline", "title", "updatedAt", "venue") SELECT "bestTime", "body", "cost", "createdAt", "guidePdfUrl", "guidePrice", "howToGet", "id", "likes", "province", "saves", "tagline", "title", "updatedAt", "venue" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Regency_name_key" ON "Regency"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Regency_slug_key" ON "Regency"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_HashtagToPost_AB_unique" ON "_HashtagToPost"("A", "B");

-- CreateIndex
CREATE INDEX "_HashtagToPost_B_index" ON "_HashtagToPost"("B");
