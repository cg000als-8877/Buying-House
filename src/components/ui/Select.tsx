import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { FormField } from './FormField';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  required?: boolean;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      options,
      error,
      helperText,
      required,
      placeholder,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    const selectNode = (
      <div className="relative flex items-center w-full">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            'w-full appearance-none bg-surface border border-border rounded-md px-3.5 py-2 pr-10 text-sm text-foreground transition-colors duration-fast cursor-pointer',
            'focus-visible:outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-muted',
            error && 'border-error focus-visible:border-error focus-visible:ring-error',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-muted-foreground bg-surface">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
              className="bg-surface text-foreground"
            >
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="w-4 h-4 text-muted-foreground absolute right-3 pointer-events-none"
          aria-hidden="true"
        />
      </div>
    );

    if (label || error || helperText) {
      return (
        <FormField
          label={label}
          htmlFor={selectId}
          error={error}
          helperText={helperText}
          required={required}
        >
          {selectNode}
        </FormField>
      );
    }

    return selectNode;
  }
);

Select.displayName = 'Select';
