export const APP_NAME = 'VCB Act Resource';
export const APP_DESCRIPTION = 'AI-powered question and answer interface';

export const API_ROUTES = {
  WEBHOOK: '/api/webhook',
  CHAT: '/api/chat',
} as const;

export const RATE_LIMITS = {
  MESSAGES_PER_MINUTE: 10,
  MESSAGES_PER_HOUR: 100,
} as const;

export const SECURITY = {
  MAX_MESSAGE_LENGTH: 2000,
  MIN_MESSAGE_LENGTH: 1,
  WEBHOOK_TIMEOUT: 30000, // 30 seconds
} as const;