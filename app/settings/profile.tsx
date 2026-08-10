import {
  router,
} from "expo-router";

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
  View,
} from "react-native";

import SoulButton from "../../src/components/SoulButton";
import SoulInput from "../../src/components/SoulInput";
import FeedbackMessage from "../../src/components/FeedbackMessage";

import {
  colors,
  fonts,
  radius,
} from "../../src/theme";

import {
  useAuth,
} from "../../src/context/AuthContext";

import {
  supabase,
} from "../../src/lib/supabase";

import {
  useUnsavedChangesGuard,
} from "../../src/hooks/useUnsavedChangesGuard";

import {
  validateDisplayName,
} from "../../src/utils/validation";

export default function ProfileSettingsScreen() {
  const { session } =
    useAuth();

  const [
    displayName,
    setDisplayName,
  ] = useState("");

  const [
    originalName,
    setOriginalName,
  ] = useState("");

  const [
    nameError,
    setNameError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

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

  const email =
    session?.user.email ||
    "";

  const dirty =
    !loading &&
    displayName.trim() !==
      originalName.trim();

  useUnsavedChangesGuard(
    dirty && !saving,
    {
      title:
        "Leave your profile changes?",
      message:
        "Your new display name hasn't been saved yet.",
    }
  );

  useEffect(() => {
    void loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setFormError("");

      const {
        data: {
          user,
        },
        error,
      } =
        await supabase.auth.getUser();

      if (
        error ||
        !user
      ) {
        throw new Error(
          "Unable to open your profile."
        );
      }

      const {
        data,
        error:
          profileError,
      } = await supabase
        .from("profiles")
        .select(
          "display_name"
        )
        .eq(
          "id",
          user.id
        )
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      const initialName =
        data?.display_name ||
        user.user_metadata
          ?.display_name ||
        "";

      setDisplayName(
        initialName
      );

      setOriginalName(
        initialName
      );
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    if (
      saving ||
      !dirty
    ) {
      return;
    }

    setNameError("");
    setFormError("");
    setSuccessMessage("");

    const result =
      validateDisplayName(
        displayName
      );

    if (!result.valid) {
      setNameError(
        result.message
      );

      return;
    }

    const cleanName =
      displayName.trim();

    try {
      setSaving(true);

      const {
        data: {
          user,
        },
        error,
      } =
        await supabase.auth.getUser();

      if (
        error ||
        !user
      ) {
        throw new Error(
          "Your session could not be found."
        );
      }

      const {
        error:
          profileError,
      } = await supabase
        .from("profiles")
        .update({
          display_name:
            cleanName,
        })
        .eq(
          "id",
          user.id
        );

      if (profileError) {
        throw profileError;
      }

      const {
        error:
          authError,
      } =
        await supabase.auth.updateUser(
          {
            data: {
              display_name:
                cleanName,
            },
          }
        );

      if (authError) {
        throw authError;
      }

      setDisplayName(
        cleanName
      );

      setOriginalName(
        cleanName
      );

      setSuccessMessage(
        "Your name has been saved."
      );
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to save your changes."
      );
    } finally {
      setSaving(false);
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
          Profile
        </Text>

        <Text
          style={styles.subtitle}
        >
          A small piece of you that
          SoulPath carries from page
          to page.
        </Text>

        <View
          style={styles.avatar}
        >
          <Text
            style={
              styles.avatarText
            }
          >
            ☾
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator
            color={
              colors.lavender
            }
          />
        ) : (
          <>
            <SoulInput
              label="What should we call you?"
              value={displayName}
              onChangeText={(
                value
              ) => {
                setDisplayName(
                  value
                );

                setNameError("");

                setFormError("");

                setSuccessMessage(
                  ""
                );
              }}
              placeholder="Display name"
              maxLength={60}
              autoCapitalize="words"
              editable={!saving}
              error={nameError}
            />

            <View
              style={
                styles.emailArea
              }
            >
              <Text
                style={
                  styles.label
                }
              >
                Email
              </Text>

              <View
                style={
                  styles.readOnly
                }
              >
                <Text
                  style={
                    styles.email
                  }
                >
                  {email}
                </Text>
              </View>

              <Text
                style={
                  styles.hint
                }
              >
                Email changes aren't
                part of this version
                of SoulPath yet.
              </Text>
            </View>

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

            <View
              style={
                styles.action
              }
            >
              <SoulButton
                title={
                  dirty
                    ? "Save changes"
                    : "Everything is saved"
                }
                loading={saving}
                disabled={
                  saving ||
                  !dirty
                }
                onPress={
                  saveProfile
                }
              />
            </View>
          </>
        )}
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
      fontSize: 39,
      marginTop: 5,
    },

    subtitle: {
      color:
        colors.textMuted,
      fontFamily:
        fonts.displayItalic,
      fontSize: 17,
      lineHeight: 23,
    },

    avatar: {
      alignSelf: "center",
      width: 82,
      height: 82,
      borderRadius: 41,
      backgroundColor:
        colors.surfaceRaised,
      justifyContent:
        "center",
      alignItems: "center",
      marginVertical: 19,
      borderWidth: 1,
      borderColor:
        colors.border,
    },

    avatarText: {
      color: colors.gold,
      fontSize: 38,
    },

    emailArea: {
      marginTop: 8,
    },

    label: {
      color:
        colors.textSoft,
      fontFamily:
        fonts.bodySemiBold,
      fontSize: 13,
      marginBottom: 8,
    },

    readOnly: {
      backgroundColor:
        colors.backgroundSoft,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.md,
      padding: 15,
    },

    email: {
      color:
        colors.textMuted,
      fontFamily:
        fonts.body,
      fontSize: 14,
    },

    hint: {
      color: colors.textDim,
      fontFamily:
        fonts.body,
      fontSize: 10,
      marginTop: 6,
    },

    action: {
      marginTop: 8,
    },
  }); 