import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  useWindowDimensions,
  ViewStyle,
} from "react-native";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { colors } from "../theme";

type Props = {
  children: React.ReactNode;
  keyboard?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  bottomPadding?: number;
  maxWidth?: number;
  showsVerticalScrollIndicator?: boolean;
};

function getHorizontalPadding(width: number) {
  if (width < 350) {
    return 16;
  }

  if (width < 480) {
    return 20;
  }

  if (width < 768) {
    return 24;
  }

  return 32;
}

export default function SoulScreen({
  children,
  keyboard = false,
  contentStyle,
  bottomPadding = 70,
  maxWidth = 720,
  showsVerticalScrollIndicator = false,
}: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const horizontalPadding =
    getHorizontalPadding(width);

  const scrollContent = (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        {
          maxWidth,
          paddingHorizontal:
            horizontalPadding,
          paddingBottom:
            bottomPadding +
            insets.bottom,
        },
        contentStyle,
      ]}
      showsVerticalScrollIndicator={
        showsVerticalScrollIndicator
      }
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={
        Platform.OS === "ios"
          ? "interactive"
          : "on-drag"
      }
      automaticallyAdjustKeyboardInsets={
        false
      }
    >
      {children}
    </ScrollView>
  );

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      {keyboard ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          {scrollContent}
        </KeyboardAvoidingView>
      ) : (
        scrollContent
      )}
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        colors.background,
    },

    flex: {
      flex: 1,
    },

    scroll: {
      flex: 1,
    },

    content: {
      flexGrow: 1,
      width: "100%",
      alignSelf: "center",
      paddingTop: 24,
    },
  }); 