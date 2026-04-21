-- AlterTable
ALTER TABLE "SubscriptionLesson" ADD COLUMN     "lastWatchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "watchedSeconds" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" SERIAL NOT NULL,
    "subscriptionId" INTEGER NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "seconds" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Bookmark_subscriptionId_idx" ON "Bookmark"("subscriptionId");

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "LectureVideo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
