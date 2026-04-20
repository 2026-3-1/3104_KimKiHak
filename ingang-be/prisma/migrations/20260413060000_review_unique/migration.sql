-- CreateIndex
CREATE UNIQUE INDEX "Review_lectureId_userId_key" ON "Review"("lectureId", "userId");
