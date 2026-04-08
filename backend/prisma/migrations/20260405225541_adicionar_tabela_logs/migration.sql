-- CreateTable
CREATE TABLE "integration_logs" (
    "id" SERIAL NOT NULL,
    "integration_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP(3),
    "message" TEXT,

    CONSTRAINT "integration_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "integration_logs" ADD CONSTRAINT "integration_logs_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
