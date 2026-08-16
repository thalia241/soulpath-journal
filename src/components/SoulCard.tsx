import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import {
  colors,
  radius,
  spacing,
} from "../theme";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function SoulCard({
  children,
  style,
}: Props) {
  return (
    <View
      style={[
        styles.card,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.xxl,
  },
}); 