ALTER TABLE "SubscriptionLesson" RENAME COLUMN "completed" TO "completedAt";
ALTER TABLE "SubscriptionLesson" ALTER COLUMN "completedAt" DROP DEFAULT;
ALTER TABLE "SubscriptionLesson" ALTER COLUMN "completedAt" TYPE TIMESTAMP(3) USING NOW();
ALTER TABLE "SubscriptionLesson" ALTER COLUMN "completedAt" SET DEFAULT NOW();
