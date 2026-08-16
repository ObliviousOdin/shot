import { ArrowRight, Check } from "lucide-react";
import { SiteHeader, Mark } from "@/components/shot/site-header";
import { InstallLine } from "@/components/shot/install-line";
import { Workspace } from "@/components/shot/workspace";
import { Badge } from "@/components/ui/badge";

const STEPS = [
  {
    n: "01",
    title: "Capture",
    body: "Region, window, or full screen. On your machine that is one shell command. In the browser, share a display, paste, or drop a file.",
  },
  {
    n: "02",
    title: "Dual clipboard",
    body: "The PNG and a temp path are written together. Visual apps take the image. Terminals and coding agents take the path.",
  },
  {
    n: "03",
    title: "Paste into chat",
    body: "Slack, Messages, Figma get pixels. Claude Code, Aider, and anything that wants a file get /tmp/shot-….png. No extra hop.",
  },
];

const COMPARE = [
  { label: "macOS only", them: true, us: false },
  { label: "Apple Silicon required", them: true, us: false },
  { label: "Swift app + permissions dance", them: true, us: false },
  { label: "Single-file POSIX install", them: false, us: true },
  { label: "Linux (Wayland / X11) + macOS", them: false, us: true },
  { label: "In-browser fallback", them: false, us: true },
  { label: "Image + path on the clipboard", them: true, us: true },
  { label: "Ephemeral /tmp files", them: true, us: true },
];

export function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-bg text-fg">
      <SiteHeader />

      <main className="mx-auto w-full min-w-0 max-w-6xl px-4 pb-24 sm:px-6">
        <section className="grid min-w-0 gap-10 pb-16 pt-12 sm:pt-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end lg:gap-16 lg:pb-20 lg:pt-20">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>for AI chats</Badge>
              <Badge variant="ok">6 KB · no brew</Badge>
            </div>
            <h1 className="mt-5 text-[2rem] font-medium leading-[1.08] tracking-[-0.03em] text-fg sm:text-5xl lg:text-[3.5rem]">
              Screenshots that paste into the right thing.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              A lightweight take on Screenshot for Chat. Capture a region. The
              image goes to visual apps. The temp path goes to your coding agent.
              One command to install — or use the workspace below.
            </p>
            <div id="install" className="mt-8 scroll-mt-24 max-w-xl">
              <InstallLine />
              <p className="mt-3 font-mono text-xs text-subtle">
                Drops <span className="text-muted">~/.local/bin/shot</span>. macOS
                and Linux. No compiler, no cask.
              </p>
            </div>
            <a
              href="#workspace"
              className="mt-6 inline-flex h-11 items-center gap-2 text-sm font-medium text-fg transition-opacity duration-150 hover:opacity-70"
            >
              Try it in the browser
              <ArrowRight className="size-4" />
            </a>
          </div>

          <HeroCard />
        </section>

        <Workspace />

        <section className="mt-20 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <article
              key={s.n}
              className="rounded-lg bg-surface px-5 py-5 shadow-[var(--shadow-border)]"
            >
              <p className="font-mono text-[11px] tabular-nums text-subtle">{s.n}</p>
              <h3 className="mt-3 text-base font-medium tracking-tight">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-20 grid min-w-0 gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
              CLI
            </p>
            <h2 className="mt-2 text-2xl font-medium tracking-tight">
              Same idea as a 6 KB script.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
              Screenshot for Chat is a polished Swift app for Apple Silicon. shot
              is the same dual-clipboard trick as a POSIX file you can read in
              one sitting. Pipe it, or copy the source.
            </p>
            <ul className="mt-6 space-y-2 font-mono text-sm text-fg">
              <li>
                <span className="text-subtle">$ </span>shot
                <span className="ml-3 text-muted">region</span>
              </li>
              <li>
                <span className="text-subtle">$ </span>shot -w
                <span className="ml-3 text-muted">window</span>
              </li>
              <li>
                <span className="text-subtle">$ </span>shot -f
                <span className="ml-3 text-muted">full screen</span>
              </li>
            </ul>
          </div>

          <div className="overflow-hidden rounded-lg bg-elevated shadow-[var(--shadow-border)]">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <span className="font-mono text-[11px] text-subtle">~/.local/bin/shot</span>
              <span className="font-mono text-[11px] text-subtle">posix sh</span>
            </div>
            <pre className="overflow-x-auto px-4 py-4 font-mono text-[12px] leading-relaxed text-muted">
{`shot -r          # drag a region
shot -w          # click a window
shot -f          # entire display

# writes  $TMPDIR/shot-YYYYMMDD-HHMMSS.png
# copies  PNG  →  visual apps
# copies  path →  terminals / agents
# prints  the path on stdout`}
            </pre>
          </div>
        </section>

        <section className="mt-20">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
            Versus the original
          </p>
          <h2 className="mt-2 text-2xl font-medium tracking-tight">
            Same paste. Smaller surface.
          </h2>
          <div className="mt-6 overflow-hidden rounded-lg bg-surface shadow-[var(--shadow-border)]">
            <div className="grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem] border-b border-border px-4 py-2.5 text-[11px] font-medium text-subtle sm:px-5">
              <span />
              <span className="text-center">Original</span>
              <span className="text-center">shot</span>
            </div>
            {COMPARE.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem] items-center border-b border-border px-4 py-3 last:border-0 sm:px-5"
              >
                <span className="min-w-0 pr-3 text-sm text-muted">{row.label}</span>
                <span className="flex justify-center">
                  <Flag on={row.them} />
                </span>
                <span className="flex justify-center">
                  <Flag on={row.us} />
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span className="inline-flex items-center gap-2">
            <Mark className="size-4" />
            <span className="font-mono text-xs">shot</span>
          </span>
          <p className="max-w-md text-xs leading-relaxed">
            Inspired by Jesse Vincent's Screenshot for Chat. Local only — the
            browser tool never uploads a pixel. The installer is a readable shell
            script.
          </p>
        </div>
      </footer>
    </div>
  );
}

