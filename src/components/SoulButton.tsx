import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";

import {
  colors,
  fonts,
  radius,
  spacing,
} from "../theme";

type Variant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost";

type Props = {
  title: string;

  onPress: () => void;

  loading?: boolean;

  disabled?: boolean;

  variant?: Variant;

  accessibilityLabel?: string;

  accessibilityHint?: string;
};

export default function SoulButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  accessibilityLabel,
  accessibilityHint,
}: Props) {
  const inactive =
    disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ??
        title
      }
      accessibilityHint={
        accessibilityHint
      }
      accessibilityState={{
        disabled:
          inactive,

        busy:
          loading,
      }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,

        variant === "primary" &&
          styles.primary,

        variant === "secondary" &&
          styles.secondary,

        variant === "danger" &&
          styles.danger,

        variant === "ghost" &&
          styles.ghost,

        pressed &&
          !inactive &&
          styles.pressed,

        inactive &&
          styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === "primary"
              ? colors.white
              : variant === "danger"
                ? colors.errorText
                : colors.lavender
          }
        />
      ) : (
        <Text
          style={[
            styles.text,

            variant === "primary" &&
              styles.primaryText,

            variant === "secondary" &&
              styles.secondaryText,

            variant === "danger" &&
              styles.dangerText,

            variant === "ghost" &&
              styles.ghostText,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,

    minWidth: 48,

    borderRadius:
      radius.md,

    paddingHorizontal:
      spacing.xl,

    paddingVertical:
      spacing.md,

    justifyContent:
      "center",

    alignItems:
      "center",
  },

  primary: {
    backgroundColor:
      colors.purple,
  },

  secondary: {
    backgroundColor:
      colors.surfaceRaised,

    borderWidth: 1,

    borderColor:
      colors.borderStrong,
  },

  danger: {
    backgroundColor:
      colors.errorBackground,

    borderWidth: 1,

    borderColor:
      colors.errorBorder,
  },

  ghost: {
    backgroundColor:
      "transparent",
  },

  text: {
    fontFamily:
      fonts.bodyBold,

    fontSize: 14,

    lineHeight: 19,

    textAlign:
      "center",
  },

  primaryText: {
    color: colors.white,
  },

  secondaryText: {
    color:
      colors.lavender,
  },

  dangerText: {
    color:
      colors.errorText,
  },

  ghostText: {
    color:
      colors.lavender,
  },

  pressed: {
    opacity: 0.78,
  },

  disabled: {
    opacity: 0.48,
  },
}); 