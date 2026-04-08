-- CreateTable
CREATE TABLE "database_connections" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "driver" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "database_name" TEXT NOT NULL,
    "schema" TEXT NOT NULL DEFAULT 'public',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "database_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cron_expression" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_run" TIMESTAMP(3),

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_steps" (
    "id" SERIAL NOT NULL,
    "integration_id" INTEGER NOT NULL,
    "source_connection_id" INTEGER NOT NULL,
    "source_query" TEXT NOT NULL,
    "target_connection_id" INTEGER NOT NULL,
    "target_query" TEXT NOT NULL,
    "execution_order" INTEGER NOT NULL,
    "batch_size" INTEGER NOT NULL DEFAULT 1000,

    CONSTRAINT "integration_steps_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "integration_steps" ADD CONSTRAINT "integration_steps_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_steps" ADD CONSTRAINT "integration_steps_source_connection_id_fkey" FOREIGN KEY ("source_connection_id") REFERENCES "database_connections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_steps" ADD CONSTRAINT "integration_steps_target_connection_id_fkey" FOREIGN KEY ("target_connection_id") REFERENCES "database_connections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
