 import NoteCard from "@/app/_components/NoteCard";
import { useNoteStore } from "@/lib/store";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FAB from "./_components/Fab";

const COLORS = ["#FFE082","#FFAB91","#80DEEA","#CF93D9","#A5D6A7","#FFF59D","#F8BBD0","#B39DDB","#90CAF9","#FFCC80","#B2EBF2","#B3E5FC"];
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export default function Home() {
  const { notes, seedOnce, add } = useNoteStore();
  const [q, setQ] = useState("");
const router= useRouter()
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
    router.push({pathname: "/edit", params: {id}})    // stays on Home for now; we’ll push to an editor screen in Step 4
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
