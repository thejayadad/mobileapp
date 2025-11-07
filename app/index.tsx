import NoteCard, { UINote } from "@/app/_components/NoteCard";
import { useMemo, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// temporary mock notes for UI
const MOCK: UINote[] = [
  { id: "1", title: "Material Design", preview: "Material design is a foundation upon which apps are built.", color: "#90CAF9" },
  { id: "2", title: "1175 Borregas Ave Sunnyvale, CA 94089", preview: "", color: "#F48FB1" },
  { id: "3", title: "Shopping list", preview: "• Eggs\n• Bread\n• Tomatoes\n• Onions", color: "#FFF176" },
  { id: "4", title: "Drawing by Rocky", preview: "🐧 penguin sketch", color: "#B2EBF2" },
  { id: "5", title: "Surprise party for Rocky!", preview: "", color: "#FFCC80" },
  { id: "6", title: "Items for House", preview: "☐ Runner for kitchen\n☐ New lamp", color: "#B3E5FC" },
];

export default function Home() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return MOCK;
    return MOCK.filter(n =>
      n.title.toLowerCase().includes(s) ||
      (n.preview || "").toLowerCase().includes(s)
    );
  }, [q]);

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      {/* search bar */}
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

      {/* header (optional) */}
      <Text style={{ fontWeight: "700", opacity: 0.6, marginBottom: 8 }}>NOTES</Text>

      {/* 2-column grid */}
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => <NoteCard note={item} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </SafeAreaView>
  );
}
