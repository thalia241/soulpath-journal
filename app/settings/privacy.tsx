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
    saving,
    setSaving,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  async function changePassword() {
    setErrorMessage("");
    setSuccessMessage("");

    if (
      password.length < 8
    ) {
      setErrorMessage(
        "Your new password needs at least 8 characters."
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
      setSaving(true);

      const { error } =
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

      setSuccessMessage(
        "Your password has been changed."
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to change your password."
      );
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    const { error } =
      await supabase.auth.signOut({
        scope: "local",
      });

    if (error) {
      setErrorMessage(
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
          A private space deserves a
          carefully tended door.
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
            Your records belong to your
            account
          </Text>

          <Text
            style={
              styles.cardText
            }
          >
            Journal entries, spiritual
            practices, dreams, signs,
            and insights are requested
            through your authenticated
            SoulPath session.
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
              onChangeText={
                setPassword
              }
              placeholder="At least 8 characters"
              secureTextEntry
              autoCapitalize="none"
            />

            <SoulInput
              label="One more time"
              value={
                confirmPassword
              }
              onChangeText={
                setConfirmPassword
              }
              placeholder="Repeat your new password"
              secureTextEntry
              autoCapitalize="none"
            />

            {errorMessage ? (
              <FeedbackMessage
                type="error"
                message={
                  errorMessage
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
      alignSelf: "flex-start",
      paddingVertical: 8,
    },

    backText: {
      color: colors.lavender,
      fontFamily:
        fonts.bodySemiBold,
      fontSize: 12,
    },

    title: {
      color: colors.text,
      fontFamily: fonts.display,
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
      fontFamily: fonts.display,
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
      color: colors.textSoft,
      fontFamily: fonts.display,
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