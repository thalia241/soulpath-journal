import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
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

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  function showError(text: string) {
    setIsError(true);
    setMessage(text);
  }

  function showSuccess(text: string) {
    setIsError(false);
    setMessage(text);
  }

  async function handleRegister() {
    console.log("Create My SoulPath pressed");

    setMessage("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = displayName.trim();

    if (!cleanName) {
      showError("Please enter your name.");
      return;
    }

    if (!cleanEmail) {
      showError("Please enter your email address.");
      return;
    }

    if (!password) {
      showError("Please enter a password.");
      return;
    }

    if (password.length < 8) {
      showError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      showError("Your passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      console.log("Attempting Supabase signup...");

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            display_name: cleanName,
          },
        },
      });

      console.log("Signup completed");
      console.log("User created:", !!data.user);
      console.log("Session created:", !!data.session);

      if (error) {
        console.error("Signup error:", error);
        showError(error.message);
        return;
      }

      if (!data.user) {
        showError("Account creation did not return a user.");
        return;
      }

      if (!data.session) {
        showSuccess(
          "Your account was created! Check your email to verify your account, then sign in."
        );

        return;
      }

      router.replace("/(tabs)/today");
    } catch (error) {
      console.error("Unexpected registration error:", error);

      showError(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating your account."
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

          <Text style={styles.title}>Begin Your Journey</Text>

          <Text style={styles.subtitle}>
            Create your private SoulPath space.
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Name</Text>

            <TextInput
              style={styles.input}
              placeholder="What should we call you?"
              placeholderTextColor="#6F6780"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Email</Text>

            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#6F6780"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />

            <Text style={styles.label}>Password</Text>

            <TextInput
              style={styles.input}
              placeholder="At least 8 characters"
              placeholderTextColor="#6F6780"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <Text style={styles.label}>Confirm Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your password again"
              placeholderTextColor="#6F6780"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            {message ? (
              <View
                style={[
                  styles.messageBox,
                  isError
                    ? styles.errorMessageBox
                    : styles.successMessageBox,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    isError
                      ? styles.errorText
                      : styles.successText,
                  ]}
                >
                  {message}
                </Text>
              </View>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Create My SoulPath
                </Text>
              )}
            </Pressable>
          </View>

          <Pressable onPress={() => router.replace("/login")}>
            <Text style={styles.signInText}>
              Already have an account?{" "}
              <Text style={styles.signInLink}>
                Sign in
              </Text>
            </Text>
          </Pressable>

          <Text style={styles.privacyText}>
            Your reflections are private and belong to you.
          </Text>
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
    paddingTop: 30,
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
    textAlign: "center",
    fontSize: 54,
    color: "#D9C6FF",
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
    marginBottom: 30,
  },

  form: {
    gap: 10,
  },

  label: {
    color: "#D9C6FF",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },

  input: {
    backgroundColor: "#171329",
    borderColor: "#39304F",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    color: "#F6F0FF",
    fontSize: 16,
  },

  messageBox: {
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },

  errorMessageBox: {
    backgroundColor: "#2A151E",
    borderWidth: 1,
    borderColor: "#683248",
  },

  successMessageBox: {
    backgroundColor: "#14241E",
    borderWidth: 1,
    borderColor: "#315C4B",
  },

  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },

  errorText: {
    color: "#F1A7B9",
  },

  successText: {
    color: "#A9DFC8",
  },

  primaryButton: {
    marginTop: 16,
    backgroundColor: "#7357C7",
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: "center",
  },

  buttonPressed: {
    opacity: 0.85,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  signInText: {
    color: "#8D849F",
    textAlign: "center",
    marginTop: 24,
  },

  signInLink: {
    color: "#D9C6FF",
    fontWeight: "700",
  },

  privacyText: {
    color: "#665F74",
    fontSize: 12,
    textAlign: "center",
    marginTop: 24,
  },
}); 