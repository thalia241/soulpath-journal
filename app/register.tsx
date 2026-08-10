import {
  router,
} from "expo-router";

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

import {
  useUnsavedChangesGuard,
} from "../src/hooks/useUnsavedChangesGuard";

import {
  validateDisplayName,
  validateEmail,
  validateMatchingPasswords,
  validatePassword,
} from "../src/utils/validation";

type FormErrors = {
  displayName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

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
    errors,
    setErrors,
  ] =
    useState<FormErrors>({});

  const [
    formError,
    setFormError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    dirty,
    setDirty,
  ] = useState(false);

  useUnsavedChangesGuard(
    dirty &&
      !loading &&
      !successMessage,
    {
      title:
        "Leave your setup?",
      message:
        "Your account details haven't been submitted yet.",
    }
  );

  function clearFieldError(
    field:
      keyof FormErrors
  ) {
    setErrors(
      (current) => ({
        ...current,
        [field]: undefined,
      })
    );
  }

  function validateForm(): boolean {
    const nextErrors:
      FormErrors = {};

    const nameResult =
      validateDisplayName(
        displayName
      );

    if (!nameResult.valid) {
      nextErrors.displayName =
        nameResult.message;
    }

    const emailResult =
      validateEmail(email);

    if (!emailResult.valid) {
      nextErrors.email =
        emailResult.message;
    }

    const passwordResult =
      validatePassword(
        password
      );

    if (
      !passwordResult.valid
    ) {
      nextErrors.password =
        passwordResult.message;
    }

    const matchResult =
      validateMatchingPasswords(
        password,
        confirmPassword
      );

    if (
      !matchResult.valid
    ) {
      nextErrors.confirmPassword =
        matchResult.message;
    }

    setErrors(nextErrors);

    return (
      Object.keys(
        nextErrors
      ).length === 0
    );
  }

  async function handleRegister() {
    if (loading) {
      return;
    }

    setFormError("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    const name =
      displayName.trim();

    const cleanEmail =
      email
        .trim()
        .toLowerCase();

    try {
      setLoading(true);

      const {
        data,
        error,
      } =
        await supabase.auth.signUp(
          {
            email:
              cleanEmail,

            password,

            options: {
              data: {
                display_name:
                  name,
              },
            },
          }
        );

      if (error) {
        throw error;
      }

      setDirty(false);

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

      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to create your SoulPath."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        <Pressable
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

        <Text
          style={styles.symbol}
        >
          ✦
        </Text>

        <Text
          style={styles.title}
        >
          Begin your SoulPath
        </Text>

        <Text
          style={styles.subtitle}
        >
          Make a quiet place for
          whatever you're becoming,
          remembering, or learning
          to notice.
        </Text>

        <View
          style={styles.form}
        >
          <SoulInput
            label="What should we call you?"
            value={displayName}
            onChangeText={(
              value
            ) => {
              setDisplayName(
                value
              );

              setDirty(true);

              clearFieldError(
                "displayName"
              );
            }}
            placeholder="Display name"
            autoCapitalize="words"
            maxLength={60}
            editable={!loading}
            error={
              errors.displayName
            }
          />

          <SoulInput
            label="Email"
            value={email}
            onChangeText={(
              value
            ) => {
              setEmail(value);

              setDirty(true);

              clearFieldError(
                "email"
              );
            }}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
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

              setDirty(true);

              clearFieldError(
                "password"
              );

              clearFieldError(
                "confirmPassword"
              );
            }}
            placeholder="At least 8 characters"
            secureTextEntry
            autoCapitalize="none"
            editable={!loading}
            error={
              errors.password
            }
          />

          <SoulInput
            label="One more time"
            value={
              confirmPassword
            }
            onChangeText={(
              value
            ) => {
              setConfirmPassword(
                value
              );

              setDirty(true);

              clearFieldError(
                "confirmPassword"
              );
            }}
            placeholder="Repeat your password"
            secureTextEntry
            autoCapitalize="none"
            editable={!loading}
            error={
              errors.confirmPassword
            }
          />

          {formError ? (
            <FeedbackMessage
              type="error"
              message={formError}
            />
          ) : null}

          {successMessage ? (
            <>
              <FeedbackMessage
                message={
                  successMessage
                }
              />

              <SoulButton
                title="Go to sign in"
                variant="secondary"
                onPress={() => {
                  setDirty(false);

                  router.replace(
                    "/login"
                  );
                }}
              />
            </>
          ) : (
            <SoulButton
              title="Create my SoulPath"
              loading={loading}
              disabled={loading}
              onPress={
                handleRegister
              }
            />
          )}
        </View>

        <Text
          style={styles.privacy}
        >
          Your journal is intended
          to be private to your
          authenticated account.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        colors.background,
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
      alignSelf:
        "flex-start",
      paddingVertical: 8,
    },

    backText: {
      color:
        colors.lavender,
      fontFamily:
        fonts.bodySemiBold,
      fontSize: 12,
    },

    symbol: {
      color: colors.gold,
      fontSize: 30,
      marginTop: 26,
    },

    title: {
      color: colors.text,
      fontFamily:
        fonts.display,
      fontSize: 41,
      lineHeight: 45,
      marginTop: 10,
    },

    subtitle: {
      color:
        colors.textMuted,
      fontFamily:
        fonts.displayItalic,
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