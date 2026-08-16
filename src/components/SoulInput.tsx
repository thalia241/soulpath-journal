import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import {
  colors,
  fonts,
  radius,
  spacing,
} from "../theme";

type Props =
  TextInputProps & {
    label?: string;

    hint?: string;

    error?: string;
  };

export default function SoulInput({
  label,
  hint,
  error,
  style,
  ...inputProps
}: Props) {
  return (
    <View
      style={
        styles.container
      }
    >
      {label ? (
        <Text
          style={styles.label}
        >
          {label}
        </Text>
      ) : null}

      <TextInput
        {...inputProps}
        accessibilityLabel={
          inputProps.accessibilityLabel ??
          label
        }
        accessibilityHint={
          inputProps.accessibilityHint ??
          hint
        }
        style={[
          styles.input,

          inputProps.multiline &&
            styles.multiline,

          error &&
            styles.inputError,

          style,
        ]}
        placeholderTextColor={
          colors.textDim
        }
        selectionColor={
          colors.lavender
        }
      />

      {error ? (
        <Text
          accessibilityRole="alert"
          style={styles.error}
        >
          {error}
        </Text>
      ) : hint ? (
        <Text
          style={styles.hint}
        >
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      gap: spacing.sm,
    },

    label: {
      color:
        colors.textSoft,

      fontFamily:
        fonts.bodySemiBold,

      fontSize: 13,

      lineHeight: 18,
    },

    input: {
      minHeight: 50,

      backgroundColor:
        colors.surface,

      borderWidth: 1,

      borderColor:
        colors.border,

      borderRadius:
        radius.md,

      paddingHorizontal:
        spacing.lg,

      paddingVertical: 14,

      color:
        colors.text,

      fontFamily:
        fonts.body,

      fontSize: 15,

      lineHeight: 21,
    },

    multiline: {
      minHeight: 120,
    },

    inputError: {
      borderColor:
        colors.errorBorder,
    },

    hint: {
      color:
        colors.textDim,

      fontFamily:
        fonts.body,

      fontSize: 11,

      lineHeight: 17,
    },

    error: {
      color:
        colors.errorText,

      fontFamily:
        fonts.body,

      fontSize: 11,

      lineHeight: 17,
    },
  }); 