import { router } from "expo-router";

import {
  useEffect,
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

import { useAuth } from "../../src/context/AuthContext";
import { supabase } from "../../src/lib/supabase";

export default function ProfileSettingsScreen() {
  const { session } = useAuth();

  const [displayName, setDisplayName] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const email =
    session?.user.email || "";

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "Unable to load your account."
        );
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      setDisplayName(
        profile?.display_name ||
          user.user_metadata?.display_name ||
          ""
      );
    } catch (error) {
      console.error(
        "Unable to load profile:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    const cleanName =
      displayName.trim();

    if (!cleanName) {
      setErrorMessage(
        "Please enter a display name."
      );

      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "You must be signed in to update your profile."
        );
      }

      const {
        error: profileError,
      } = await supabase
        .from("profiles")
        .update({
          display_name: cleanName,
        })
        .eq("id", user.id);

      if (profileError) {
        throw profileError;
      }

      const {
        error: authError,
      } = await supabase.auth.updateUser({
        data: {
          display_name: cleanName,
        },
      });

      if (authError) {
        throw authError;
      }

      setDisplayName(cleanName);

      setSuccessMessage(
        "Your profile has been updated."
      );
    } catch (error) {
      console.error(
        "Unable to save profile:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update your profile."
      );
    } finally {
      setSaving(false);
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
          YOUR ACCOUNT
        </Text>

        <Text style={styles.title}>
          Profile
        </Text>

        <Text style={styles.subtitle}>
          Manage the name that appears throughout
          your SoulPath experience.
        </Text>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            ☾
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#CDB9FF"
            style={styles.loader}
          />
        ) : (
          <>
            <Text style={styles.label}>
              Display name
            </Text>

            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your display name"
              placeholderTextColor="#70677F"
              autoCapitalize="words"
              maxLength={60}
            />

            <Text style={styles.label}>
              Email
            </Text>

            <View style={styles.readonlyInput}>
              <Text style={styles.readonlyText}>
                {email}
              </Text>
            </View>

            <Text style={styles.fieldHint}>
              Email changes are not enabled in this
              version of SoulPath.
            </Text>

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
                styles.saveButton,
                saving && styles.disabledButton,
              ]}
              disabled={saving}
              onPress={saveProfile}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>
                  Save Changes
                </Text>
              )}
            </Pressable>
          </>
        )}
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
    fontSize: 34,
    fontWeight: "700",
    marginTop: 5,
  },

  subtitle: {
    color: "#8D859A",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 9,
  },

  avatar: {
    alignSelf: "center",
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#211A35",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 32,
    borderWidth: 1,
    borderColor: "#3B2F57",
  },

  avatarText: {
    color: "#D9C6FF",
    fontSize: 39,
  },

  loader: {
    marginTop: 30,
  },

  label: {
    color: "#D7CCDF",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 18,
  },

  input: {
    backgroundColor: "#151126",
    borderWidth: 1,
    borderColor: "#302847",
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#F2EDFA",
    fontSize: 15,
  },

  readonlyInput: {
    backgroundColor: "#11101C",
    borderWidth: 1,
    borderColor: "#252039",
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },

  readonlyText: {
    color: "#8A8194",
    fontSize: 15,
  },

  fieldHint: {
    color: "#6F6679",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 7,
  },

  errorBox: {
    backgroundColor: "#2A151E",
    borderWidth: 1,
    borderColor: "#683248",
    borderRadius: 13,
    padding: 13,
    marginTop: 20,
  },

  errorText: {
    color: "#F1A7B9",
    fontSize: 12,
  },

  successBox: {
    backgroundColor: "#18241D",
    borderWidth: 1,
    borderColor: "#365141",
    borderRadius: 13,
    padding: 13,
    marginTop: 20,
  },

  successText: {
    color: "#B7D5C1",
    fontSize: 12,
  },

  saveButton: {
    backgroundColor: "#7357C7",
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 26,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },

  disabledButton: {
    opacity: 0.55,
  },
}); 