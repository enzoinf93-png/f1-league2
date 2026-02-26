-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GrandPrix" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "round" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "circuit" TEXT NOT NULL,
    "qualifyingStart" DATETIME NOT NULL,
    "raceStart" DATETIME NOT NULL,
    "hasSprint" BOOLEAN NOT NULL DEFAULT false,
    "isResultEntered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_GrandPrix" ("circuit", "country", "createdAt", "id", "isResultEntered", "name", "qualifyingStart", "raceStart", "round", "year") SELECT "circuit", "country", "createdAt", "id", "isResultEntered", "name", "qualifyingStart", "raceStart", "round", "year" FROM "GrandPrix";
DROP TABLE "GrandPrix";
ALTER TABLE "new_GrandPrix" RENAME TO "GrandPrix";
CREATE UNIQUE INDEX "GrandPrix_year_round_key" ON "GrandPrix"("year", "round");
CREATE TABLE "new_ScoringConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leagueId" TEXT NOT NULL,
    "pointsP1" INTEGER NOT NULL DEFAULT 10,
    "pointsP2" INTEGER NOT NULL DEFAULT 7,
    "pointsP3" INTEGER NOT NULL DEFAULT 5,
    "pointsPodioBonus" INTEGER NOT NULL DEFAULT 5,
    "pointsPole" INTEGER NOT NULL DEFAULT 5,
    "pointsFastestLap" INTEGER NOT NULL DEFAULT 5,
    "pointsSafetyCar" INTEGER NOT NULL DEFAULT 3,
    "pointsRetirement" INTEGER NOT NULL DEFAULT 8,
    "pointsConstructor" INTEGER NOT NULL DEFAULT 4,
    "pointsSprintPole" INTEGER NOT NULL DEFAULT 3,
    "pointsSprintP1" INTEGER NOT NULL DEFAULT 7,
    "pointsSprintP2" INTEGER NOT NULL DEFAULT 5,
    "pointsSprintP3" INTEGER NOT NULL DEFAULT 3,
    "pointsSprintPodioBonus" INTEGER NOT NULL DEFAULT 3,
    "pointsFastestPitStop" INTEGER NOT NULL DEFAULT 4,
    CONSTRAINT "ScoringConfig_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ScoringConfig" ("id", "leagueId", "pointsConstructor", "pointsFastestLap", "pointsP1", "pointsP2", "pointsP3", "pointsPodioBonus", "pointsPole", "pointsRetirement", "pointsSafetyCar") SELECT "id", "leagueId", "pointsConstructor", "pointsFastestLap", "pointsP1", "pointsP2", "pointsP3", "pointsPodioBonus", "pointsPole", "pointsRetirement", "pointsSafetyCar" FROM "ScoringConfig";
DROP TABLE "ScoringConfig";
ALTER TABLE "new_ScoringConfig" RENAME TO "ScoringConfig";
CREATE UNIQUE INDEX "ScoringConfig_leagueId_key" ON "ScoringConfig"("leagueId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
