import NoteCard from "@/app/_components/NoteCard";
import { useNoteStore } from "@/lib/store";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
