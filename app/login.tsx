import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { supabase } from "../src/lib/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      Alert.alert(
        "Missing information",
        "Please enter your email and password."
      );

      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        Alert.alert("Unable to sign in", error.message);
        return;
      }

      router.replace("/(tabs)/today");
    } catch {
      Alert.alert(
        "Something went wrong",
        "We couldn't sign you in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹ Back</Text>
          </Pressable>

          <Text style={styles.symbol}>☾</Text>

          <Text style={styles.title}>Welcome Back</Text>

          <Text style={styles.subtitle}>
            Return to your private space.
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>

            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#6F6780"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Your password"
              placeholderTextColor="#6F6780"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Enter SoulPath
                </Text>
              )}
            </Pressable>
          </View>

          <Pressable onPress={() => router.replace("/register")}>
            <Text style={styles.createAccountText}>
              New to SoulPath?{" "}
              <Text style={styles.createAccountLink}>
                Create an account
              </Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C0A18",
  },

  keyboardContainer: {
    flex: 1,
  },

  content: {
    flex: 1,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingHorizontal: 28,
    justifyContent: "center",
  },

  backButton: {
    position: "absolute",
    top: 20,
    left: 28,
  },

  backText: {
    color: "#B9AED0",
    fontSize: 16,
  },

  symbol: {
    fontSize: 54,
    color: "#D9C6FF",
    textAlign: "center",
    marginBottom: 16,
  },

  title: {
    color: "#F6F0FF",
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
  },

  subtitle: {
    color: "#9D94B5",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 32,
  },

  form: {
    gap: 10,
  },

  label: {
    color: "#D9C6FF",
    fontWeight: "600",
    fontSize: 14,
    marginTop: 4,
  },

  input: {
    backgroundColor: "#171329",
    borderWidth: 1,
    borderColor: "#39304F",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    color: "#F6F0FF",
    fontSize: 16,
  },

  primaryButton: {
    backgroundColor: "#7357C7",
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 18,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  buttonPressed: {
    opacity: 0.85,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  createAccountText: {
    color: "#8D849F",
    textAlign: "center",
    marginTop: 26,
  },

  createAccountLink: {
    color: "#D9C6FF",
    fontWeight: "700",
  },
}); 
