import { UINote, useNoteStore } from "@/lib/store";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function NoteCard({ note, onPress }: { note: UINote; onPress?: () => void }) {
  const togglePin = useNoteStore(s => s.togglePin);

  return (
    <Pressable onPress={onPress} style={[styles.card, { backgroundColor: note.color }]}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
        {!!note.title && <Text style={styles.title} numberOfLines={2}>{note.title}</Text>}
        <Pressable onPress={() => togglePin(note.id)}>
          <Text>{note.pinned ? "📌" : "📍"}</Text>
        </Pressable>
      </View>
      {!!note.preview && <Text numberOfLines={5} style={styles.body}>{note.preview}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    gap: 6,
    flex: 1,
  },
  title: { fontSize: 16, fontWeight: "700", flex: 1 },
  body: { fontSize: 14, lineHeight: 18 },
});
