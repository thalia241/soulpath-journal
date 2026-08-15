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

  type?:
    | "success"
    | "error";
};

export default function FeedbackMessage({
  message,
  type = "success",
}: Props) {
  const isError =
    type === "error";

  return (
    <View
      accessibilityRole={
        isError
          ? "alert"
          : undefined
      }
      style={[
        styles.container,

        isError
          ? styles.error
          : styles.success,
      ]}
    >
      <Text
        style={[
          styles.text,

          isError
            ? styles.errorText
            : styles.successText,
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      borderWidth: 1,

      borderRadius:
        radius.md,

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
      fontFamily:
        fonts.body,

      fontSize: 12,

      lineHeight: 18,
    },

    successText: {
      color:
        colors.successText,
    },

    errorText: {
      color:
        colors.errorText,
    },
  }); 