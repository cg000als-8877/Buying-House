'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Dialog } from '@/components/ui/Dialog';

export default function BuyerLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/buyer/dashboard';

  const { signIn, devLogin, sendPasswordReset, isBuyer, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot password state
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  // Auto redirect if already logged in as Buyer
  useEffect(() => {
    if (isAuthenticated && isBuyer) {
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, isBuyer, router, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both your business email and password.');
      return;
    }

    setIsLoading(true);
    const result = await signIn(email, password);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Invalid credentials.');
    } else {
      if (result.user?.role !== 'Buyer') {
        setErrorMessage('This portal is reserved for buyers. Please log in through the Staff Portal.');
        return;
      }
      router.push(redirectUrl);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    setResetLoading(true);
    const result = await sendPasswordReset(resetEmail);
    setResetLoading(false);
    setResetFeedback(result.message);
  };

  const handleDevLogin = (orgId = 'org-nordic') => {
    devLogin('Buyer', orgId);
    router.push(redirectUrl);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            Buyer Access Gateway
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Buyer Telemetry Portal
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Real-time order tracking, production telemetry, and quality documentation.
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-medium border-border">
          <CardHeader>
            <CardTitle className="text-lg">Sign In</CardTitle>
            <CardDescription>
              Enter your authorized organization credentials to access your production orders.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMessage && (
              <Alert variant="error" onClose={() => setErrorMessage(null)}>
                {errorMessage}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="Business Email"
                id="buyer-email"
                type="email"
                autoComplete="email"
                required
                placeholder="buyer@clientbrand.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
              />

              <div className="space-y-1">
                <Input
                  label="Password"
                  id="buyer-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:text-foreground cursor-pointer focus-visible:outline-none"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setResetFeedback(null);
                      setIsResetOpen(true);
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground hover:underline focus-visible:outline-none cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="w-full"
              >
                Sign In to Buyer Portal
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </CardContent>

          {/* Development / Testing Quick Switch */}
          <CardFooter className="flex-col items-start gap-2 bg-surface-muted/30 text-xs">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Development Test Profiles:
            </span>
            <div className="flex flex-wrap gap-2 w-full">
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleDevLogin('org-nordic')}
                className="text-[11px]"
              >
                Simulate Nordic Wear (Org A)
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleDevLogin('org-atlantic')}
                className="text-[11px]"
              >
                Simulate Atlantic Outfitters (Org B)
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Password Reset Modal */}
      <Dialog
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        title="Reset Password"
        description="Enter your registered business email address and we will dispatch recovery instructions."
        maxWidth="sm"
      >
        <form onSubmit={handlePasswordReset} className="space-y-4">
          {resetFeedback ? (
            <Alert variant="info">{resetFeedback}</Alert>
          ) : (
            <Input
              label="Account Email"
              type="email"
              required
              placeholder="buyer@clientbrand.com"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
            />
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsResetOpen(false)}
            >
              Close
            </Button>
            {!resetFeedback && (
              <Button
                variant="primary"
                size="sm"
                type="submit"
                isLoading={resetLoading}
              >
                Send Recovery Instructions
              </Button>
            )}
          </div>
        </form>
      </Dialog>
    </div>
  );
}
