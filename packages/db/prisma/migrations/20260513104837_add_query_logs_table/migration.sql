-- CreateTable
CREATE TABLE "query_logs" (
    "id" TEXT NOT NULL,
    "query_text" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "answer" TEXT,
    "latency_ms" INTEGER NOT NULL,
    "chunks_retrieved" INTEGER NOT NULL,
    "chunks_used" INTEGER NOT NULL,
    "source_count" INTEGER NOT NULL,
    "prompt_tokens" INTEGER,
    "completion_tokens" INTEGER,
    "total_tokens" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "query_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "query_logs_created_at_idx" ON "query_logs"("created_at");

-- CreateIndex
CREATE INDEX "query_logs_success_idx" ON "query_logs"("success");
