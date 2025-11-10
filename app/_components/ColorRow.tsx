import { Pressable, View } from "react-native";
const COLORS = ["#FFE082","#FFAB91","#80DEEA","#CF93D9","#A5D6A7","#FFF59D","#F8BBD0","#B39DDB","#90CAF9","#FFCC80","#B2EBF2","#B3E5FC"];
export { COLORS };

export default function ColorRow({ value, onChange }:{ value:string; onChange:(c:string)=>void }) {
  return (
    <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
      {COLORS.map(c => (
        <Pressable
          key={c}
          onPress={() => onChange(c)}
          style={{
            width: 28, height: 28, borderRadius: 14, backgroundColor: c,
            borderWidth: value === c ? 2 : 0, borderColor: "#333"
          }}
        />
      ))}
    </View>
  );
}
