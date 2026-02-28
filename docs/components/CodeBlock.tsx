'use client';

import { Button } from '@/components/retroui';
import { cn } from '@/lib/utils';
import { Check, ClipboardCopy } from 'lucide-react';
import { useRef, useState } from 'react';
import type { HTMLAttributes } from 'react';

export const CodeBlock = ({
  className,
  children,
  'data-language': language,
  ...props
}: HTMLAttributes<HTMLPreElement> & { 'data-language'?: string }) => {
  const [hasCopied, setHasCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleClickCopy = () => {
    const code = preRef.current?.textContent;
    if (code) {
      setHasCopied(true);
      navigator.clipboard.writeText(code).catch(() => undefined);

      setTimeout(() => {
        setHasCopied(false);
      }, 3000);
    }
  };

  return (
    <div className="relative my-6">
      <div className="bg-code-bg hidden items-center justify-between rounded-t-(--radius) border-b border-white/10 px-4 py-2 md:flex">
        {language ? <span className="text-code-fg font-mono text-xs">{language}</span> : <span />}
        <Button disabled={hasCopied} size="sm" onClick={handleClickCopy}>
          {hasCopied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <pre
        className={cn('bg-code-bg text-code-fg overflow-x-auto rounded-(--radius) p-4 md:rounded-t-none', className)}
        data-language={language}
        {...props}>
        <span ref={preRef}>{children}</span>
      </pre>
      <Button disabled={hasCopied} size="icon" onClick={handleClickCopy} className="absolute top-3 right-3 md:hidden">
        {hasCopied ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
      </Button>
    </div>
  );
};
