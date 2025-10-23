export type Sender = 'user' | 'ai' | 'system';

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  options?: string[];
  field?: string; // e.g., 'role', 'task'
  isAnswered?: boolean;
  isUpgradePrompt?: boolean;
}

export interface HistoryItem {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

export interface AIQuestion {
  field: string;
  question: string;
  options: string[];
}

export interface AIQuestionsResponse {
  questions: AIQuestion[];
}