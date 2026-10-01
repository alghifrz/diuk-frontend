import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandPanel } from "@/components/auth/brand-panel";
import { LoginForm } from "@/components/auth/login-form";
import { getVerifiedAuthClaims } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign in",
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const claims = await getVerifiedAuthClaims();

  if (claims) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <main className="flex min-h-dvh w-full bg-surface">
      <BrandPanel />

      <section className="flex min-h-dvh flex-1 flex-col px-6 py-6 sm:px-10 lg:px-14 xl:px-20">
        <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col">
          <div className="flex flex-1 flex-col justify-center py-12 sm:py-16">
            <LoginForm oauthError={params.error === "oauth"} />
          </div>

          <footer className="pb-2 text-center text-[11px] leading-5 text-outline">
            <p>
              By continuing, you agree to DIUK&apos;s{" "}
              <Link
                href="/login"
                className="underline underline-offset-2 transition-colors hover:text-on-surface-variant"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/login"
                className="underline underline-offset-2 transition-colors hover:text-on-surface-variant"
              >
                Privacy Policy
              </Link>
              .
            </p>
            <p className="mt-1">© 2026 DIUK Solution</p>
          </footer>
        </div>
      </section>
    </main>
  );
}
