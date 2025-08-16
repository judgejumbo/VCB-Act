'use client';

import { ChatInterface } from '@/components/chat/chat-interface';

export default function ChatPage() {
  return (
    <div className="container mx-auto max-w-4xl p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI Assistant</h1>
        <p className="text-muted-foreground">
          Ask questions and get intelligent responses powered by n8n workflows
        </p>
      </div>

      {/* Chat Interface */}
      <ChatInterface />
    </div>
  );
}