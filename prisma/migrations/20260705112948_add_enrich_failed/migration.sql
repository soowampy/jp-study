-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_word" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "setId" INTEGER NOT NULL,
    "kanji" TEXT,
    "reading" TEXT NOT NULL,
    "meaningKo" TEXT NOT NULL,
    "synonyms" TEXT,
    "examples" TEXT,
    "posTag" TEXT,
    "enrichedAt" DATETIME,
    "enrichFailed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "word_setId_fkey" FOREIGN KEY ("setId") REFERENCES "vocab_set" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_word" ("enrichedAt", "examples", "id", "kanji", "meaningKo", "posTag", "reading", "setId", "synonyms") SELECT "enrichedAt", "examples", "id", "kanji", "meaningKo", "posTag", "reading", "setId", "synonyms" FROM "word";
DROP TABLE "word";
ALTER TABLE "new_word" RENAME TO "word";
CREATE INDEX "word_setId_idx" ON "word"("setId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
