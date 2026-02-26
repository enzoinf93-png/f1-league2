-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "League" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "League_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LeagueMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leagueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeagueMember_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LeagueMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GrandPrix" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "round" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "circuit" TEXT NOT NULL,
    "qualifyingStart" DATETIME NOT NULL,
    "raceStart" DATETIME NOT NULL,
    "isResultEntered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Prediction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "grandPrixId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Prediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Prediction_grandPrixId_fkey" FOREIGN KEY ("grandPrixId") REFERENCES "GrandPrix" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GpResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "grandPrixId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "enteredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GpResult_grandPrixId_fkey" FOREIGN KEY ("grandPrixId") REFERENCES "GrandPrix" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "grandPrixId" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "breakdown" TEXT NOT NULL,
    "calculatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Score_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Score_grandPrixId_fkey" FOREIGN KEY ("grandPrixId") REFERENCES "GrandPrix" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Score_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScoringConfig" (
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
    CONSTRAINT "ScoringConfig_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "League_inviteCode_key" ON "League"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "LeagueMember_leagueId_userId_key" ON "LeagueMember"("leagueId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "GrandPrix_year_round_key" ON "GrandPrix"("year", "round");

-- CreateIndex
CREATE UNIQUE INDEX "Prediction_userId_grandPrixId_type_key" ON "Prediction"("userId", "grandPrixId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "GpResult_grandPrixId_type_key" ON "GpResult"("grandPrixId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Score_userId_grandPrixId_leagueId_key" ON "Score"("userId", "grandPrixId", "leagueId");

-- CreateIndex
CREATE UNIQUE INDEX "ScoringConfig_leagueId_key" ON "ScoringConfig"("leagueId");
