import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  ClipboardPaste,
  Crop,
  Download,
  ImageIcon,
  Loader2,
  Monitor,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CropOverlay, type CropRect } from "@/components/shot/crop-overlay";
import { captureDisplay } from "@/lib/shot/capture";
import {
  readClipboardImage,
  writeImage,
  writeSmartClipboard,
  writeText,
} from "@/lib/shot/clipboard";
import { formatBytes, formatClock, markdownFor, promptFor } from "@/lib/shot/format";
import { cropDataUrl, dataUrlToBlob, downloadDataUrl } from "@/lib/shot/image";
import { renderSampleShot } from "@/lib/shot/sample";
import { useActiveShot, useShotStore } from "@/lib/shot/store";
import type { CopyFormat } from "@/lib/shot/types";
import { cn } from "@/lib/utils";

const COPY_OPTIONS: { id: CopyFormat; label: string; hint: string }[] = [
  { id: "smart", label: "Smart", hint: "Image + path, like the original" },
  { id: "image", label: "Image", hint: "PNG only" },
  { id: "path", label: "Path", hint: "Temp file path as text" },
  { id: "markdown", label: "Markdown", hint: "![alt](path)" },
  { id: "prompt", label: "Prompt", hint: "Ready to paste into an agent" },
];

export function Workspace() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [cropping, setCropping] = useState(false);
  const [copied, setCopied] = useState<CopyFormat | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const shot = useActiveShot();
  const shots = useShotStore((s) => s.shots);
  const preferred = useShotStore((s) => s.preferredCopy);
  const addFromBlob = useShotStore((s) => s.addFromBlob);
  const addFromDataUrl = useShotStore((s) => s.addFromDataUrl);
  const setActive = useShotStore((s) => s.setActive);
  const remove = useShotStore((s) => s.remove);
  const setPreferredCopy = useShotStore((s) => s.setPreferredCopy);

  const ingestBlob = useCallback(
    async (blob: Blob, label: string) => {
      setBusy(label);
      try {
        const rec = await addFromBlob(blob);
        setCropping(false);
        toast.success(`Captured ${rec.filename}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Capture failed");
      } finally {
        setBusy(null);
      }
    },
    [addFromBlob],
  );

  const onCapture = useCallback(async () => {
    setBusy("capture");
    try {
      const blob = await captureDisplay();
      await addFromBlob(blob);
      setCropping(false);
      toast.success("Screen captured");
      setHint(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Capture failed";
      if (/not allowed|permission|security|iframe|display-capture|NotAllowed/i.test(msg)) {
        setHint(
          "Screen capture is blocked in this embed. Paste a screenshot (⌘V / Ctrl+V) or drop a file.",
        );
      } else {
        setHint(
          "Could not share a screen here. Paste (⌘V) or upload a PNG instead — same smart clipboard after that.",
        );
      }
    } finally {
      setBusy(null);
    }
  }, [addFromBlob]);

  const onPaste = useCallback(async () => {
    setBusy("paste");
    try {
      const blob = await readClipboardImage();
      if (!blob) {
        toast.message("No image on the clipboard", {
          description: "Copy a screenshot first, then paste here.",
        });
        return;
      }
      await addFromBlob(blob);
      setCropping(false);
      toast.success("Pasted from clipboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Paste failed");
    } finally {
      setBusy(null);
    }
  }, [addFromBlob]);

  const onSample = useCallback(async () => {
    setBusy("sample");
    try {
      const sample = await renderSampleShot();
      await addFromDataUrl(sample.dataUrl, "shot-sample-auth-error.png");
      setCropping(false);
      toast.success("Loaded a sample editor shot");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sample failed");
    } finally {
      setBusy(null);
    }
  }, [addFromDataUrl]);

  const onFiles = useCallback(
    async (files: FileList | File[]) => {
      const file = Array.from(files).find((f) => f.type.startsWith("image/"));
      if (!file) {
        toast.error("Drop a PNG, JPEG, or WebP");
        return;
      }
      await ingestBlob(file, "upload");
    },
    [ingestBlob],
  );

  const copyShot = useCallback(
    async (format: CopyFormat) => {
      if (!shot) return;
      setBusy("copy");
      try {
        const blob = await dataUrlToBlob(shot.dataUrl);
        if (format === "smart") {
          const result = await writeSmartClipboard(blob, shot.virtualPath);
          toast.success(
            result === "both"
              ? "Image + path on clipboard"
              : result === "image"
                ? "Image copied — use Path if your agent needs the file"
                : "Path copied (image not accepted here)",
          );
        } else if (format === "image") {
          await writeImage(blob);
          toast.success("Image copied");
        } else if (format === "path") {
          await writeText(shot.virtualPath);
          toast.success("Path copied");
        } else if (format === "markdown") {
          await writeText(markdownFor(shot.virtualPath, shot.width, shot.height));
          toast.success("Markdown copied");
        } else {
          await writeText(promptFor(shot));
          toast.success("Prompt copied");
        }
        setCopied(format);
        window.setTimeout(() => setCopied(null), 1400);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Copy failed");
      } finally {
        setBusy(null);
      }
    },
    [shot],
  );

  const onCrop = useCallback(
    async (rect: CropRect) => {
      if (!shot) return;
      setCropping(false);
      setBusy("crop");
      try {
        const next = await cropDataUrl(shot.dataUrl, rect);
        await addFromDataUrl(next.dataUrl);
        toast.success("Region cropped");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Crop failed");
      } finally {
        setBusy(null);
      }
    },
    [addFromDataUrl, shot],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) {
        return;
      }
      if (e.key === "Escape") {
        setCropping(false);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "v" && !e.shiftKey) {
        return;
      }
      if (e.key === "c" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        void onCapture();
      } else if (e.key === "v" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        void onPaste();
      } else if (e.key === "x" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        if (shot) setCropping(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "c" && shot) {
        e.preventDefault();
        void copyShot(preferred);
      }
    }

    function onPasteEvent(e: ClipboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) void ingestBlob(file, "paste");
          return;
        }
      }
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener("paste", onPasteEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("paste", onPasteEvent);
    };
  }, [copyShot, ingestBlob, onCapture, onPaste, preferred, shot]);

  return (
    <section id="workspace" className="min-w-0 scroll-mt-20">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-subtle">
            Workspace
          </p>
          <h2 className="mt-1 text-xl font-medium tracking-tight text-fg sm:text-2xl">
            Capture, then paste
          </h2>
        </div>
        <p className="hidden max-w-sm text-right text-xs text-muted sm:block">
          <Kbd>C</Kbd> screen · <Kbd>V</Kbd> paste · <Kbd>X</Kbd> crop ·{" "}
          <Kbd>⌘C</Kbd> smart copy
        </p>
      </div>

      <div
        className="rounded-xl bg-surface p-2 shadow-[var(--shadow-border)] sm:p-3"
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length) void onFiles(e.dataTransfer.files);
        }}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button onClick={() => void onCapture()} disabled={busy !== null}>
            {busy === "capture" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Monitor className="size-4" />
            )}
            Capture screen
          </Button>
          <Button variant="secondary" onClick={() => void onPaste()} disabled={busy !== null}>
            <ClipboardPaste className="size-4" />
            Paste
          </Button>
          <Button
            variant="secondary"
            onClick={() => fileRef.current?.click()}
            disabled={busy !== null}
          >
            <Upload className="size-4" />
            Upload
          </Button>
          <Button variant="ghost" onClick={() => void onSample()} disabled={busy !== null}>
            <ImageIcon className="size-4" />
            Sample
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              if (e.target.files) void onFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {hint ? (
          <p className="mt-3 rounded-md bg-elevated px-3 py-2 text-sm text-muted">{hint}</p>
        ) : null}

        <div className="mt-3 grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="relative min-h-64 min-w-0 overflow-hidden rounded-lg bg-bg">
            {shot ? (
              <div className="relative mx-auto w-fit max-w-full">
                <img
                  src={shot.dataUrl}
                  alt={shot.filename}
                  className="mx-auto max-h-[min(62vh,640px)] w-auto max-w-full object-contain outline outline-1 -outline-offset-1 outline-fg/10"
                />
                {cropping ? (
                  <CropOverlay
                    naturalWidth={shot.width}
                    naturalHeight={shot.height}
                    onCommit={(r) => void onCrop(r)}
                    onCancel={() => setCropping(false)}
                  />
                ) : null}
              </div>
            ) : (
              <EmptyStage
                onCapture={() => void onCapture()}
                onSample={() => void onSample()}
              />
            )}
          </div>

          <aside className="flex min-w-0 flex-col gap-3 rounded-lg bg-elevated p-3">
            {shot ? (
              <>
                <div>
                  <p className="font-mono text-[11px] text-subtle">Active</p>
                  <p className="mt-1 truncate font-mono text-sm text-fg">{shot.filename}</p>
                  <p className="mt-1 font-mono text-xs tabular-nums text-muted">
                    {shot.width}×{shot.height} · {formatBytes(shot.bytes)} ·{" "}
                    {formatClock(shot.createdAt)}
                  </p>
                  <p className="mt-2 break-all font-mono text-[11px] text-subtle">
                    {shot.virtualPath}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {COPY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      title={opt.hint}
                      onClick={() => {
                        setPreferredCopy(opt.id);
                        void copyShot(opt.id);
                      }}
                      className={cn(
                        "h-8 rounded-sm px-2.5 font-mono text-[11px] transition-colors duration-150",
                        preferred === opt.id
                          ? "bg-accent text-accent-fg"
                          : "bg-surface text-muted hover:text-fg",
                      )}
                    >
                      {copied === opt.id ? (
                        <span className="inline-flex items-center gap-1">
                          <Check className="size-3" /> copied
                        </span>
                      ) : (
                        opt.label
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCropping((v) => !v)}
                    disabled={!shot}
                  >
                    <Crop className="size-3.5" />
                    {cropping ? "Cancel" : "Crop"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => downloadDataUrl(shot.dataUrl, shot.filename)}
                  >
                    <Download className="size-3.5" />
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(shot.id)}>
                    <Trash2 className="size-3.5" />
                    Drop
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted">
                Nothing captured yet. Use Sample to try the clipboard without granting
                screen permission.
              </p>
            )}

            {shots.length > 0 ? (
              <div className="border-t border-border pt-3">
                <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
                  Recent
                </p>
                <ul className="grid grid-cols-4 gap-1.5 sm:grid-cols-5 lg:grid-cols-3">
                  {shots.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setActive(s.id);
                          setCropping(false);
                        }}
                        className={cn(
                          "block overflow-hidden rounded-sm bg-bg outline outline-1 -outline-offset-1 transition-[outline-color] duration-150",
                          s.id === shot?.id
                            ? "outline-accent"
                            : "outline-transparent hover:outline-border",
                        )}
                      >
                        <img
                          src={s.dataUrl}
                          alt=""
                          className="aspect-4/3 w-full object-cover"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </section>
  );
}

function EmptyStage({
  onCapture,
  onSample,
}: {
  onCapture: () => void;
  onSample: () => void;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-4 px-6 py-16 text-center sm:min-h-96">
      <div className="relative size-24">
        <span className="absolute inset-3 rounded-sm border border-dashed border-border" />
        <span className="absolute left-3 top-3 size-2.5 border-t-2 border-l-2 border-accent" />
        <span className="absolute right-3 top-3 size-2.5 border-t-2 border-r-2 border-accent" />
        <span className="absolute bottom-3 left-3 size-2.5 border-b-2 border-l-2 border-accent" />
        <span className="absolute bottom-3 right-3 size-2.5 border-b-2 border-r-2 border-accent" />
      </div>
      <div>
        <p className="text-sm font-medium text-fg">Drop a shot, or take one</p>
        <p className="mt-1 max-w-xs text-sm text-muted">
          Screen share, paste from the system clipboard, or load the sample editor error.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button size="sm" onClick={onCapture}>
          Capture
        </Button>
        <Button size="sm" variant="secondary" onClick={onSample}>
          Load sample
        </Button>
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-xs border border-border bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-muted">
      {children}
    </kbd>
  );
}
