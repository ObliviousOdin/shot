export function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function stamp(d = new Date()) {
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-` +
    `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  );
}

export function makeFilename(d = new Date()) {
  return `shot-${stamp(d)}.png`;
}

export function makeVirtualPath(filename: string) {
  return `/tmp/${filename}`;
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatClock(ts: number) {
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function markdownFor(path: string, width: number, height: number) {
  return `![screenshot ${width}×${height}](${path})`;
}

export function promptFor(shot: {
  virtualPath: string;
  width: number;
  height: number;
  bytes: number;
  filename: string;
}) {
  return [
    `I captured a screenshot.`,
    ``,
    `File: ${shot.virtualPath}`,
    `Size: ${shot.width}×${shot.height}, ${formatBytes(shot.bytes)}`,
    ``,
    `The image is also on the clipboard if you can read it. Otherwise open the file path.`,
  ].join("\n");
}
