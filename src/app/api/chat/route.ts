import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { validateMessageInput, SecurityError } from '@/lib/security';
import { createSecurityHeaders } from '@/lib/security';
import { SECURITY } from '@/lib/constants';
import type { APIResponse, N8nWebhookResponse } from '@/types';

export async function POST(request: NextRequest) {
  const securityHeaders = createSecurityHeaders();

  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401, headers: securityHeaders }
      );
    }

    // Parse request body
    const body = await request.json();
    const { message } = body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400, headers: securityHeaders }
      );
    }

    // Sanitize input
    const sanitizedMessage = validateMessageInput(message);

    // Call n8n webhook
    const n8nResponse = await callN8nWebhook(sanitizedMessage, userId);

    const response: APIResponse<{ response: string }> = {
      success: true,
      data: { response: n8nResponse },
      message: 'Response generated successfully',
    };

    return NextResponse.json(response, { headers: securityHeaders });

  } catch (error) {
    console.error('Chat API error:', error);

    if (error instanceof SecurityError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400, headers: securityHeaders }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: securityHeaders }
    );
  }
}

async function callN8nWebhook(message: string, userId: string): Promise<string> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET;

  if (!webhookUrl) {
    throw new Error('N8N webhook URL not configured');
  }

  try {
    const payload = {
      message: message,
      userId: userId,
      timestamp: new Date().toISOString(),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SECURITY.WEBHOOK_TIMEOUT);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(webhookSecret && { 'Authorization': `Bearer ${webhookSecret}` }),
        'User-Agent': 'VCB-Act-Resource/1.0',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`N8N webhook returned ${response.status}: ${response.statusText}`);
    }

    // Check if response has content
    const responseText = await response.text();
    
    if (!responseText || responseText.trim() === '') {
      // Empty response - return a default message
      return 'Thank you for your message! I received it successfully.';
    }

    let data: N8nWebhookResponse;
    try {
      data = JSON.parse(responseText) as N8nWebhookResponse;
    } catch {
      // If not valid JSON, return the text response as-is
      return responseText;
    }
    
    // Handle different possible response formats from n8n
    if (typeof data === 'string') {
      return data;
    }
    
    if (data && typeof data === 'object') {
      // Try common response fields
      if ('response' in data && typeof data.response === 'string') {
        return data.response;
      }
      if ('message' in data && typeof data.message === 'string') {
        return data.message;
      }
      if ('text' in data && typeof data.text === 'string') {
        return data.text;
      }
      if ('output' in data && typeof data.output === 'string') {
        return data.output;
      }
    }

    // Fallback: return JSON string if we can't find a text response
    return JSON.stringify(data);

  } catch (error) {
    console.error('N8N webhook error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('N8N webhook request timed out');
    }
    
    throw new Error('Failed to get response from AI assistant');
  }
}