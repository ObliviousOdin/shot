import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { writeText } from "@/lib/shot/clipboard";
import { cn } from "@/lib/utils";

export function useOrigin() {
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  return origin;
}

export function installCommand(origin: string) {
  const host = origin || "https://shot.local";
  return `curl -fsSL ${host}/install.sh | sh`;
}

export function InstallLine({ className }: { className?: string }) {
  const origin = useOrigin();
  const cmd = installCommand(origin);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await writeText(cmd);
      setCopied(true);
      toast.success("Install command copied");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <div
      className={cn(
        "group flex w-full min-w-0 items-stretch overflow-hidden rounded-md bg-elevated shadow-[var(--shadow-border)]",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 sm:px-4">
        <span className="hidden font-mono text-subtle select-none sm:inline">$</span>
        <code className="min-w-0 flex-1 break-all font-mono text-[12px] leading-relaxed text-fg sm:truncate sm:text-[13px] sm:leading-normal">
          {cmd}
        </code>
      </div>
      <button
        type="button"
        onClick={() => void copy()}
        className="flex items-center gap-2 border-l border-border px-3 text-muted transition-colors duration-150 hover:bg-surface hover:text-fg sm:px-4"
        aria-label="Copy install command"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        <span className="hidden font-mono text-xs sm:inline">{copied ? "copied" : "copy"}</span>
      </button>
    </div>
  );
}
