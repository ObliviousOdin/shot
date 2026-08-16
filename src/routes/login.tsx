import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { Mark } from "@/components/shot/site-header";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  return (
    <main className="grid min-h-screen place-items-center bg-bg px-6 text-fg">
      <div className="w-full max-w-sm">
        <Link to="/" className="inline-flex items-center gap-2 text-fg">
          <Mark />
          <span className="font-mono text-sm">shot</span>
        </Link>
        <h1 className="mt-8 text-2xl font-medium tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-muted">
          Optional. The capture workspace and installer work as a guest.
        </p>
        <div className="mt-6 space-y-2">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
              >
                Continue with {p.label}
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted">Sign-in is disabled.</p>
          )}
        </div>
        <Link
          to="/"
          className="mt-6 inline-block text-sm text-muted transition-colors duration-150 hover:text-fg"
        >
          Back
        </Link>
      </div>
    </main>
  );
}
