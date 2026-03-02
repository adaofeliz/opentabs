import { cn } from '../lib/cn.js';
import { Wrench } from 'lucide-react';
import { DynamicIcon } from 'lucide-react/dynamic';
import { Suspense } from 'react';
import type { IconName } from 'lucide-react/dynamic';

interface ToolIconProps {
  icon?: string;
  className?: string;
  enabled?: boolean;
}

const FallbackIcon = ({ enabled = true }: { enabled?: boolean }) => (
  <Wrench className={cn('h-3 w-3 transition-colors', enabled ? 'text-foreground' : 'text-muted-foreground')} />
);

const ToolIcon = ({ icon, className = '', enabled = true }: ToolIconProps) => (
  <div
    className={cn(
      'flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 transition-colors',
      enabled ? 'border-border bg-muted/50' : 'border-border/60 bg-muted/30',
      className,
    )}>
    {icon ? (
      <Suspense fallback={<FallbackIcon enabled={enabled} />}>
        <DynamicIcon
          name={icon as IconName}
          className={cn('h-3 w-3 transition-colors', enabled ? 'text-foreground' : 'text-muted-foreground')}
          fallback={() => <FallbackIcon enabled={enabled} />}
        />
      </Suspense>
    ) : (
      <FallbackIcon enabled={enabled} />
    )}
  </div>
);

export { ToolIcon };
