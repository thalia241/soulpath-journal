import {
  CormorantGaramond_400Regular,
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_600SemiBold,
  useFonts as useCormorantFonts,
} from "@expo-google-fonts/cormorant-garamond";

import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  useFonts as useNunitoFonts,
} from "@expo-google-fonts/nunito";

import {
  Stack,
} from "expo-router";

import {
  StatusBar,
} from "expo-status-bar";

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import {
  AuthProvider,
  useAuth,
} from "../src/context/AuthContext";

import {
  colors,
} from "../src/theme";

function RootNavigator() {
  const {
    session,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <LoadingScreen />
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,

        contentStyle: {
          backgroundColor:
            colors.background,
        },
      }}
    >
      <Stack.Protected
        guard={!session}
      >
        <Stack.Screen
          name="index"
        />

        <Stack.Screen
          name="login"
        />

        <Stack.Screen
          name="register"
        />
      </Stack.Protected>

      <Stack.Protected
        guard={!!session}
      >
        <Stack.Screen
          name="(tabs)"
        />

        <Stack.Screen
          name="home"
        />

        <Stack.Screen
          name="journal/index"
        />

        <Stack.Screen
          name="journal/new"
        />

        <Stack.Screen
          name="journal/[id]"
        />

        <Stack.Screen
          name="journal/edit/[id]"
        />

        <Stack.Screen
          name="experiences/index"
        />

        <Stack.Screen
          name="experiences/new"
        />

        <Stack.Screen
          name="experiences/[id]"
        />

        <Stack.Screen
          name="experiences/edit/[id]"
        />

        <Stack.Screen
          name="settings/profile"
        />

        <Stack.Screen
          name="settings/privacy"
        />

        <Stack.Screen
          name="settings/data"
        />

        <Stack.Screen
          name="settings/about"
        />
      </Stack.Protected>
    </Stack>
  );
}

function LoadingScreen() {
  return (
    <View
      style={
        styles.loadingContainer
      }
    >
      <TextLogo />

      <ActivityIndicator
        size="small"
        color={colors.lavender}
      />
    </View>
  );
}

function TextLogo() {
  const { Text } =
    require("react-native");

  return (
    <Text
      style={styles.loadingSymbol}
    >
      ☾ ✦
    </Text>
  );
}

export default function RootLayout() {
  const [
    cormorantLoaded,
  ] = useCormorantFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_600SemiBold,
  });

  const [
    nunitoLoaded,
  ] = useNunitoFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  const fontsLoaded =
    cormorantLoaded &&
    nunitoLoaded;

  if (!fontsLoaded) {
    return (
      <LoadingScreen />
    );
  }

  return (
    <AuthProvider>
      <StatusBar
        style="light"
      />

      <RootNavigator />
    </AuthProvider>
  );
}

const styles =
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      backgroundColor:
        colors.background,

      alignItems: "center",
      justifyContent: "center",

      gap: 18,
    },

    loadingSymbol: {
      color: colors.gold,
      fontSize: 31,
    },
  }); 