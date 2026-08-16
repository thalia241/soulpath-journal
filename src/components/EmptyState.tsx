import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import SoulButton from "./SoulButton";

import {
  colors,
  fonts,
  radius,
  spacing,
} from "../theme";

type Props = {
  symbol?: string;
  title: string;
  description: string;

  actionTitle?: string;
  onAction?: () => void;
};

export default function EmptyState({
  symbol = "☾",
  title,
  description,
  actionTitle,
  onAction,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.symbol}>
        {symbol}
      </Text>

      <Text style={styles.title}>
        {title}
      </Text>

      <Text style={styles.description}>
        {description}
      </Text>

      {actionTitle && onAction ? (
        <View style={styles.action}>
          <SoulButton
            title={actionTitle}
            onPress={onAction}
            variant="secondary"
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.xxxl,
    alignItems: "center",
  },

  symbol: {
    color: colors.gold,
    fontSize: 31,
  },

  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 23,
    marginTop: spacing.md,
    textAlign: "center",
  },

  description: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: spacing.sm,
  },

  action: {
    marginTop: spacing.xl,
  },
});