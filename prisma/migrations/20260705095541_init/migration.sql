-- CreateTable
CREATE TABLE "vocab_set" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER DEFAULT 1,
    "name" TEXT NOT NULL,
    "sourceFile" TEXT,
    "totalWords" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "word" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "setId" INTEGER NOT NULL,
    "kanji" TEXT,
    "reading" TEXT NOT NULL,
    "meaningKo" TEXT NOT NULL,
    "synonyms" TEXT,
    "examples" TEXT,
    "posTag" TEXT,
    "enrichedAt" DATETIME,
    CONSTRAINT "word_setId_fkey" FOREIGN KEY ("setId") REFERENCES "vocab_set" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "word_srs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "wordId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "nextReviewDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "wrongCount" INTEGER NOT NULL DEFAULT 0,
    "lastReviewedAt" DATETIME,
    CONSTRAINT "word_srs_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "word" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "quiz_attempt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "wordId" INTEGER NOT NULL,
    "direction" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "answeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "word_setId_idx" ON "word"("setId");

-- CreateIndex
CREATE UNIQUE INDEX "word_srs_wordId_key" ON "word_srs"("wordId");

-- CreateIndex
CREATE INDEX "word_srs_nextReviewDate_idx" ON "word_srs"("nextReviewDate");

-- CreateIndex
CREATE INDEX "quiz_attempt_wordId_idx" ON "quiz_attempt"("wordId");
