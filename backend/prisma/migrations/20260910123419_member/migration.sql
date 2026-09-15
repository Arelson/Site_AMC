-- CreateTable
CREATE TABLE "Member" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "cargo" TEXT,
    "bio" TEXT,
    "linkLattes" TEXT,
    "cadeiraOcupacao" TEXT,
    "userId" INTEGER,
    "patronoId" INTEGER,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_userId_key" ON "Member"("userId");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_patronoId_fkey" FOREIGN KEY ("patronoId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
