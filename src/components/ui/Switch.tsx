import React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md';
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, size = 'md', id, disabled, checked, defaultChecked, onChange, ...props }, ref) => {
    const generatedId = React.useId();
    const switchId = id || generatedId;

    const sizes = {
      sm: {
        track: 'w-7 h-4',
        thumb: 'w-3 h-3 translate-x-0.5 peer-checked:translate-x-3.5',
      },
      md: {
        track: 'w-10 h-5',
        thumb: 'w-4 h-4 translate-x-0.5 peer-checked:translate-x-5',
      },
    };

    return (
      <label
        htmlFor={switchId}
        className={cn(
          'inline-flex items-center gap-3 cursor-pointer select-none',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        <div className="relative inline-flex items-center">
          <input
            ref={ref}
            type="checkbox"
            role="switch"
            id={switchId}
            disabled={disabled}
            checked={checked}
            defaultChecked={defaultChecked}
            onChange={onChange}
            aria-checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'rounded-full bg-border transition-colors duration-fast peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
              sizes[size].track
            )}
          />
          <div
            className={cn(
              'absolute rounded-full bg-surface shadow-subtle transition-transform duration-fast',
              sizes[size].thumb
            )}
          />
        </div>

        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className="text-sm font-medium text-foreground">{label}</span>}
            {description && <span className="text-xs text-muted-foreground">{description}</span>}
          </div>
        )}
      </label>
    );
  }
);

Switch.displayName = 'Switch';
