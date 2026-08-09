import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  colors,
  fonts,
  radius,
  spacing,
} from "../theme";

type Props = {
  message: string;
  type?: "success" | "error";
};

export default function FeedbackMessage({
  message,
  type = "success",
}: Props) {
  return (
    <View
      style={[
        styles.container,

        type === "success"
          ? styles.success
          : styles.error,
      ]}
    >
      <Text
        style={[
          styles.text,

          type === "success"
            ? styles.successText
            : styles.errorText,
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },

  success: {
    backgroundColor:
      colors.successBackground,
    borderColor:
      colors.successBorder,
  },

  error: {
    backgroundColor:
      colors.errorBackground,
    borderColor:
      colors.errorBorder,
  },

  text: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
  },

  successText: {
    color: colors.successText,
  },

  errorText: {
    color: colors.errorText,
  },
}); 