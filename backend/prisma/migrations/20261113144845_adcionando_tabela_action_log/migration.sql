-- CreateTable
CREATE TABLE "ActionLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" INTEGER,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActionLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ActionLog" ADD CONSTRAINT "ActionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
