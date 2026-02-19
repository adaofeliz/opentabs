import { Wrench } from 'lucide-react';

interface ToolIconProps {
  toolName: string;
  className?: string;
}

const ToolIcon = ({ className = '' }: ToolIconProps) => (
  <div
    className={`border-border bg-muted/50 flex h-6 w-6 shrink-0 items-center justify-center rounded border ${className}`}>
    <Wrench className="text-muted-foreground h-3 w-3" />
  </div>
);

export { ToolIcon };
