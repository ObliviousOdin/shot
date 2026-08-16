import { canvasToBlob, blobToDataUrl } from "./image";

/** A realistic in-app sample so the workspace is usable without permissions. */
export async function renderSampleShot(): Promise<{
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
}> {
  const width = 1280;
  const height = 800;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas");

  ctx.fillStyle = "#121214";
  ctx.fillRect(0, 0, width, height);

  // window chrome
  ctx.fillStyle = "#1a1a1e";
  roundRect(ctx, 48, 40, 1184, 720, 12);
  ctx.fill();

  ctx.fillStyle = "#101012";
  roundRect(ctx, 48, 40, 1184, 44, 12);
  ctx.fill();
  ctx.fillRect(48, 60, 1184, 24);

  const dots = ["#c47a72", "#c4a574", "#7f9a78"];
  dots.forEach((c, i) => {
    ctx.beginPath();
    ctx.fillStyle = c;
    ctx.arc(74 + i * 18, 62, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "#8e8e86";
  ctx.font = "500 13px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText("auth.ts — src/lib  ·  TypeScript  ·  3 problems", 160, 66);

  // sidebar
  ctx.fillStyle = "#161618";
  ctx.fillRect(48, 84, 220, 676);

  ctx.fillStyle = "#5e5e58";
  ctx.font = "500 11px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("EXPLORER", 68, 112);

  const files = [
    { name: "src", dim: true },
    { name: "  lib", dim: true },
    { name: "    auth.ts", dim: false },
    { name: "    db.ts", dim: true },
    { name: "  routes", dim: true },
    { name: "    index.tsx", dim: true },
    { name: "package.json", dim: true },
  ];
  files.forEach((f, i) => {
    ctx.fillStyle = f.dim ? "#5e5e58" : "#ecece8";
    ctx.font = `${f.dim ? "400" : "500"} 13px ui-monospace, Menlo, monospace`;
    ctx.fillText(f.name, 68, 144 + i * 26);
  });

  // editor
  ctx.fillStyle = "#0e0e10";
  ctx.fillRect(268, 84, 964, 520);

  const lines: Array<{ n: number; text: string; color: string }> = [
    { n: 41, text: "export async function requireSession() {", color: "#a8a8a2" },
    { n: 42, text: "  const session = await auth.api.getSession({", color: "#a8a8a2" },
    { n: 43, text: "    headers: await headers(),", color: "#a8a8a2" },
    { n: 44, text: "  })", color: "#a8a8a2" },
    { n: 45, text: "  if (!session) {", color: "#ecece8" },
    { n: 46, text: "    throw new HttpError(401, \"Unauthorized\")", color: "#c47a72" },
    { n: 47, text: "  }", color: "#ecece8" },
    { n: 48, text: "  return session.user.id", color: "#7f9a78" },
    { n: 49, text: "}", color: "#a8a8a2" },
  ];

  lines.forEach((line, i) => {
    const y = 130 + i * 28;
    ctx.fillStyle = "#3a3a3c";
    ctx.font = "400 13px ui-monospace, Menlo, monospace";
    ctx.fillText(String(line.n), 292, y);
    ctx.fillStyle = line.color;
    ctx.fillText(line.text, 336, y);
  });

  // squiggle under the error line
  ctx.strokeStyle = "#c47a72";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  const squiggleY = 130 + 5 * 28 + 6;
  for (let x = 336; x < 760; x += 6) {
    ctx.lineTo(x, squiggleY + ((x / 6) % 2 === 0 ? 2 : -2));
  }
  ctx.stroke();

  // problems panel
  ctx.fillStyle = "#141416";
  ctx.fillRect(268, 604, 964, 156);
  ctx.fillStyle = "#2a2a2c";
  ctx.fillRect(268, 604, 964, 1);

  ctx.fillStyle = "#c47a72";
  ctx.font = "500 12px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("PROBLEMS", 292, 632);
  ctx.fillStyle = "#8e8e86";
  ctx.fillText("3", 372, 632);

  ctx.fillStyle = "#c47a72";
  ctx.font = "400 13px ui-monospace, Menlo, monospace";
  ctx.fillText(
    "error TS2554: Expected 1 arguments, but got 2.  auth.ts:46",
    292,
    668,
  );
  ctx.fillStyle = "#c4a574";
  ctx.fillText(
    "warning: HttpError is not exported from '@/lib/http'.  auth.ts:46",
    292,
    696,
  );
  ctx.fillStyle = "#8e8e86";
  ctx.fillText(
    "info: session.user.id is possibly undefined.  auth.ts:48",
    292,
    724,
  );

  const blob = await canvasToBlob(canvas);
  const dataUrl = await blobToDataUrl(blob);
  return { blob, dataUrl, width, height };
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
