'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Send, Bot, User, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { validateMessageInput } from '@/lib/security';
import { SECURITY } from '@/lib/constants';
import type { ChatMessage } from '@/types';

export function ChatInterface() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    try {
      // Validate input using security middleware
      const sanitizedMessage = validateMessageInput(currentMessage);
      
      // Create new message
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        message: sanitizedMessage,
        timestamp: new Date(),
        userId: user?.id || 'anonymous',
        status: 'pending',
      };

      setMessages(prev => [...prev, newMessage]);
      setCurrentMessage('');
      setIsLoading(true);

      // Call API to send to n8n webhook (will implement in next step)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: sanitizedMessage,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      // Update message with response
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id
            ? {
                ...msg,
                response: data.data?.response || 'No response received',
                status: 'completed',
              }
            : msg
        )
      );

      toast.success('Response received!');
    } catch (error) {
      console.error('Chat error:', error);
      
      // Update message status to error
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id
            ? { ...msg, status: 'error' }
            : msg
        )
      );

      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResponse = async (response: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(response);
      setCopiedMessageId(messageId);
      toast.success('Response copied to clipboard!');
      
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    } catch {
      toast.error('Failed to copy response');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-[600px] flex-col">
      <Card className="flex-1 shadow-xl border-0 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Bot className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-green-600">Bugta Act: AI Assistant</span>
              <span className="text-sm font-normal text-muted-foreground">Get Answer Based On The Bugta Act</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-full flex-col p-0">
          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center">
                <div className="space-y-2">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Bugta Act: AI Assistant</h3>
                  <p className="text-sm text-muted-foreground">
                    Get Answer Based On The Bugta Act
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-3">
                    {/* User Message */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">You</span>
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4 shadow-sm">
                          <div className="text-lg leading-relaxed whitespace-pre-wrap">{message.message}</div>
                        </div>
                      </div>
                    </div>

                    {/* AI Response */}
                    {message.status === 'pending' && (
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-green-600">AI Bugta Act Assistant</span>
                            <Badge variant="secondary" className="text-xs">
                              Thinking...
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        </div>
                      </div>
                    )}

                    {message.status === 'completed' && message.response && (
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-green-600">AI Bugta Act Assistant</span>
                            <Badge variant="secondary" className="text-xs">
                              Completed
                            </Badge>
                          </div>
                          <div className="rounded-2xl bg-gradient-to-br from-secondary/80 to-muted/40 border border-secondary/30 p-4 shadow-lg">
                            <div className="flex items-start justify-between gap-3">
                              <div className="text-lg leading-relaxed whitespace-pre-wrap font-medium flex-1">{message.response}</div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1 shrink-0 hover:bg-background/80 rounded-xl"
                                onClick={() => handleCopyResponse(message.response!, message.id)}
                              >
                                {copiedMessageId === message.id ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-xs font-bold text-green-600">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-4 w-4" />
                                    <span className="text-xs font-bold">Copy</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {message.status === 'error' && (
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-green-600">AI Bugta Act Assistant</span>
                            <Badge variant="destructive" className="text-xs">
                              Error
                            </Badge>
                          </div>
                          <div className="rounded-lg bg-destructive/10 p-3">
                            <p className="text-sm text-destructive">
                              Sorry, I encountered an error. Please try again.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="min-h-[60px] resize-none"
                maxLength={SECURITY.MAX_MESSAGE_LENGTH}
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || isLoading}
                size="lg"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span>
                {currentMessage.length}/{SECURITY.MAX_MESSAGE_LENGTH}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}