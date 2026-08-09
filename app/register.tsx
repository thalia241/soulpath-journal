import { router } from "expo-router";

import {
  useState,
} from "react";

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import SoulButton from "../src/components/SoulButton";
import SoulInput from "../src/components/SoulInput";
import FeedbackMessage from "../src/components/FeedbackMessage";

import {
  colors,
  fonts,
} from "../src/theme";

import {
  supabase,
} from "../src/lib/supabase";

export default function RegisterScreen() {
  const [
    displayName,
    setDisplayName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  async function handleRegister() {
    const name =
      displayName.trim();

    const cleanEmail =
      email.trim().toLowerCase();

    setErrorMessage("");
    setSuccessMessage("");

    if (!name) {
      setErrorMessage(
        "What would you like SoulPath to call you?"
      );
      return;
    }

    if (!cleanEmail) {
      setErrorMessage(
        "Enter an email for your SoulPath account."
      );
      return;
    }

    if (password.length < 8) {
      setErrorMessage(
        "Choose a password with at least 8 characters."
      );
      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setErrorMessage(
        "Those passwords don't match yet."
      );
      return;
    }

    try {
      setLoading(true);

      const {
        data,
        error,
      } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password,

          options: {
            data: {
              display_name: name,
            },
          },
        });

      if (error) {
        throw error;
      }

      if (data.session) {
        router.replace(
          "/(tabs)/today"
        );

        return;
      }

      setSuccessMessage(
        "Your SoulPath has been created. Check your email to confirm your account, then return here to sign in."
      );
    } catch (error) {
      console.error(
        "Unable to register:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create your SoulPath."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={styles.back}
          onPress={() =>
            router.back()
          }
        >
          <Text style={styles.backText}>
            ‹ Back
          </Text>
        </Pressable>

        <Text style={styles.symbol}>
          ✦
        </Text>

        <Text style={styles.title}>
          Begin your SoulPath
        </Text>

        <Text style={styles.subtitle}>
          Make a quiet place for whatever you're
          becoming, remembering, or learning to notice.
        </Text>

        <View style={styles.form}>
          <SoulInput
            label="What should we call you?"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Display name"
            autoCapitalize="words"
            maxLength={60}
          />

          <SoulInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <SoulInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            secureTextEntry
            autoCapitalize="none"
          />

          <SoulInput
            label="One more time"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repeat your password"
            secureTextEntry
            autoCapitalize="none"
          />

          {errorMessage ? (
            <FeedbackMessage
              type="error"
              message={errorMessage}
            />
          ) : null}

          {successMessage ? (
            <>
              <FeedbackMessage
                message={successMessage}
              />

              <SoulButton
                title="Go to sign in"
                variant="secondary"
                onPress={() =>
                  router.replace(
                    "/login"
                  )
                }
              />
            </>
          ) : (
            <SoulButton
              title="Create my SoulPath"
              loading={loading}
              onPress={handleRegister}
            />
          )}
        </View>

        <Text style={styles.privacy}>
          Your journal is intended to be private to
          your authenticated account.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 55,
  },

  back: {
    alignSelf: "flex-start",
    paddingVertical: 8,
  },

  backText: {
    color: colors.lavender,
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
  },

  symbol: {
    color: colors.gold,
    fontSize: 30,
    marginTop: 26,
  },

  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 41,
    lineHeight: 45,
    marginTop: 10,
  },

  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.displayItalic,
    fontSize: 17,
    lineHeight: 24,
    marginTop: 5,
  },

  form: {
    gap: 16,
    marginTop: 31,
  },

  privacy: {
    color: colors.textDim,
    fontFamily: fonts.body,
    fontSize: 9,
    textAlign: "center",
    lineHeight: 15,
    marginTop: 22,
  },
}); 