import React from 'react';
import { cn } from '@/lib/utils';
import { FormField } from './FormField';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      required,
      id,
      disabled,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    const textareaNode = (
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={cn(
          'w-full bg-surface border border-border rounded-md px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-fast resize-y min-h-[80px]',
          'focus-visible:outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-muted',
          error && 'border-error focus-visible:border-error focus-visible:ring-error',
          className
        )}
        {...props}
      />
    );

    if (label || error || helperText) {
      return (
        <FormField
          label={label}
          htmlFor={textareaId}
          error={error}
          helperText={helperText}
          required={required}
        >
          {textareaNode}
        </FormField>
      );
    }

    return textareaNode;
  }
);

Textarea.displayName = 'Textarea';
