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
};

export default function SectionHeading({
  title,
  subtitle,
}: Props) {
  return (
    <View style={styles.container}>
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
    marginBottom: spacing.md,
  },

  title: {
    color: colors.textSoft,
    fontFamily: fonts.display,
    fontSize: fontSizes.section,
  },

  subtitle: {
    color: colors.textDim,
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 3,
  },
});