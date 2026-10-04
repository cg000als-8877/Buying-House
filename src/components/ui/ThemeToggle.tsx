'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme/context';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function ThemeToggle({
  className = '',
  showLabel = false,
  size = 'md',
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === 'dark';

  const buttonSizeClasses = size === 'sm' ? 'h-8 px-2.5 text-xs' : 'h-9 px-3 text-xs';
  const iconSizeClasses = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  // Render stable placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle visual theme"
        className={`inline-flex items-center gap-2 rounded-lg border border-border bg-surface text-muted-foreground hover:text-foreground transition-colors ${buttonSizeClasses} ${className}`}
        disabled
      >
        <Sun className={iconSizeClasses} />
        {showLabel && <span className="font-medium">Day Mode</span>}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to Day Mode' : 'Switch to Night Mode'}
      title={isDark ? 'Switch to Day Mode' : 'Switch to Night Mode'}
      className={`inline-flex items-center gap-2 rounded-lg border border-border bg-surface text-foreground hover:bg-surface-muted hover:border-border-strong active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${buttonSizeClasses} ${className}`}
    >
      {isDark ? (
        <>
          <Sun className={`${iconSizeClasses} text-amber-400`} />
          {showLabel && <span className="font-semibold text-foreground">Day Mode</span>}
        </>
      ) : (
        <>
          <Moon className={`${iconSizeClasses} text-slate-700`} />
          {showLabel && <span className="font-semibold text-foreground">Night Mode</span>}
        </>
      )}
    </button>
  );
}
