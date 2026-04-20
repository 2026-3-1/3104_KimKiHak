-- AlterTable
ALTER TABLE "Lecture" ADD COLUMN     "includes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "learningGoals" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "prerequisites" TEXT[] DEFAULT ARRAY[]::TEXT[];
