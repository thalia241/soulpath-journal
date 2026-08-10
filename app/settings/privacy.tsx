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

import SoulButton from "../../src/components/SoulButton";
import SoulCard from "../../src/components/SoulCard";
import SoulInput from "../../src/components/SoulInput";
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
    useState<FormErrors>({});

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

  function validateForm(): boolean {
    const nextErrors:
      FormErrors = {};

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
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
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

        <SoulCard>
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

        <SoulCard>
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

                setFormError(
                  ""
                );

                setSuccessMessage(
                  ""
                );
              }}
              placeholder="At least 8 characters"
              secureTextEntry
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

                setFormError(
                  ""
                );

                setSuccessMessage(
                  ""
                );
              }}
              placeholder="Repeat your new password"
              secureTextEntry
              autoCapitalize="none"
              editable={!saving}
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
              styles.buttonSpacing
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
      maxWidth: 650,
      alignSelf: "center",
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 60,
      gap: 15,
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
      marginBottom: 10,
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
      marginTop: 6,
    },

    cardText: {
      color:
        colors.textMuted,
      fontFamily: fonts.body,
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
      marginTop: 12,
    },

    form: {
      gap: 15,
    },

    buttonSpacing: {
      marginTop: 18,
    },
  }); 