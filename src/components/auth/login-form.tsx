"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { Spinner } from "@/components/ui/spinner";
import { mapAuthError } from "@/lib/auth/errors";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";
import { getPublicSupabaseConfig } from "@/lib/supabase/env";
import type { AuthFieldErrors } from "@/types/auth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LoginFormProps = {
  oauthError?: boolean;
};

type PendingAction = "password" | "google" | null;

export function LoginForm({ oauthError = false }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [formError, setFormError] = useState(
    oauthError ? "Something went wrong. Please try again." : "",
  );
  const [pending, setPending] = useState<PendingAction>(null);

  const isSubmitting = pending !== null;
  const hasError = Boolean(formError || fieldErrors.email || fieldErrors.password);

  const fieldClass = cn(
    "h-11 w-full rounded-lg border bg-surface px-3.5 text-sm text-on-surface outline-none transition placeholder:text-outline",
    hasError
      ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
      : "border-outline-variant focus:border-primary-dark focus:ring-2 focus:ring-primary/20",
    "disabled:cursor-not-allowed disabled:opacity-70",
  );

  function validate() {
    const nextErrors: AuthFieldErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail && !password) {
      setFieldErrors({});
      setFormError("Please enter your email and password.");
      return false;
    }

    if (!trimmedEmail) {
      nextErrors.email = "Please enter your email address.";
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Please enter your password.";
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setFormError("");
      return false;
    }

    return true;
  }

  async function handlePasswordSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!validate()) {
      return;
    }

    if (!getPublicSupabaseConfig()) {
      setFormError("This workspace is not configured for sign-in yet.");
      return;
    }

    setPending("password");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setFormError(mapAuthError(error));
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setPending(null);
    }
  }

  async function handleGoogleSignIn() {
    setFormError("");
    setFieldErrors({});

    if (!getPublicSupabaseConfig()) {
      setFormError("This workspace is not configured for sign-in yet.");
      return;
    }

    setPending("google");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setFormError(mapAuthError(error));
        setPending(null);
      }
    } catch {
      setFormError("Something went wrong. Please try again.");
      setPending(null);
    }
  }

  return (
    <>
      <div className="mb-4">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <h1 className="text-[30px] font-bold tracking-[-0.025em] text-on-surface sm:text-[32px]">
          Welcome back
        </h1>
        <p className="mt-2.5 max-w-md text-[14px] leading-6 text-on-surface-variant">
          Sign in to manage your customer conversations, bookings, and business
          operations.
        </p>
      </div>

      {formError ? (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-error/15 bg-error/5 px-4 py-3.5 text-[13px] leading-5 text-error"
        >
          <Icon name="error" size={16} className="mt-0.5 shrink-0" />
          <p>{formError}</p>
        </div>
      ) : null}

      <GoogleSignInButton
        loading={pending === "google"}
        disabled={isSubmitting}
        onClick={handleGoogleSignIn}
      />

      <div
        className="my-7 flex items-center gap-4"
        role="separator"
        aria-label="or"
      >
        <div className="h-px flex-1 bg-outline-variant" />
        <span className="text-[11px] font-semibold tracking-[0.16em] text-outline uppercase">
          or
        </span>
        <div className="h-px flex-1 bg-outline-variant" />
      </div>

      <form
        className="space-y-5"
        onSubmit={handlePasswordSignIn}
        noValidate
        aria-busy={isSubmitting}
      >
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-on-surface">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            disabled={isSubmitting}
            placeholder="you@business.com"
            value={email}
            aria-invalid={fieldErrors.email ? true : undefined}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            onChange={(event) => setEmail(event.target.value)}
            className={fieldClass}
          />
          {fieldErrors.email ? (
            <p id="email-error" role="alert" className="text-sm text-error">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-on-surface"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              disabled={isSubmitting}
              placeholder="Enter your password"
              value={password}
              aria-invalid={fieldErrors.password ? true : undefined}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
              onChange={(event) => setPassword(event.target.value)}
              className={`${fieldClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              disabled={isSubmitting}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-outline hover:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Icon
                name={showPassword ? "visibility_off" : "visibility"}
                size={20}
              />
            </button>
          </div>
          {fieldErrors.password ? (
            <p id="password-error" role="alert" className="text-sm text-error">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          aria-label={pending === "password" ? "Signing in" : "Sign in"}
          className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending === "password" ? (
            <>
              <Spinner className="text-white" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="mt-8 rounded-xl bg-surface-container-low px-4 py-3.5 text-center">
        <p className="text-[13px] leading-5 text-on-surface-variant">
          Need an account?{" "}
          <span className="font-medium text-on-surface">
            Contact your administrator.
          </span>
        </p>
      </div>
    </>
  );
}
