'use client';

import { ChatInterface } from '@/components/chat/chat-interface';

export default function ChatPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">AI Bugta Act Assistant</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Get Answer Based On The Bugta Act
        </p>
      </div>

      {/* Chat Interface */}
      <ChatInterface />
    </div>
  );
}