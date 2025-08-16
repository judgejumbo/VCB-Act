import { NextRequest } from 'next/server';
import { SECURITY } from './constants';

export class SecurityError extends Error {
  constructor(message: string, public code: string = 'SECURITY_ERROR') {
    super(message);
    this.name = 'SecurityError';
  }
}

export function validateMessageInput(message: string): string {
  if (!message || typeof message !== 'string') {
    throw new SecurityError('Message is required and must be a string', 'INVALID_INPUT');
  }

  const trimmed = message.trim();
  
  if (trimmed.length < SECURITY.MIN_MESSAGE_LENGTH) {
    throw new SecurityError('Message too short', 'MESSAGE_TOO_SHORT');
  }
  
  if (trimmed.length > SECURITY.MAX_MESSAGE_LENGTH) {
    throw new SecurityError('Message too long', 'MESSAGE_TOO_LONG');
  }

  // Remove potentially dangerous characters but preserve basic formatting
  const sanitized = trimmed
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/data:/gi, '') // Remove data protocol
    .replace(/vbscript:/gi, ''); // Remove vbscript protocol

  return sanitized;
}

export function validateWebhookRequest(request: NextRequest): boolean {
  const contentType = request.headers.get('content-type');
  const userAgent = request.headers.get('user-agent');

  // Basic validation checks
  if (!contentType?.includes('application/json')) {
    return false;
  }

  // Block suspicious user agents
  const suspiciousAgents = ['curl', 'wget', 'python-requests'];
  if (userAgent && suspiciousAgents.some(agent => 
    userAgent.toLowerCase().includes(agent)
  )) {
    return false;
  }

  return true;
}

export function createSecurityHeaders() {
  return {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;",
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
}