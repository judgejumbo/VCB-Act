'use client';

import { useAuth, SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Button } from '@/components/ui/button';
import { Bot, Shield, Zap, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isSignedIn) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="container mx-auto flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <Bot className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">VCB Act Resource</span>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button>Get Started</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          </SignedIn>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto flex-1 px-6 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-6xl">
            Your AI Assistant
            <span className="text-primary"> Powered by n8n</span>
          </h1>
          <p className="mb-8 text-xl text-slate-600 dark:text-slate-400">
            Get intelligent answers to your questions with secure, 
            AI-powered workflows. Fast, reliable, and built for productivity.
          </p>
          
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <SignedOut>
              <SignUpButton mode="modal">
                <Button size="lg" className="w-full sm:w-auto">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Start Chatting Now
                </Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/chat">
                <Button size="lg" className="w-full sm:w-auto">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Go to Chat
                </Button>
              </Link>
            </SignedIn>
          </div>

          {/* Features */}
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-slate-800">
              <div className="mb-4 flex justify-center">
                <Bot className="h-12 w-12 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">AI-Powered</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Leverage advanced AI workflows built with n8n for intelligent responses
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-slate-800">
              <div className="mb-4 flex justify-center">
                <Shield className="h-12 w-12 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Secure</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Enterprise-grade security with Clerk authentication and encrypted data
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-slate-800">
              <div className="mb-4 flex justify-center">
                <Zap className="h-12 w-12 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Fast</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Get responses in under 2 seconds with optimized webhook integrations
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-slate-800">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-primary" />
              <span className="font-semibold">VCB Act Resource</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © 2024 VCB Act Resource. Powered by Next.js, Clerk, and n8n.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}