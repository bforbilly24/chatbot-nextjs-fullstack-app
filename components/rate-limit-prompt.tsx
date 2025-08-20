'use client';

import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Link from 'next/link';

interface RateLimitPromptProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RateLimitPrompt({ isOpen, onOpenChange }: RateLimitPromptProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader className="space-y-2">
          <AlertDialogTitle>Message Limit Reached</AlertDialogTitle>
          <AlertDialogDescription>
            You&apos;ve reached your daily message limit of 5 messages as a guest user.
          </AlertDialogDescription>
          <div className="text-sm text-muted-foreground">
            Login or create an account to continue chatting and access unlimited messages.
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel>Maybe Later</AlertDialogCancel>
          <Button asChild>
            <Link href="/v1/login">Login Now</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/v1/register">Sign Up</Link>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
