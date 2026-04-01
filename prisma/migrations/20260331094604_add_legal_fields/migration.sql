-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SiteSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "title" TEXT,
    "description" TEXT,
    "keywords" TEXT,
    "ogImage" TEXT,
    "favicon" TEXT,
    "aboutTitle" TEXT NOT NULL DEFAULT 'Welcome to Bali Archive',
    "aboutContent" TEXT NOT NULL DEFAULT '',
    "termsTitle" TEXT NOT NULL DEFAULT 'Terms & Conditions',
    "termsContent" TEXT NOT NULL DEFAULT '',
    "contactTitle" TEXT NOT NULL DEFAULT 'Contact',
    "contactContent" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SiteSettings" ("aboutContent", "aboutTitle", "description", "favicon", "id", "keywords", "ogImage", "title", "updatedAt") SELECT "aboutContent", "aboutTitle", "description", "favicon", "id", "keywords", "ogImage", "title", "updatedAt" FROM "SiteSettings";
DROP TABLE "SiteSettings";
ALTER TABLE "new_SiteSettings" RENAME TO "SiteSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
