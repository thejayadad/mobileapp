// lib/store.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { nanoid } from "nanoid/non-secure";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ChecklistItem = { id: string; text: string; done: boolean };
export type NoteType = "rich" | "checklist";
export type Note = {
  id: string;
  title: string;
  type: NoteType;
  contentHtml?: string;          // for rich text
  checklist?: ChecklistItem[];   // for checklist
  color: string;                 // hex
  pinned: boolean;
  updatedAt: number;
};

type State = {
  notes: Note[];
  upsert: (n: Partial<Note> & { id?: string }) => string; // returns id
  remove: (id: string) => void;
};

export const useNoteStore = create<State>()(
  persist(
    (set, get) => ({
      notes: [],
      upsert: (payload) => {
        const id = payload.id ?? nanoid();
        const now = Date.now();
        const existing = get().notes.find(n => n.id === id);
        const base: Note = {
          id,
          title: payload.title ?? "",
          type: payload.type ?? "rich",
          contentHtml: payload.contentHtml ?? existing?.contentHtml ?? "",
          checklist: payload.checklist ?? existing?.checklist ?? [],
          color: payload.color ?? existing?.color ?? "#FFE082", // warm yellow
          pinned: payload.pinned ?? existing?.pinned ?? false,
          updatedAt: now,
        };
        set(s => ({
          notes: existing
            ? s.notes.map(n => (n.id === id ? { ...existing, ...base } : n))
            : [{ ...base }, ...s.notes],
        }));
        return id;
      },
      remove: (id) => set(s => ({ notes: s.notes.filter(n => n.id !== id) })),
    }),
    { name: "keep-clone", storage: createJSONStorage(() => AsyncStorage) }
  )
);
