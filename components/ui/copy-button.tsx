'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from './button';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

interface CopyButtonProps {
  content: string;
  copyMessage?: string;
}

export function CopyButton({ content, copyMessage = 'Copied!' }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-md"
          onClick={copyToClipboard}
        >
          {isCopied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isCopied ? copyMessage : 'Copy to clipboard'}
      </TooltipContent>
    </Tooltip>
  );
}
