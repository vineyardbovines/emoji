import { StyleSheet, Text, View } from "react-native";

type Props = {
  width: number;
  height: number;
  title: string;
  body?: string;
  textColor: string;
  subtextColor: string;
};

export function EmptyRecentsColumn({ width, height, title, body, textColor, subtextColor }: Props) {
  return (
    <View style={[styles.container, { width, height }]}>
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      {body ? <Text style={[styles.body, { color: subtextColor }]}>{body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  body: {
    fontSize: 12,
  },
});
