import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type CropRect = { x: number; y: number; w: number; h: number };

type Props = {
  naturalWidth: number;
  naturalHeight: number;
  onCommit: (rect: CropRect) => void;
  onCancel: () => void;
  className?: string;
};

export function CropOverlay({
  naturalWidth,
  naturalHeight,
  onCommit,
  onCancel,
  className,
}: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<CropRect | null>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);

  const toNatural = useCallback(
    (clientX: number, clientY: number) => {
      const el = frameRef.current;
      if (!el) return { x: 0, y: 0 };
      const r = el.getBoundingClientRect();
      const nx = ((clientX - r.left) / r.width) * naturalWidth;
      const ny = ((clientY - r.top) / r.height) * naturalHeight;
      return {
        x: Math.min(naturalWidth, Math.max(0, nx)),
        y: Math.min(naturalHeight, Math.max(0, ny)),
      };
    },
    [naturalWidth, naturalHeight],
  );

  function onPointerDown(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const p = toNatural(e.clientX, e.clientY);
    drag.current = p;
    setDraft({ x: p.x, y: p.y, w: 0, h: 0 });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    const p = toNatural(e.clientX, e.clientY);
    const x = Math.min(drag.current.x, p.x);
    const y = Math.min(drag.current.y, p.y);
    setDraft({
      x,
      y,
      w: Math.abs(p.x - drag.current.x),
      h: Math.abs(p.y - drag.current.y),
    });
  }

  function onPointerUp() {
    const d = draft;
    drag.current = null;
    if (d && d.w > 8 && d.h > 8) onCommit(d);
    else setDraft(null);
  }

  const display = draft && draft.w > 2 && draft.h > 2 ? draft : null;

  return (
    <div
      ref={frameRef}
      className={cn("absolute inset-0 cursor-crosshair touch-none", className)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="absolute inset-0 bg-bg/40" />
      {display ? (
        <div
          className="absolute box-border border border-accent shadow-[0_0_0_9999px_rgba(12,12,13,0.55)]"
          style={{
            left: `${(display.x / naturalWidth) * 100}%`,
            top: `${(display.y / naturalHeight) * 100}%`,
            width: `${(display.w / naturalWidth) * 100}%`,
            height: `${(display.h / naturalHeight) * 100}%`,
          }}
        >
          <span className="absolute -top-6 left-0 font-mono text-[11px] tabular-nums text-accent">
            {Math.round(display.w)} × {Math.round(display.h)}
          </span>
          <Corner className="left-0 top-0 -translate-x-px -translate-y-px" />
          <Corner className="right-0 top-0 translate-x-px -translate-y-px rotate-90" />
          <Corner className="bottom-0 right-0 translate-x-px translate-y-px rotate-180" />
          <Corner className="bottom-0 left-0 -translate-x-px translate-y-px -rotate-90" />
        </div>
      ) : (
        <p className="pointer-events-none absolute inset-x-0 top-3 text-center font-mono text-xs text-fg">
          Drag a region · Esc to cancel
        </p>
      )}
      <button
        type="button"
        className="sr-only"
        onClick={onCancel}
        aria-label="Cancel crop"
      />
    </div>
  );
}

function Corner({ className }: { className?: string }) {
  return (
    <span
      className={cn("absolute size-3 border-t-2 border-l-2 border-accent", className)}
      aria-hidden
    />
  );
}
