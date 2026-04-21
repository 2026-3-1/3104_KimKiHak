ALTER TABLE "SubscriptionLesson" RENAME COLUMN "completedAt" TO "completed";
ALTER TABLE "SubscriptionLesson" ALTER COLUMN "completed" DROP DEFAULT;
ALTER TABLE "SubscriptionLesson" ALTER COLUMN "completed" TYPE BOOLEAN USING false;
ALTER TABLE "SubscriptionLesson" ALTER COLUMN "completed" SET DEFAULT false;
