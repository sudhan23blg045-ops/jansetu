export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatRequestPayload {
  messages: ChatMessage[];
  languageCode: string;
}

export interface ChatResponsePayload {
  content: string;
  error?: string;
}
