import { router } from "expo-router";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { supabase } from "../src/lib/supabase";

export default function HomeScreen() {
  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (!error) {
      router.replace("/");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.symbol}>✦</Text>

        <Text style={styles.greeting}>
          Welcome to SoulPath
        </Text>

        <Text style={styles.description}>
          Your private reflection space is ready.
        </Text>

        <Pressable
          style={styles.button}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Sign Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C0A18",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },

  symbol: {
    color: "#E4C77D",
    fontSize: 36,
    marginBottom: 20,
  },

  greeting: {
    color: "#F6F0FF",
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
  },

  description: {
    color: "#9D94B5",
    fontSize: 16,
    marginTop: 12,
    textAlign: "center",
  },

  button: {
    marginTop: 34,
    borderWidth: 1,
    borderColor: "#4D426C",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#151126",
  },

  buttonText: {
    color: "#D9C6FF",
    fontSize: 16,
    fontWeight: "600",
  },
}); 