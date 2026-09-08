import React from 'react';
import { cn } from '@/lib/utils';
import { FormField } from './FormField';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      required,
      icon,
      rightElement,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const inputNode = (
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-3 text-muted-foreground pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          className={cn(
            'w-full bg-surface border border-border rounded-md px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-fast',
            'focus-visible:outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-muted',
            icon && 'pl-9',
            rightElement && 'pr-9',
            error && 'border-error focus-visible:border-error focus-visible:ring-error',
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 text-muted-foreground flex items-center justify-center">
            {rightElement}
          </div>
        )}
      </div>
    );

    if (label || error || helperText) {
      return (
        <FormField
          label={label}
          htmlFor={inputId}
          error={error}
          helperText={helperText}
          required={required}
        >
          {inputNode}
        </FormField>
      );
    }

    return inputNode;
  }
);

Input.displayName = 'Input';
