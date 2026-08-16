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

import SoulButton from "../../src/components/SoulButton";
import SoulCard from "../../src/components/SoulCard";
import SoulInput from "../../src/components/SoulInput";
import SoulScreen from "../../src/components/SoulScreen";
import FeedbackMessage from "../../src/components/FeedbackMessage";

import {
  colors,
  fonts,
} from "../../src/theme";

import {
  supabase,
} from "../../src/lib/supabase";

import {
  useUnsavedChangesGuard,
} from "../../src/hooks/useUnsavedChangesGuard";

import {
  validateMatchingPasswords,
  validatePassword,
} from "../../src/utils/validation";

type FormErrors = {
  password?: string;

  confirmPassword?: string;
};

export default function PrivacySettingsScreen() {
  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    errors,
    setErrors,
  ] =
    useState<FormErrors>(
      {}
    );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    formError,
    setFormError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const dirty =
    password.length > 0 ||
    confirmPassword.length >
      0;

  useUnsavedChangesGuard(
    dirty && !saving,
    {
      title:
        "Leave password changes?",

      message:
        "The password you've entered hasn't been saved.",
    }
  );

  function validateForm() {
    const nextErrors:
      FormErrors = {};

    const pass =
      validatePassword(
        password
      );

    const matching =
      validateMatchingPasswords(
        password,
        confirmPassword
      );

    if (!pass.valid) {
      nextErrors.password =
        pass.message;
    }

    if (!matching.valid) {
      nextErrors.confirmPassword =
        matching.message;
    }

    setErrors(nextErrors);

    return (
      Object.keys(
        nextErrors
      ).length === 0
    );
  }

  async function changePassword() {
    if (saving) {
      return;
    }

    setFormError("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const {
        error,
      } =
        await supabase.auth.updateUser(
          {
            password,
          }
        );

      if (error) {
        throw error;
      }

      setPassword("");
      setConfirmPassword("");
      setErrors({});

      setSuccessMessage(
        "Your password has been changed."
      );
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to change your password."
      );
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    if (
      saving ||
      dirty
    ) {
      return;
    }

    const {
      error,
    } =
      await supabase.auth.signOut(
        {
          scope: "local",
        }
      );

    if (error) {
      setFormError(
        error.message
      );

      return;
    }

    router.replace("/");
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
        accessibilityLabel="Back to settings"
        style={styles.back}
        disabled={saving}
        onPress={() =>
          router.back()
        }
      >
        <Text
          style={styles.backText}
        >
          ‹ Settings
        </Text>
      </Pressable>

      <Text
        style={styles.title}
      >
        Privacy & Security
      </Text>

      <Text
        style={styles.subtitle}
      >
        A private space deserves
        a carefully tended door.
      </Text>

      <SoulCard
        style={styles.card}
      >
        <Text
          style={
            styles.cardSymbol
          }
        >
          ◌
        </Text>

        <Text
          style={
            styles.cardTitle
          }
        >
          Your records belong to
          your account
        </Text>

        <Text
          style={
            styles.cardText
          }
        >
          Journal entries,
          spiritual practices,
          dreams, signs, and
          insights are requested
          through your
          authenticated SoulPath
          session.
        </Text>
      </SoulCard>

      <Text
        style={
          styles.sectionTitle
        }
      >
        Change your password
      </Text>

      <SoulCard
        style={styles.card}
      >
        <View
          style={styles.form}
        >
          <SoulInput
            label="New password"
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

                  confirmPassword:
                    undefined,
                })
              );

              setFormError("");
              setSuccessMessage("");
            }}
            placeholder="At least 8 characters"
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            autoCapitalize="none"
            editable={!saving}
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

              setErrors(
                (current) => ({
                  ...current,

                  confirmPassword:
                    undefined,
                })
              );

              setFormError("");
              setSuccessMessage("");
            }}
            placeholder="Repeat your new password"
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            autoCapitalize="none"
            editable={!saving}
            returnKeyType="done"
            onSubmitEditing={() =>
              void changePassword()
            }
            error={
              errors.confirmPassword
            }
          />

          {formError ? (
            <FeedbackMessage
              type="error"
              message={
                formError
              }
            />
          ) : null}

          {successMessage ? (
            <FeedbackMessage
              message={
                successMessage
              }
            />
          ) : null}

          <SoulButton
            title="Update password"
            loading={saving}
            disabled={
              saving ||
              !dirty
            }
            onPress={
              changePassword
            }
          />
        </View>
      </SoulCard>

      <Text
        style={
          styles.sectionTitle
        }
      >
        This session
      </Text>

      <SoulCard>
        <Text
          style={
            styles.cardTitle
          }
        >
          Ready to leave for now?
        </Text>

        <Text
          style={
            styles.cardText
          }
        >
          Signing out here closes
          this SoulPath session
          without deliberately
          ending sessions on other
          devices.
        </Text>

        <View
          style={
            styles.signOutSpacing
          }
        >
          <SoulButton
            title="Sign out of this session"
            variant="danger"
            disabled={
              saving ||
              dirty
            }
            onPress={signOut}
          />
        </View>
      </SoulCard>
    </SoulScreen>
  );
}

const styles =
  StyleSheet.create({
    content: {
      maxWidth: 650,
    },

    back: {
      alignSelf:
        "flex-start",

      paddingVertical: 10,
    },

    backText: {
      color:
        colors.lavender,

      fontFamily:
        fonts.bodySemiBold,

      fontSize: 12,
    },

    title: {
      color: colors.text,

      fontFamily:
        fonts.display,

      fontSize: 37,

      lineHeight: 41,

      marginTop: 5,
    },

    subtitle: {
      color:
        colors.textMuted,

      fontFamily:
        fonts.displayItalic,

      fontSize: 17,

      lineHeight: 23,

      marginTop: 3,

      marginBottom: 20,
    },

    card: {
      marginBottom: 24,
    },

    cardSymbol: {
      color: colors.gold,

      fontSize: 18,
    },

    cardTitle: {
      color: colors.text,

      fontFamily:
        fonts.display,

      fontSize: 23,

      lineHeight: 27,

      marginTop: 6,
    },

    cardText: {
      color:
        colors.textMuted,

      fontFamily:
        fonts.body,

      fontSize: 12,

      lineHeight: 19,

      marginTop: 7,
    },

    sectionTitle: {
      color:
        colors.textSoft,

      fontFamily:
        fonts.display,

      fontSize: 21,

      marginBottom: 10,
    },

    form: {
      gap: 15,
    },

    signOutSpacing: {
      marginTop: 18,
    },
  }); 