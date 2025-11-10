

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

 ### PERSISTENCE + FAB Quick ADD ###
 
 - We’ll (1) add AsyncStorage-powered persistence to the Zustand store and (2) add a floating “+” button that creates a new empty note (you’ll wire the editor in Step 4).

 - install dependenies

 ```
npx expo install @react-native-async-storage/async-storage

 ```
 - update the store

 ```
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

const COLORS = ["#FFE082","#FFAB91","#80DEEA","#CF93D9","#A5D6A7","#FFF59D","#F8BBD0","#B39DDB","#90CAF9","#FFCC80","#B2EBF2","#B3E5FC"];
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
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
          notes: s.notes.map(x => (x.id === id ? { ...x, pinned: !x.pinned, updatedAt: Date.now() } : x)),
        }));
      },
    }),
    {
      name: "keep-clone",
      storage: createJSONStorage(() => AsyncStorage),
      // migrate or version later if you change schema
    }
  )
);

 ```

 - add the fab component
 - import it in the index.tsx
 - add the function with the alert and pass to FAB

 ```

import { Pressable, Text } from "react-native";

export default function FAB({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        position: "absolute",
        right: 20,
        bottom: 30,
        backgroundColor: "#1976D2",
        borderRadius: 28,
        paddingHorizontal: 18,
        paddingVertical: 14,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 6,
      }}
    >
      <Text style={{ color: "white", fontWeight: "800", fontSize: 18 }}>＋</Text>
    </Pressable>
  );
}

 ```

 - update homepage

 ```
 import NoteCard from "@/app/_components/NoteCard";
import { useNoteStore } from "@/lib/store";
import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FAB from "./_components/Fab";

const COLORS = ["#FFE082","#FFAB91","#80DEEA","#CF93D9","#A5D6A7","#FFF59D","#F8BBD0","#B39DDB","#90CAF9","#FFCC80","#B2EBF2","#B3E5FC"];
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export default function Home() {
  const { notes, seedOnce, add } = useNoteStore();
  const [q, setQ] = useState("");

  useEffect(() => { seedOnce(); }, [seedOnce]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const data = s
      ? notes.filter(n =>
          n.title.toLowerCase().includes(s) ||
          (n.preview || "").toLowerCase().includes(s)
        )
      : notes;
    return { pinned: data.filter(n => n.pinned), others: data.filter(n => !n.pinned) };
  }, [notes, q]);

  function handleQuickAdd() {
    const id = add({
      title: "Untitled",
      preview: "",
      color: pick(COLORS),
      pinned: false,
    });
    Alert.alert("Note created", "Tap to edit in the next step.");
    // stays on Home for now; we’ll push to an editor screen in Step 4
  }

  const renderSection = (label: string, items: typeof notes) => (
    <View style={{ gap: 10 }}>
      {items.length > 0 && <Text style={{ fontWeight: "700", opacity: 0.6 }}>{label}</Text>}
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
      <View style={{ backgroundColor: "#F2F2F4", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 }}>
        <TextInput placeholder="Search your notes" value={q} onChangeText={setQ} style={{ fontSize: 16 }} />
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

      <FAB  onPress={handleQuickAdd} />
    </SafeAreaView>
  );
}


 ```

 ### RICH TEXT EDITOR & EDIT SCREEN ###
 - pull up from the docs
 - install dependencies

 ```
npm i react-native-pell-rich-editor
npx expo install react-native-webview


 ```

 - add ColorRow.tsx components
 - this will be the row for the text editor

 ```
import { useNoteStore } from "@/lib/store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { RichEditor, RichToolbar, actions } from "react-native-pell-rich-editor";
import ColorRow from "./_components/ColorRow";

export default function Edit() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { notes, add, update, remove } = useNoteStore();

  const existing = useMemo(() => notes.find(n => n.id === id), [id, notes]);

  // local form state
  const [title, setTitle]   = useState(existing?.title ?? "");
  const [html, setHtml]     = useState(existing?.preview ?? ""); // we’ll store rich text in preview for now
  const [color, setColor]   = useState(existing?.color ?? "#FFE082");
  const [pinned, setPinned] = useState(existing?.pinned ?? false);

  function save() {
    if (existing) {
      update(existing.id, { title, preview: html, color, pinned });
    } else {
      const newId = add({ title, preview: html, color, pinned });
      // optional: navigate to the created id view; here we just go back
    }
    router.replace("/");
  }

  return (
    <View style={{ flex: 1, backgroundColor: color }}>
      {/* top bar */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 16 }}>
        <Pressable onPress={() => router.back()}><Text>←</Text></Pressable>
        <View style={{ flexDirection: "row", gap: 16 }}>
          <Pressable onPress={() => setPinned(p => !p)}><Text>{pinned ? "📌" : "📍"}</Text></Pressable>
          {existing && (
            <Pressable onPress={() => { remove(existing.id); router.replace("/"); }}>
              <Text>🗑️</Text>
            </Pressable>
          )}
          <Pressable onPress={save}><Text>✅</Text></Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        <TextInput
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          style={{ fontSize: 22, fontWeight: "700", marginBottom: 8 }}
        />

        {/* Rich editor */}
        <View style={{ backgroundColor: "white", borderRadius: 10, overflow: "hidden" }}>
          <RichToolbar
            actions={[actions.setBold, actions.setItalic, actions.insertLink, actions.heading1, actions.insertBulletsList, actions.insertOrderedList]}
            editor={() => editor as any}
          />
          <RichEditor
            ref={(r) => (editor = r!)}
            initialContentHTML={html}
            onChange={setHtml}
            placeholder="Start writing…"
            androidHardwareAccelerationDisabled
            editorStyle={{ backgroundColor: "white", cssText: "padding:12px;font-size:16px;" }}
            style={{ minHeight: 240 }}
          />
        </View>

        <View style={{ height: 16 }} />
        <ColorRow value={color} onChange={setColor} />
      </ScrollView>
    </View>
  );
}
let editor: RichEditor;

 ```

 - edit.tsx screen
 