function HeroCard() {
  return (
    <div className="min-w-0 rounded-xl bg-surface p-2 shadow-[var(--shadow-border)] sm:p-2.5">
      <div className="overflow-hidden rounded-lg bg-bg">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <span className="size-2 rounded-full bg-subtle/50" />
          <span className="size-2 rounded-full bg-subtle/50" />
          <span className="size-2 rounded-full bg-subtle/50" />
          <span className="ml-2 font-mono text-[11px] text-subtle">
            $ shot -r
          </span>
        </div>
        <div className="relative px-5 py-8 sm:px-8 sm:py-10">
          <div className="relative mx-auto w-full max-w-sm rounded-md border border-dashed border-border px-4 py-8">
            <span className="absolute left-0 top-0 size-2.5 border-t border-l border-accent" />
            <span className="absolute right-0 top-0 size-2.5 border-t border-r border-accent" />
            <span className="absolute bottom-0 left-0 size-2.5 border-b border-l border-accent" />
            <span className="absolute bottom-0 right-0 size-2.5 border-b border-r border-accent" />
            <p className="font-mono text-[11px] text-subtle">clipboard</p>
            <p className="mt-2 font-mono text-sm text-fg">image/png</p>
            <p className="mt-1 break-all font-mono text-xs text-muted">
              /tmp/shot-20260816-105612.png
            </p>
            <div className="mt-5 flex gap-2">
              <span className="rounded-sm bg-elevated px-2 py-1 font-mono text-[10px] text-muted">
                Slack ← image
              </span>
              <span className="rounded-sm bg-elevated px-2 py-1 font-mono text-[10px] text-muted">
                agent ← path
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Flag({ on }: { on: boolean }) {
  if (on) {
    return (
      <span className="inline-flex items-center gap-1.5 text-ok">
        <Check className="size-3.5" />
        <span className="sr-only">yes</span>
      </span>
    );
  }
  return <span className="text-subtle">—</span>;
}
