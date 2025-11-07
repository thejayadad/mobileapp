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
