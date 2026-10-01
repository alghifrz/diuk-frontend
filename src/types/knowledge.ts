export type {
  KnowledgeDocument,
  KnowledgeDocumentStatus,
} from "@/types/ai";

export type KnowledgeStatus = {
  /** False when the server has embeddings switched off. */
  enabled: boolean;
  max_file_bytes: number;
  min_similarity: number;
};

export type KnowledgeHit = {
  chunk_id: string;
  document_id: string;
  title: string;
  content: string;
  similarity: number;
};

export type KnowledgeSearchResult = {
  available: boolean;
  reason?: string;
  results: KnowledgeHit[];
};

export type KnowledgeAnswer = {
  available: boolean;
  /** False when nothing in the knowledge base answers the question. */
  found: boolean;
  answer?: string;
  sources: KnowledgeHit[];
};

export type KnowledgeSourceType = "TEXT" | "PDF" | "DOCX";
