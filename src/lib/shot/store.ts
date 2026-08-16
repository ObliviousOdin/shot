import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CopyFormat, ShotRecord } from "./types";
import { makeFilename, makeVirtualPath } from "./format";
import { blobToDataUrl, dataUrlToBlob, measureDataUrl } from "./image";

const MAX_HISTORY = 6;

const memoryStore: Record<string, string> = {};
const ssrSafeStorage = createJSONStorage(() => {
  if (typeof window === "undefined") {
    return {
      getItem: (name: string) => memoryStore[name] ?? null,
      setItem: (name: string, value: string) => {
        memoryStore[name] = value;
      },
      removeItem: (name: string) => {
        delete memoryStore[name];
      },
    };
  }
  return window.localStorage;
});

type ShotState = {
  shots: ShotRecord[];
  activeId: string | null;
  preferredCopy: CopyFormat;
  addFromDataUrl: (dataUrl: string, filename?: string) => Promise<ShotRecord>;
  addFromBlob: (blob: Blob, filename?: string) => Promise<ShotRecord>;
  setActive: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  setPreferredCopy: (format: CopyFormat) => void;
  active: () => ShotRecord | null;
};

export const useShotStore = create<ShotState>()(
  persist(
    (set, get) => ({
      shots: [],
      activeId: null,
      preferredCopy: "smart",
      addFromDataUrl: async (dataUrl, filename) => {
        const { width, height } = await measureDataUrl(dataUrl);
        const blob = await dataUrlToBlob(dataUrl);
        const name = filename ?? makeFilename();
        const record: ShotRecord = {
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          width,
          height,
          bytes: blob.size,
          filename: name,
          virtualPath: makeVirtualPath(name),
          dataUrl,
        };
        set((s) => ({
          shots: [record, ...s.shots].slice(0, MAX_HISTORY),
          activeId: record.id,
        }));
        return record;
      },
      addFromBlob: async (blob, filename) => {
        const dataUrl = await blobToDataUrl(blob);
        return get().addFromDataUrl(dataUrl, filename);
      },
      setActive: (id) => set({ activeId: id }),
      remove: (id) =>
        set((s) => {
          const shots = s.shots.filter((x) => x.id !== id);
          const activeId =
            s.activeId === id ? (shots[0]?.id ?? null) : s.activeId;
          return { shots, activeId };
        }),
      clear: () => set({ shots: [], activeId: null }),
      setPreferredCopy: (preferredCopy) => set({ preferredCopy }),
      active: () => {
        const { shots, activeId } = get();
        return shots.find((s) => s.id === activeId) ?? shots[0] ?? null;
      },
    }),
    {
      name: "shot.history.v1",
      storage: ssrSafeStorage,
      partialize: (s) => ({
        shots: s.shots,
        activeId: s.activeId,
        preferredCopy: s.preferredCopy,
      }),
    },
  ),
);

export function useActiveShot() {
  return useShotStore((s) => s.shots.find((x) => x.id === s.activeId) ?? s.shots[0] ?? null);
}
