import {
  router,
} from "expo-router";

import {
  useState,
} from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import SoulButton from "../src/components/SoulButton";
import SoulInput from "../src/components/SoulInput";
import SoulScreen from "../src/components/SoulScreen";
import FeedbackMessage from "../src/components/FeedbackMessage";

import {
  colors,
  fonts,
} from "../src/theme";

import {
  supabase,
} from "../src/lib/supabase";

import {
  validateEmail,
  validateRequiredText,
} from "../src/utils/validation";

type FormErrors = {
  email?: string;

  password?: string;
};

export default function LoginScreen() {
  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    errors,
    setErrors,
  ] =
    useState<FormErrors>(
      {}
    );

  const [
    formError,
    setFormError,
  ] = useState("");

  function validateForm(): boolean {
    const nextErrors:
      FormErrors = {};

    const emailResult =
      validateEmail(email);

    if (!emailResult.valid) {
      nextErrors.email =
        emailResult.message;
    }

    const passwordResult =
      validateRequiredText(
        password,
        "Password"
      );

    if (
      !passwordResult.valid
    ) {
      nextErrors.password =
        passwordResult.message;
    }

    setErrors(nextErrors);

    return (
      Object.keys(
        nextErrors
      ).length === 0
    );
  }

  async function handleLogin() {
    if (loading) {
      return;
    }

    setFormError("");

    if (!validateForm()) {
      return;
    }

    const cleanEmail =
      email
        .trim()
        .toLowerCase();

    try {
      setLoading(true);

      const {
        error,
      } =
        await supabase.auth.signInWithPassword(
          {
            email:
              cleanEmail,

            password,
          }
        );

      if (error) {
        throw error;
      }

      router.replace(
        "/(tabs)/today"
      );
    } catch (error) {
      console.error(
        "Unable to sign in:",
        error
      );

      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to open your SoulPath."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SoulScreen
      keyboard
      contentStyle={
        styles.content
      }
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={styles.back}
        disabled={loading}
        onPress={() =>
          router.back()
        }
      >
        <Text
          style={styles.backText}
        >
          ‹ Back
        </Text>
      </Pressable>

      <View
        style={styles.main}
      >
        <Text
          style={styles.symbol}
        >
          ☾
        </Text>

        <Text
          style={styles.title}
        >
          Welcome back
        </Text>

        <Text
          style={styles.subtitle}
        >
          Your pages have been
          waiting quietly for you.
        </Text>

        <View
          style={styles.form}
        >
          <SoulInput
            label="Email"
            value={email}
            onChangeText={(
              value
            ) => {
              setEmail(value);

              setErrors(
                (current) => ({
                  ...current,
                  email: undefined,
                })
              );

              setFormError("");
            }}
            placeholder="you@example.com"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            returnKeyType="next"
            error={errors.email}
          />

          <SoulInput
            label="Password"
            value={password}
            onChangeText={(
              value
            ) => {
              setPassword(
                value
              );

              setErrors(
                (current) => ({
                  ...current,
                  password:
                    undefined,
                })
              );

              setFormError("");
            }}
            placeholder="Your password"
            secureTextEntry
            textContentType="password"
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            returnKeyType="done"
            onSubmitEditing={() =>
              void handleLogin()
            }
            error={
              errors.password
            }
          />

          {formError ? (
            <FeedbackMessage
              type="error"
              message={formError}
            />
          ) : null}

          <SoulButton
            title="Return to SoulPath"
            loading={loading}
            disabled={loading}
            onPress={
              handleLogin
            }
          />
        </View>

        <View
          style={styles.joinRow}
        >
          <Text
            style={
              styles.joinText
            }
          >
            New to SoulPath?
          </Text>

          <Pressable
            accessibilityRole="button"
            disabled={loading}
            onPress={() =>
              router.replace(
                "/register"
              )
            }
          >
            <Text
              style={
                styles.joinLink
              }
            >
              Begin here
            </Text>
          </Pressable>
        </View>
      </View>
    </SoulScreen>
  );
}

const styles =
  StyleSheet.create({
    content: {
      maxWidth: 560,

      justifyContent:
        "center",

      paddingHorizontal: 28,

      paddingTop: 24,

      paddingBottom: 40,
    },

    back: {
      alignSelf:
        "flex-start",

      paddingVertical: 10,

      paddingHorizontal: 2,
    },

    backText: {
      color:
        colors.lavender,

      fontFamily:
        fonts.bodySemiBold,

      fontSize: 12,
    },

    main: {
      flex: 1,

      justifyContent:
        "center",

      paddingVertical: 30,
    },

    symbol: {
      color: colors.gold,

      fontSize: 36,

      textAlign: "center",
    },

    title: {
      color: colors.text,

      fontFamily:
        fonts.display,

      fontSize: 43,

      lineHeight: 47,

      textAlign: "center",

      marginTop: 14,
    },

    subtitle: {
      color:
        colors.textMuted,

      fontFamily:
        fonts.displayItalic,

      fontSize: 18,

      lineHeight: 24,

      textAlign: "center",

      marginTop: 4,
    },

    form: {
      gap: 17,

      marginTop: 36,
    },

    joinRow: {
      flexDirection: "row",

      flexWrap: "wrap",

      justifyContent:
        "center",

      gap: 5,

      marginTop: 25,
    },

    joinText: {
      color:
        colors.textDim,

      fontFamily:
        fonts.body,

      fontSize: 11,
    },

    joinLink: {
      color:
        colors.lavender,

      fontFamily:
        fonts.bodySemiBold,

      fontSize: 11,
    },
  }); 