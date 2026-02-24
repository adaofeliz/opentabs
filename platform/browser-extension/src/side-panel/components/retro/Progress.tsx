import { cn } from '../../lib/cn';
import * as ProgressPrimitives from '@radix-ui/react-progress';

interface IProgressProps extends ProgressPrimitives.ProgressProps {
  /** Classes applied to the indicator (the filled bar) */
  indicatorClassName?: string;
}

const Progress = ({ className, indicatorClassName, value, ...props }: IProgressProps) => (
  <ProgressPrimitives.Root
    className={cn('bg-muted border-border relative h-1.5 overflow-hidden rounded border', className)}
    value={value}
    {...props}>
    <ProgressPrimitives.Indicator
      className={cn('bg-accent-foreground h-full transition-all duration-200', indicatorClassName)}
      style={{ width: `${value ?? 0}%` }}
    />
  </ProgressPrimitives.Root>
);

export { Progress };
export type { IProgressProps };
