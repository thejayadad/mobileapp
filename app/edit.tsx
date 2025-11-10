import { useNoteStore } from "@/lib/store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { RichEditor, RichToolbar, actions } from "react-native-pell-rich-editor";
import ColorRow from "./_components/ColorRow";

export default function Edit() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { notes, add, update, remove } = useNoteStore();

  const existing = useMemo(() => notes.find(n => n.id === id), [id, notes]);

  // editor ref
  const editorRef = useRef<RichEditor>(null);

  // local form state
  const [title, setTitle] = useState(existing?.title ?? "");
  const [html, setHtml] = useState(existing?.preview ?? ""); 
  const [color, setColor] = useState(existing?.color ?? "#FFE082");
  const [pinned, setPinned] = useState(existing?.pinned ?? false);

  function save() {
    if (existing) {
      update(existing.id, { title, preview: html, color, pinned });
    } else {
      const newId = add({ title, preview: html, color, pinned });
      // optional: navigate to that new ID if you want
    }

    // ✅ correct home navigation
    router.replace("/");
  }

  return (
    <View style={{ flex: 1, backgroundColor: color }}>
      
      {/* ✅ top bar */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 16 }}>
        {/* back */}
        <Pressable onPress={() => router.back()}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </Pressable>

        {/* actions */}
        <View style={{ flexDirection: "row", gap: 20 }}>
          
          {/* pin toggle */}
          <Pressable onPress={() => setPinned(p => !p)}>
            <Text style={{ fontSize: 20 }}>{pinned ? "📌" : "📍"}</Text>
          </Pressable>

          {/* delete */}
          {existing && (
            <Pressable onPress={() => { remove(existing.id); router.replace("/"); }}>
              <Text style={{ fontSize: 20 }}>🗑️</Text>
            </Pressable>
          )}

          {/* save */}
          <Pressable onPress={save}>
            <Text style={{ fontSize: 20 }}>✅</Text>
          </Pressable>
        </View>
      </View>

      {/* ✅ editor + form */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        
        <TextInput
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          style={{
            fontSize: 22,
            fontWeight: "700",
            marginBottom: 12,
          }}
        />

        {/* ✅ rich editor */}
        <View style={{ backgroundColor: "white", borderRadius: 10, overflow: "hidden" }}>
          <RichToolbar
            editor={editorRef}
            actions={[
              actions.setBold,
              actions.setItalic,
              actions.heading1,
              actions.insertBulletsList,
              actions.insertOrderedList,
              actions.insertLink,
            ]}
          />
          
          <RichEditor
            ref={editorRef}
            initialContentHTML={html}
            onChange={setHtml}
            placeholder="Start writing..."
            editorStyle={{
              backgroundColor: "white",
              cssText: "padding:12px;font-size:16px;",
            }}
            style={{ minHeight: 260 }}
          />
        </View>

        <View style={{ height: 20 }} />

        {/* ✅ color picker */}
        <ColorRow value={color} onChange={setColor} />

      </ScrollView>
    </View>
  );
}
