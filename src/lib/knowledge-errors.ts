import { ApiError } from "@/lib/api/errors";
import { aiErrorMessage } from "@/lib/ai-errors";

const MESSAGES: Record<string, string> = {
  DOCUMENT_TOO_LARGE: "That file is too large.",
  UNSUPPORTED_DOCUMENT_TYPE: "Only .pdf, .md, .txt and .docx files are supported.",
  DOCUMENT_EMPTY:
    "We couldn't find any text in that document. Scanned PDFs need to be converted to text first.",
  QUERY_TOO_LONG: "That question is too long.",
  DOCUMENT_NOT_FOUND: "That document no longer exists.",
  DOCUMENT_ALREADY_PROCESSING: "This document is already being processed.",
  KNOWLEDGE_QUOTA_EXCEEDED:
    "You've reached the knowledge document limit on your plan.",
  EMBEDDING_NOT_CONFIGURED:
    "Knowledge search isn't switched on for this server yet.",
  ANSWER_FAILED: "Couldn't write an answer right now. Please try again.",
  DOCUMENT_STORAGE_FAILED: "Couldn't store the file. Please try again.",
  DOCUMENT_PROCESSING_FAILED: "Couldn't process the document. Please try again.",
};

export function knowledgeErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError && error.code && MESSAGES[error.code]) {
    return MESSAGES[error.code];
  }
  return aiErrorMessage(error, fallback);
}
