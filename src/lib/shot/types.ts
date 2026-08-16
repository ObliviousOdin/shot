export type CopyFormat = "smart" | "image" | "path" | "markdown" | "prompt";

export type CaptureMode = "region" | "window" | "full";

export type ShotRecord = {
  id: string;
  createdAt: number;
  width: number;
  height: number;
  bytes: number;
  filename: string;
  virtualPath: string;
  dataUrl: string;
};

export type ClipboardResult = "both" | "image" | "text";
