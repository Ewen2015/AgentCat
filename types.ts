export enum MessageRole {
  USER = 'user',
  AGENT = 'agent',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  isThinking?: boolean;
  actionItems?: string[]; // Structured steps returned by the agent
}

export interface PageContext {
  url: string;
  title: string;
  content: string; // Simplified DOM/Text representation
}

export interface AgentResponse {
  message: string;
  actions: string[];
}