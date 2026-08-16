import type { ClipboardResult } from "./types";

export async function writeSmartClipboard(
  blob: Blob,
  text: string,
): Promise<ClipboardResult> {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    throw new Error("Clipboard is not available in this browser");
  }

  const itemTypes: Record<string, Blob> = {
    "image/png": blob.type === "image/png" ? blob : blob,
    "text/plain": new Blob([text], { type: "text/plain" }),
  };

  try {
    await navigator.clipboard.write([new ClipboardItem(itemTypes)]);
    return "both";
  } catch {
    // Some browsers reject mixed image+text ClipboardItems.
  }

  try {
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob }),
    ]);
    return "image";
  } catch {
    // fall through to text
  }

  await navigator.clipboard.writeText(text);
  return "text";
}

export async function writeText(text: string) {
  if (!navigator.clipboard) throw new Error("Clipboard is not available");
  await navigator.clipboard.writeText(text);
}

export async function writeImage(blob: Blob) {
  if (!navigator.clipboard) throw new Error("Clipboard is not available");
  await navigator.clipboard.write([
    new ClipboardItem({ [blob.type || "image/png"]: blob }),
  ]);
}

export async function readClipboardImage(): Promise<Blob | null> {
  if (!navigator.clipboard?.read) return null;
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      const type = item.types.find((t) => t.startsWith("image/"));
      if (type) return item.getType(type);
    }
  } catch {
    return null;
  }
  return null;
}
