import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";

export const metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-5 py-8">
      <Card className="w-full max-w-[440px]">
        <Logo className="mb-2" />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-on-surface">
          Forgot password
        </h1>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">
          Contact your workspace administrator to reset your password.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex min-h-11 items-center text-sm font-medium text-secondary hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
        >
          Back to sign in
        </Link>
      </Card>
    </main>
  );
}
