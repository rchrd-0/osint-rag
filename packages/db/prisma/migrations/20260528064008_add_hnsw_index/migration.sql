SET maintenance_work_mem = '1GB';

CREATE INDEX CONCURRENTLY IF NOT EXISTS chunks_embedding_hnsw_openai_text_embedding_3_small_idx
ON chunks
USING hnsw (embedding vector_cosine_ops)
WHERE embedding IS NOT NULL
  AND embedding_model = 'openai/text-embedding-3-small';