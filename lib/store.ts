import { create } from "zustand";

export type UINote = {
  id: string;
  title: string;
  preview?: string;
  color: string;   // hex
  pinned?: boolean;
  updatedAt: number;
};

type NoteState = {
  notes: UINote[];
  seedOnce: () => void;
  add: (n: Omit<UINote, "id" | "updatedAt">) => string;
  update: (id: string, patch: Partial<UINote>) => void;
  remove: (id: string) => void;
  togglePin: (id: string) => void;
};

const SEED: Omit<UINote, "id" | "updatedAt">[] = [
  { title: "Material Design", preview: "Material design is a foundation upon which apps are built.", color: "#90CAF9" },
  { title: "1175 Borregas Ave Sunnyvale, CA 94089", preview: "", color: "#F48FB1" },
  { title: "Shopping list", preview: "• Eggs\n• Bread\n• Tomatoes\n• Onions", color: "#FFF176" },
  { title: "Drawing by Rocky", preview: "🐧 penguin sketch", color: "#B2EBF2" },
  { title: "Surprise party for Rocky!", preview: "", color: "#FFCC80" },
  { title: "Items for House", preview: "☐ Runner for kitchen\n☐ New lamp", color: "#B3E5FC" },
];

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  seedOnce: () => {
    if (get().notes.length > 0) return;
    const now = Date.now();
    set({
      notes: SEED.map((n, i) => ({
        ...n,
        id: `seed-${i + 1}`,
        updatedAt: now - i * 1000,
        pinned: i === 0 ? true : false,
      })),
    });
  },
  add: (n) => {
    const id = Math.random().toString(36).slice(2);
    set(s => ({ notes: [{ ...n, id, updatedAt: Date.now() }, ...s.notes] }));
    return id;
  },
  update: (id, patch) => {
    set(s => ({
      notes: s.notes.map(n => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)),
    }));
  },
  remove: (id) => set(s => ({ notes: s.notes.filter(n => n.id !== id) })),
  togglePin: (id) => {
    const n = get().notes.find(x => x.id === id);
    if (!n) return;
    set(s => ({
      notes: s.notes
        .map(x => (x.id === id ? { ...x, pinned: !x.pinned, updatedAt: Date.now() } : x))
        // keep pinned toward the top visually later if you want
    }));
  },
}));
