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
};

export default function SoulButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
}: Props) {
  const inactive =
    disabled || loading;

  return (
    <Pressable
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
          color={
            variant === "primary"
              ? colors.white
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
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },

  primary: {
    backgroundColor: colors.purple,
  },

  secondary: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },

  danger: {
    backgroundColor: colors.errorBackground,
    borderWidth: 1,
    borderColor: colors.errorBorder,
  },

  ghost: {
    backgroundColor: "transparent",
  },

  text: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },

  primaryText: {
    color: colors.white,
  },

  secondaryText: {
    color: colors.lavender,
  },

  dangerText: {
    color: colors.errorText,
  },

  ghostText: {
    color: colors.lavender,
  },

  pressed: {
    opacity: 0.8,
  },

  disabled: {
    opacity: 0.5,
  },
}); 