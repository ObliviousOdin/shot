import { canvasToBlob } from "./image";

export async function captureDisplay(): Promise<Blob> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getDisplayMedia) {
    throw new Error("Screen capture is not supported here");
  }

  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { frameRate: 15 },
    audio: false,
  });

  try {
    const track = stream.getVideoTracks()[0];
    if (!track) throw new Error("No video track");

    const video = document.createElement("video");
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    await video.play();

    if (video.readyState < 2) {
      await new Promise<void>((resolve, reject) => {
        video.onloadeddata = () => resolve();
        video.onerror = () => reject(new Error("Could not start capture"));
      });
    }

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No canvas");
    ctx.drawImage(video, 0, 0, width, height);
    track.stop();
    return canvasToBlob(canvas);
  } finally {
    stream.getTracks().forEach((t) => t.stop());
  }
}

export function fileToBlob(file: File): Promise<Blob> {
  return Promise.resolve(file);
}
