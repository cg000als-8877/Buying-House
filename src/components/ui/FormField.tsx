import React from 'react';
import { cn } from '@/lib/utils';

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  htmlFor?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  optionalText?: string;
}

export function FormField({
  label,
  htmlFor,
  error,
  helperText,
  required = false,
  optionalText,
  children,
  className,
  ...props
}: FormFieldProps) {
  return (
    <div className={cn('w-full space-y-1.5', className)} {...props}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={htmlFor}
            className="block text-xs font-medium text-foreground-secondary"
          >
            {label}
            {required && <span className="ml-1 text-error" aria-hidden="true">*</span>}
          </label>
          {optionalText && !required && (
            <span className="text-[11px] text-muted-foreground">{optionalText}</span>
          )}
        </div>
      )}

      {children}

      {error ? (
        <p
          id={htmlFor ? `${htmlFor}-error` : undefined}
          role="alert"
          className="text-xs text-error font-medium"
        >
          {error}
        </p>
      ) : helperText ? (
        <p
          id={htmlFor ? `${htmlFor}-helper` : undefined}
          className="text-xs text-muted-foreground"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
