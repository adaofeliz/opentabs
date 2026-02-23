import { forwardRef } from 'react';
import type { InputHTMLAttributes, KeyboardEvent, MouseEvent } from 'react';

interface NumberStepperProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

/**
 * Neo-brutalist number stepper with up/down arrow buttons.
 * Renders an inline numeric input with stacked chevron buttons on the right,
 * making it visually obvious the value is editable.
 */
const NumberStepper = forwardRef<HTMLInputElement, NumberStepperProps>(
  ({ value, onChange, min = 1, max = 65535, step = 1, className = '', onKeyDown, ...props }, ref) => {
    const clamp = (n: number) => Math.min(max, Math.max(min, n));

    const increment = (e: MouseEvent) => {
      e.preventDefault();
      const num = Number(value);
      if (!Number.isNaN(num)) onChange(String(clamp(num + step)));
    };

    const decrement = (e: MouseEvent) => {
      e.preventDefault();
      const num = Number(value);
      if (!Number.isNaN(num)) onChange(String(clamp(num - step)));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const num = Number(value);
        if (!Number.isNaN(num)) onChange(String(clamp(num + step)));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const num = Number(value);
        if (!Number.isNaN(num)) onChange(String(clamp(num - step)));
      }
      onKeyDown?.(e);
    };

    const isInvalid = props['aria-invalid'];

    return (
      <div
        className={`inline-flex items-stretch rounded border-2 shadow-sm transition focus-within:shadow-xs ${
          isInvalid ? 'border-destructive shadow-destructive' : 'border-border'
        } ${className}`}>
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          size={Math.max(value.length, 1)}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`min-w-0 bg-transparent px-1 font-mono text-xs outline-hidden ${isInvalid ? 'text-destructive' : ''}`}
          {...props}
        />
        <div className="border-border flex flex-col border-l">
          <button
            type="button"
            tabIndex={-1}
            onClick={increment}
            aria-label="Increment"
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex flex-1 cursor-pointer items-center justify-center px-1 transition">
            <svg width="8" height="5" viewBox="0 0 8 5" fill="none" aria-hidden="true">
              <path
                d="M1 4L4 1L7 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="border-border border-t" />
          <button
            type="button"
            tabIndex={-1}
            onClick={decrement}
            aria-label="Decrement"
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex flex-1 cursor-pointer items-center justify-center px-1 transition">
            <svg width="8" height="5" viewBox="0 0 8 5" fill="none" aria-hidden="true">
              <path
                d="M1 1L4 4L7 1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  },
);

NumberStepper.displayName = 'NumberStepper';

export { NumberStepper };
export type { NumberStepperProps };
