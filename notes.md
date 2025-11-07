

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


 ### SETUP ZUSTAND ###
 - We’ll create a tiny store, seed it with your mock notes once, and have Home read from the store. No persistence yet (we’ll add AsyncStorage in Step 3).

 ```
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

 ```

 - update the homepage with the new layout

 ```
import { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TextInput, FlatList } from "react-native";
import NoteCard from "@/components/NoteCard";
import { useNoteStore } from "@/lib/store";

export default function Home() {
  const { notes, seedOnce } = useNoteStore();
  const [q, setQ] = useState("");

  useEffect(() => {
    seedOnce();
  }, [seedOnce]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const data = s
      ? notes.filter(n =>
          n.title.toLowerCase().includes(s) ||
          (n.preview || "").toLowerCase().includes(s)
        )
      : notes;

    return {
      pinned: data.filter(n => n.pinned),
      others: data.filter(n => !n.pinned),
    };
  }, [notes, q]);

  const renderSection = (label: string, items: typeof notes) => (
    <View style={{ gap: 10 }}>
      {items.length > 0 && (
        <Text style={{ fontWeight: "700", opacity: 0.6 }}>{label}</Text>
      )}
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => <NoteCard note={item} />}
      />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      {/* search */}
      <View style={{
        backgroundColor: "#F2F2F4",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 12
      }}>
        <TextInput
          placeholder="Search your notes"
          value={q}
          onChangeText={setQ}
          style={{ fontSize: 16 }}
        />
      </View>

      <FlatList
        data={[{ key: "pinned" }, { key: "others" }]}
        keyExtractor={(i) => i.key}
        renderItem={({ item }) =>
          item.key === "pinned"
            ? renderSection("PINNED", filtered.pinned)
            : renderSection("NOTES", filtered.others)
        }
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      />
    </SafeAreaView>
  );
}

 ```

 - update the note card with the ability to pin or unpin

 