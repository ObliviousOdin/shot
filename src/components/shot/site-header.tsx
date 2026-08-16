import { Link } from "@tanstack/react-router";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

export function SiteHeader({ className }: { className?: string }) {
  const { isPending } = useCurrentUserState();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border/80 bg-bg/80 backdrop-blur-md",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 text-fg">
          <Mark />
          <span className="font-mono text-sm font-medium tracking-tight">shot</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <a
            href="#workspace"
            className="hidden rounded-sm px-3 py-2 text-sm text-muted transition-colors duration-150 hover:text-fg sm:inline"
          >
            Capture
          </a>
          <a
            href="#install"
            className="hidden rounded-sm px-3 py-2 text-sm text-muted transition-colors duration-150 hover:text-fg sm:inline"
          >
            Install
          </a>
          {isPending ? (
            <span className="ml-1 size-8 animate-pulse rounded-full bg-elevated" />
          ) : (
            <>
              <SignedOut>
                <Link
                  to="/login"
                  className="rounded-sm px-3 py-2 text-sm text-muted transition-colors duration-150 hover:text-fg"
                >
                  Sign in
                </Link>
              </SignedOut>
              <SignedIn>
                <div className="ml-1 hidden sm:block">
                  <UserButton />
                </div>
              </SignedIn>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("size-5 text-fg", className)}
      fill="none"
      aria-hidden="true"
    >
      <rect x="4" y="6" width="16" height="12" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M4 6h2.6M17.4 6H20M4 18h2.6M17.4 18H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  );
}
