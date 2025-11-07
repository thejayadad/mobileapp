

 ### SETUP ###
 -- create the app
 -- go thru docs & do reset

 ### INSTALL DEPENDENCIES ###

 ```
npx create-expo-app keep-clone -t
cd keep-clone
npx expo install expo-router react-native-safe-area-context react-native-screens
npx expo install @react-native-async-storage/async-storage
npm i zustand react-native-pell-rich-editor nanoid


 ```

 ### UPDATE THE LAYOUT ###

 ```
// app/_layout.tsx
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}


 ```

 ### ZUSTAND ###
 ```
// lib/store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { nanoid } from "nanoid/non-secure";

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

 ```

 ### HOMEPAGE ###

 - bring in the import:
 - start with SafeAreaView
 - add the search input
 - add the text after it
 - bring in the header
 - do a flat list 
 -- find it in the docs
 - add alayout data first
 - then the notecard 

 ### SETUP NOTECARD ###
 - got to react native and review flatlist
 - go over the prop items showing the items and design
 - build the notecard component
 - go over pressable
 - build the style
 - show it on screen
 