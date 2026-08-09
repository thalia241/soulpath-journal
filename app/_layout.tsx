import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import {
  AuthProvider,
  useAuth,
} from "../src/context/AuthContext";

function RootNavigator() {
  const {
    session,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#D9C6FF"
        />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,

        contentStyle: {
          backgroundColor: "#0C0A18",
        },
      }}
    >
      <Stack.Protected guard={!session}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>

      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />

        <Stack.Screen name="home" />

        <Stack.Screen name="journal/index" />
        <Stack.Screen name="journal/new" />
        <Stack.Screen name="journal/[id]" />
        <Stack.Screen name="journal/edit/[id]" />

        <Stack.Screen name="experiences/index" />
        <Stack.Screen name="experiences/new" />
        <Stack.Screen name="experiences/[id]" />
        <Stack.Screen name="experiences/edit/[id]" />

        <Stack.Screen name="settings/profile" />
        <Stack.Screen name="settings/privacy" />
        <Stack.Screen name="settings/data" />
        <Stack.Screen name="settings/about" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />

      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0C0A18",
  },
}); 