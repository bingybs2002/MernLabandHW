# RAG & Vector Databases

### 1. How does RAG work, and what problem does it solve?

RAG (Retrieval-Augmented Generation) looks up relevant information first and gives it to the model along with the question. Steps: the user's question is converted to an embedding; the system searches a vector database (often plus keyword search) for the most relevant document chunks; those chunks are inserted into the prompt as context; the model answers based on that context, ideally with citations. It solves the problem that models only know their training data: they lack private company data and recent information and can hallucinate. RAG grounds answers in your own up-to-date sources without retraining or fine-tuning, and updating knowledge is as simple as re-indexing documents.

### 2. Explain the RAG ingestion pipeline.

Ingestion is the offline step that prepares documents for retrieval: load the sources (PDFs, web pages, Notion, databases), clean and extract the text, split it into chunks, create an embedding for each chunk, and store the vectors with their text and metadata (source, title, date, permissions) in a vector database with an index. It is re-run or updated incrementally when documents change.

- **Chunking**  
  Splitting documents into smaller pieces, often a few hundred tokens each with some overlap between neighbors, so each chunk is focused enough to match a query and small enough to fit in the prompt. Strategies include fixed-size, recursive by paragraphs and sentences, and structure-aware (by headings or code blocks). Chunks that are too small lose context; chunks that are too large dilute relevance and waste tokens.
- **Embeddings**  
  An embedding is a list of numbers (a vector) produced by an embedding model that represents the meaning of a text, so semantically similar texts have nearby vectors even when they use different words. Each chunk is embedded at ingestion, and each query is embedded with the same model at search time.
- **Vector database and index**  
  A vector database (such as pgvector in Postgres, Pinecone, Weaviate, Qdrant, or Chroma) stores embeddings with their text and metadata and finds the vectors nearest to a query vector using similarity measures such as cosine similarity. The index (for example HNSW) is an approximate-nearest-neighbor structure that makes this search fast over millions of vectors instead of comparing against every one; metadata filters narrow results by source or user permissions.

### 3. What is the difference between keyword search, vector search, and hybrid search?

Keyword search (lexical, such as BM25 in Elasticsearch or Postgres full-text) matches exact words; it is great for names, IDs, error codes, and jargon, but misses synonyms and paraphrases. Vector search (semantic) compares embeddings to match meaning, so "how do I reset my password" finds "account recovery steps," but it can miss exact terms and rare identifiers. Hybrid search runs both and merges the results, commonly with Reciprocal Rank Fusion, often followed by a reranker model, giving the best of both; it is the usual choice for production RAG.
