import { cn } from '../../lib/cn';
import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ type = 'text', placeholder = 'Enter text', className, 'aria-invalid': ariaInvalid, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      aria-invalid={ariaInvalid}
      className={cn(
        'w-full rounded border-2 px-4 py-2 shadow-md transition focus:shadow-xs focus:outline-hidden',
        ariaInvalid && 'border-destructive text-destructive shadow-destructive shadow-xs',
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
