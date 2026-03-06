-- User: notification preferences
ALTER TABLE "User" ADD COLUMN "notifyRuleUpdates" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "notifyMonthlyReport" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "notifyDeadlines" BOOLEAN NOT NULL DEFAULT true;

-- User: email drip sequence tracking
ALTER TABLE "User" ADD COLUMN "lastEmailSent" TEXT;
ALTER TABLE "User" ADD COLUMN "lastEmailSentAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "emailSequenceStep" INTEGER NOT NULL DEFAULT 0;

-- User: shareable summary token
ALTER TABLE "User" ADD COLUMN "shareToken" TEXT;
CREATE UNIQUE INDEX "User_shareToken_key" ON "User"("shareToken");

-- User: referral program
ALTER TABLE "User" ADD COLUMN "referralCode" TEXT;
ALTER TABLE "User" ADD COLUMN "referredBy" TEXT;
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- UserMatch: actual savings tracking
ALTER TABLE "UserMatch" ADD COLUMN "actualSaving" DECIMAL(65,30);

-- UserProfile: re-matching timestamp
ALTER TABLE "UserProfile" ADD COLUMN "lastMatchedAt" TIMESTAMP(3);
