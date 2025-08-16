export interface User {
  id: string;
  email: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
  imageUrl?: string | undefined;
}

export interface ChatMessage {
  id: string;
  message: string;
  response?: string;
  timestamp: Date;
  userId: string;
  status: 'pending' | 'completed' | 'error';
}

export interface WebhookPayload {
  message: string;
  userId: string;
  timestamp: string;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface N8nWebhookResponse {
  response?: string;
  message?: string;
  text?: string;
  output?: string;
  success?: boolean;
  timestamp?: string;
  [key: string]: unknown; // Allow for other possible fields
}