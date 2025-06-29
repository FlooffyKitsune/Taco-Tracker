-- Taco Tracker Database Schema for Supabase
-- Run this in the Supabase SQL Editor

-- Create User table
CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT,
  "email" TEXT,
  "emailVerified" TIMESTAMP(3),
  "image" TEXT,
  "discordId" TEXT UNIQUE,
  "username" TEXT,
  "discriminator" TEXT,
  "globalName" TEXT,
  "totalTacosEaten" INTEGER DEFAULT 0,
  "totalTacoSessions" INTEGER DEFAULT 0,
  "joinedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "lastActiveAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Create Account table (for Auth.js)
CREATE TABLE "Account" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Session table (for Auth.js)
CREATE TABLE "Session" (
  "id" TEXT PRIMARY KEY,
  "sessionToken" TEXT UNIQUE NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create VerificationToken table (for Auth.js)
CREATE TABLE "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT UNIQUE NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  PRIMARY KEY ("identifier", "token")
);

-- Create TacoType table
CREATE TABLE "TacoType" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT UNIQUE NOT NULL,
  "emoji" TEXT NOT NULL,
  "color" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Create Achievement table
CREATE TABLE "Achievement" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT UNIQUE NOT NULL,
  "description" TEXT NOT NULL,
  "icon" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "requirement" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Create TacoSession table
CREATE TABLE "TacoSession" (
  "id" TEXT PRIMARY KEY,
  "createdById" TEXT NOT NULL,
  "name" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create TacoSessionParticipant table
CREATE TABLE "TacoSessionParticipant" (
  "id" TEXT PRIMARY KEY,
  "sessionId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "joinedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("sessionId") REFERENCES "TacoSession"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create TacoConsumption table
CREATE TABLE "TacoConsumption" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "tacoTypeId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "sessionId" TEXT,
  "consumedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("tacoTypeId") REFERENCES "TacoType"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("sessionId") REFERENCES "TacoSession"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create UserAchievement table
CREATE TABLE "UserAchievement" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "achievementId" TEXT NOT NULL,
  "unlockedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for better performance
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX "TacoSessionParticipant_sessionId_userId_key" ON "TacoSessionParticipant"("sessionId", "userId");
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");

-- Insert default taco types
INSERT INTO "TacoType" ("id", "name", "emoji", "color") VALUES
('carne-asada', 'Carne Asada', '🥩', '#8B4513'),
('al-pastor', 'Al Pastor', '🍖', '#FF6B6B'),
('carnitas', 'Carnitas', '🐷', '#DEB887'),
('pollo', 'Pollo', '🐔', '#FFD700'),
('pescado', 'Pescado', '🐟', '#4169E1'),
('camarones', 'Camarones', '🦐', '#FF69B4'),
('vegetariano', 'Vegetariano', '🥬', '#32CD32'),
('barbacoa', 'Barbacoa', '🔥', '#8B0000'),
('chorizo', 'Chorizo', '🌶️', '#DC143C'),
('lengua', 'Lengua', '👅', '#A0522D'),
('suadero', 'Suadero', '🥓', '#CD853F'),
('rajas-con-queso', 'Rajas con Queso', '🧀', '#FFFF00');

-- Insert default achievements
INSERT INTO "Achievement" ("id", "name", "description", "icon", "category", "requirement") VALUES
('first-taco', 'First Taco', 'Eat your very first taco!', '🌮', 'consumption', 1),
('taco-tuesday', 'Taco Tuesday', 'Eat tacos 5 times!', '🗓️', 'consumption', 5),
('taco-enthusiast', 'Taco Enthusiast', 'Eat 25 tacos total!', '😋', 'consumption', 25),
('taco-connoisseur', 'Taco Connoisseur', 'Eat 100 tacos total!', '🎩', 'consumption', 100),
('social-eater', 'Social Eater', 'Join your first group taco session!', '👥', 'social', 1),
('party-host', 'Party Host', 'Host 5 taco sessions!', '🎉', 'social', 5),
('streak-starter', 'Streak Starter', 'Eat tacos 3 days in a row!', '🔥', 'streak', 3),
('week-warrior', 'Week Warrior', 'Eat tacos 7 days in a row!', '⚡', 'streak', 7),
('variety-lover', 'Variety Lover', 'Try 5 different taco types!', '🌈', 'special', 5),
('taco-legend', 'Taco Legend', 'Reach 500 total tacos!', '👑', 'special', 500);
