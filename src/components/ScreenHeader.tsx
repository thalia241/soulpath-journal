import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  colors,
  fonts,
  fontSizes,
  spacing,
} from "../theme";

type Props = {
  title: string;
  subtitle?: string;
  symbol?: string;
};

export default function ScreenHeader({
  title,
  subtitle,
  symbol,
}: Props) {
  return (
    <View style={styles.container}>
      {symbol ? (
        <Text style={styles.symbol}>
          {symbol}
        </Text>
      ) : null}

      <Text style={styles.title}>
        {title}
      </Text>

      {subtitle ? (
        <Text style={styles.subtitle}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xxl,
  },

  symbol: {
    color: colors.gold,
    fontSize: 18,
    marginBottom: spacing.sm,
  },

  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: fontSizes.display,
    lineHeight: 42,
  },

  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
}); 