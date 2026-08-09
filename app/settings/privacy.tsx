import { router } from "expo-router";

import {
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { supabase } from "../../src/lib/supabase";

export default function PrivacySettingsScreen() {
  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  async function changePassword() {
    setErrorMessage("");
    setSuccessMessage("");

    if (password.length < 8) {
      setErrorMessage(
        "Use at least 8 characters for your new password."
      );

      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        "The passwords do not match."
      );

      return;
    }

    try {
      setSaving(true);

      const {
        error,
      } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      setPassword("");
      setConfirmPassword("");

      setSuccessMessage(
        "Your password has been updated."
      );
    } catch (error) {
      console.error(
        "Unable to change password:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to change your password."
      );
    } finally {
      setSaving(false);
    }
  }

  async function signOutCurrentSession() {
    try {
      const {
        error,
      } = await supabase.auth.signOut({
        scope: "local",
      });

      if (error) {
        throw error;
      }

      router.replace("/");
    } catch (error) {
      console.error(
        "Unable to sign out:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to sign out."
      );
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
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>
            ‹ Settings
          </Text>
        </Pressable>

        <Text style={styles.eyebrow}>
          PRIVACY & SECURITY
        </Text>

        <Text style={styles.title}>
          Protect your space
        </Text>

        <Text style={styles.subtitle}>
          Manage the credentials and session used
          to access your private SoulPath records.
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoSymbol}>
            ◌
          </Text>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Account-specific data
            </Text>

            <Text style={styles.infoText}>
              Journal entries, practices, dreams,
              synchronicities, and insights are
              requested through your authenticated
              account.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Change password
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>
            New password
          </Text>

          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            placeholderTextColor="#70677F"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>
            Confirm new password
          </Text>

          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Enter it again"
            placeholderTextColor="#70677F"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                {errorMessage}
              </Text>
            </View>
          ) : null}

          {successMessage ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>
                {successMessage}
              </Text>
            </View>
          ) : null}

          <Pressable
            style={[
              styles.primaryButton,
              saving && styles.disabledButton,
            ]}
            disabled={saving}
            onPress={changePassword}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>
                Update Password
              </Text>
            )}
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>
          Session
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Sign out of this device
          </Text>

          <Text style={styles.cardText}>
            End the current SoulPath session while
            leaving sessions on your other devices
            alone.
          </Text>

          <Pressable
            style={styles.signOutButton}
            onPress={signOutCurrentSession}
          >
            <Text style={styles.signOutText}>
              Sign Out of This Session
            </Text>
          </Pressable>
        </View>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>
            About password changes
          </Text>

          <Text style={styles.noticeText}>
            For additional protection, Supabase may
            require authentication requirements to be
            satisfied before sensitive account
            changes are accepted.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C0A18",
  },

  content: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 60,
  },

  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    marginBottom: 20,
  },

  backText: {
    color: "#A78DE3",
    fontSize: 15,
    fontWeight: "600",
  },

  eyebrow: {
    color: "#8873B8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
  },

  title: {
    color: "#F5F0FF",
    fontSize: 32,
    fontWeight: "700",
    marginTop: 5,
  },

  subtitle: {
    color: "#8D859A",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 9,
    marginBottom: 28,
  },

  infoCard: {
    backgroundColor: "#181329",
    borderWidth: 1,
    borderColor: "#34294D",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    marginBottom: 30,
  },

  infoSymbol: {
    color: "#D4B866",
    fontSize: 20,
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    color: "#D7CCE7",
    fontSize: 14,
    fontWeight: "700",
  },

  infoText: {
    color: "#857A91",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 5,
  },

  sectionTitle: {
    color: "#DED4E9",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#151126",
    borderWidth: 1,
    borderColor: "#29213D",
    borderRadius: 19,
    padding: 20,
    marginBottom: 28,
  },

  label: {
    color: "#D3C8DF",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 8,
  },

  input: {
    backgroundColor: "#100E1C",
    borderWidth: 1,
    borderColor: "#302847",
    borderRadius: 14,
    color: "#F0E9F8",
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginBottom: 13,
  },

  cardTitle: {
    color: "#E8DEEF",
    fontSize: 17,
    fontWeight: "700",
  },

  cardText: {
    color: "#857A91",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
  },

  primaryButton: {
    backgroundColor: "#7357C7",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 17,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.55,
  },

  signOutButton: {
    borderWidth: 1,
    borderColor: "#553041",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 18,
  },

  signOutText: {
    color: "#D68DA3",
    fontWeight: "700",
  },

  errorBox: {
    backgroundColor: "#2A151E",
    borderWidth: 1,
    borderColor: "#683248",
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },

  errorText: {
    color: "#F1A7B9",
    fontSize: 12,
  },

  successBox: {
    backgroundColor: "#18241D",
    borderWidth: 1,
    borderColor: "#365141",
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },

  successText: {
    color: "#B7D5C1",
    fontSize: 12,
  },

  noticeCard: {
    backgroundColor: "#121020",
    borderWidth: 1,
    borderColor: "#29213D",
    borderRadius: 17,
    padding: 17,
  },

  noticeTitle: {
    color: "#CFC3DB",
    fontWeight: "700",
    fontSize: 13,
  },

  noticeText: {
    color: "#7D7488",
    fontSize: 11,
    lineHeight: 18,
    marginTop: 5,
  },
}); 