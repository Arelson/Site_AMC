-- CreateTable
CREATE TABLE "EventRegistration" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "eventId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
