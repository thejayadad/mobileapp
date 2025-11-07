import { Pressable, StyleSheet, Text } from "react-native";

export type UINote = {
  id: string;
  title: string;
  preview?: string;
  color: string; // hex
};

export default function NoteCard({ note, onPress }: { note: UINote; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.card, { backgroundColor: note.color }]}>
      {!!note.title && <Text style={styles.title}>{note.title}</Text>}
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
  title: { fontSize: 16, fontWeight: "700" },
  body: { fontSize: 14, lineHeight: 18 },
});
