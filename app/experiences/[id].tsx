import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";

import {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import SoulButton from "../../src/components/SoulButton";
import SoulCard from "../../src/components/SoulCard";
import FeedbackMessage from "../../src/components/FeedbackMessage";

import {
  colors,
  fonts,
  radius,
} from "../../src/theme";

import {
  deleteExperience,
  Experience,
  getExperience,
} from "../../src/services/experienceService";

import {
  classifySoulPathError,
  SoulPathErrorInfo,
} from "../../src/utils/errors";

import {
  formatDateTime,
} from "../../src/utils/date";

export default function ExperienceDetailScreen() {
  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const [
    experience,
    setExperience,
  ] =
    useState<Experience | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    errorInfo,
    setErrorInfo,
  ] =
    useState<SoulPathErrorInfo | null>(
      null
    );

  const loadExperience =
    useCallback(async () => {
      if (!id) {
        setLoading(false);

        setErrorInfo({
          kind: "not_found",
          message:
            "This memory could not be found.",
          retryable: false,
        });

        return;
      }

      try {
        setLoading(true);
        setErrorInfo(null);

        const data =
          await getExperience(
            id
          );

        setExperience(data);
      } catch (error) {
        console.error(
          "Unable to open experience:",
          error
        );

        setExperience(null);

        setErrorInfo(
          classifySoulPathError(
            error
          )
        );
      } finally {
        setLoading(false);
      }
    }, [id]);

  useFocusEffect(
    useCallback(() => {
      void loadExperience();
    }, [loadExperience])
  );

  function requestDelete() {
    const warning =
      "This memory will be permanently removed.";

    if (
      Platform.OS === "web"
    ) {
      const confirmed =
        typeof window !==
          "undefined" &&
        window.confirm(
          `Let this memory go?\n\n${warning}`
        );

      if (confirmed) {
        void removeExperience();
      }

      return;
    }

    Alert.alert(
      "Let this memory go?",
      warning,
      [
        {
          text: "Keep It",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",

          onPress: () =>
            void removeExperience(),
        },
      ]
    );
  }

  async function removeExperience() {
    if (
      !id ||
      deleting
    ) {
      return;
    }

    try {
      setDeleting(true);
      setErrorInfo(null);

      await deleteExperience(
        id
      );

      router.replace(
        "/experiences"
      );
    } catch (error) {
      console.error(
        "Unable to delete experience:",
        error
      );

      setErrorInfo(
        classifySoulPathError(
          error
        )
      );
    } finally {
      setDeleting(false);
    }
  }

  function handleAuthRecovery() {
    router.replace(
      "/login"
    );
  }

  if (loading) {
    return (
      <SafeAreaView
        style={styles.centered}
      >
        <Text
          style={styles.loadingSymbol}
        >
          ☾
        </Text>

        <ActivityIndicator
          color={
            colors.lavender
          }
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Returning to this
          memory...
        </Text>
      </SafeAreaView>
    );
  }

  if (!experience) {
    return (
      <SafeAreaView
        style={styles.centered}
      >
        <Text
          style={
            styles.missingSymbol
          }
        >
          ☾
        </Text>

        <Text
          style={
            styles.missingTitle
          }
        >
          {errorInfo?.kind ===
          "not_found"
            ? "This memory has moved on."
            : "This memory couldn't be opened."}
        </Text>

        <Text
          style={
            styles.missingText
          }
        >
          {errorInfo?.message ??
            "Something unexpected happened."}
        </Text>

        <View
          style={
            styles.recoveryActions
          }
        >
          {errorInfo?.retryable ? (
            <SoulButton
              title="Try again"
              onPress={() =>
                void loadExperience()
              }
            />
          ) : null}

          {errorInfo?.kind ===
          "auth" ? (
            <SoulButton
              title="Return to sign in"
              onPress={
                handleAuthRecovery
              }
            />
          ) : (
            <SoulButton
              title="Back to Dreams & Signs"
              variant="secondary"
              onPress={() =>
                router.replace(
                  "/experiences"
                )
              }
            />
          )}
        </View>
      </SafeAreaView>
    );
  }

  const dream =
    experience.experience_type ===
    "dream";

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
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
            ‹ Dreams & Signs
          </Text>
        </Pressable>

        <Text
          style={styles.symbol}
        >
          {dream ? "☾" : "✦"}
        </Text>

        <Text
          style={styles.type}
        >
          {dream
            ? "A dream remembered"
            : "A synchronicity noticed"}
        </Text>

        <Text
          style={styles.title}
        >
          {experience.title}
        </Text>

        <Text
          style={styles.date}
        >
          {formatDateTime(
            experience.experienced_at
          )}
        </Text>

        {experience.significance_level ? (
          <View
            style={
              styles.significance
            }
          >
            <Text
              style={
                styles.significanceText
              }
            >
              ✦ Stayed with you{" "}
              {
                experience.significance_level
              }
              /5
            </Text>
          </View>
        ) : null}

        <View
          style={styles.divider}
        />

        <Text
          style={
            styles.sectionTitle
          }
        >
          What happened
        </Text>

        <Text
          style={styles.body}
        >
          {experience.description}
        </Text>

        {experience.interpretation ? (
          <SoulCard
            style={
              styles.reflectionCard
            }
          >
            <Text
              style={
                styles.reflectionSymbol
              }
            >
              ✦
            </Text>

            <Text
              style={
                styles.reflectionTitle
              }
            >
              What it brought up
              for you
            </Text>

            <Text
              style={
                styles.reflectionText
              }
            >
              {
                experience.interpretation
              }
            </Text>
          </SoulCard>
        ) : null}

        {errorInfo ? (
          <View
            style={styles.errorArea}
          >
            <FeedbackMessage
              type="error"
              message={
                errorInfo.message
              }
            />

            {errorInfo.retryable ? (
              <Pressable
                onPress={() =>
                  setErrorInfo(
                    null
                  )
                }
              >
                <Text
                  style={
                    styles.dismissError
                  }
                >
                  Dismiss
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <View
          style={styles.actions}
        >
          <SoulButton
            title="Edit this memory"
            onPress={() =>
              router.push({
                pathname:
                  "/experiences/edit/[id]",

                params: {
                  id:
                    experience.id,
                },
              })
            }
          />

          <SoulButton
            title="Back to Dreams & Signs"
            variant="secondary"
            onPress={() =>
              router.replace(
                "/experiences"
              )
            }
          />

          <View
            style={
              styles.deleteSpacing
            }
          >
            <SoulButton
              title="Let this memory go"
              variant="danger"
              loading={deleting}
              disabled={deleting}
              onPress={
                requestDelete
              }
            />
          </View>
        </View>
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

    centered: {
      flex: 1,
      backgroundColor:
        colors.background,
      justifyContent:
        "center",
      alignItems: "center",
      padding: 28,
    },

    content: {
      width: "100%",
      maxWidth: 690,
      alignSelf: "center",
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 65,
    },

    back: {
      alignSelf:
        "flex-start",
      paddingVertical: 8,
      marginBottom: 26,
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
      fontSize: 25,
    },

    type: {
      color:
        colors.lavender,
      fontFamily:
        fonts.bodySemiBold,
      fontSize: 10,
      marginTop: 8,
    },

    title: {
      color: colors.text,
      fontFamily:
        fonts.display,
      fontSize: 41,
      lineHeight: 45,
      marginTop: 5,
    },

    date: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 10,
      marginTop: 7,
    },

    significance: {
      alignSelf:
        "flex-start",
      backgroundColor:
        colors.surfaceRaised,
      borderRadius:
        radius.pill,
      paddingHorizontal: 11,
      paddingVertical: 6,
      marginTop: 14,
    },

    significanceText: {
      color:
        colors.goldSoft,
      fontFamily: fonts.body,
      fontSize: 10,
    },

    divider: {
      height: 1,
      backgroundColor:
        colors.border,
      marginVertical: 29,
    },

    sectionTitle: {
      color: colors.text,
      fontFamily:
        fonts.display,
      fontSize: 23,
    },

    body: {
      color:
        colors.textSoft,
      fontFamily: fonts.body,
      fontSize: 14,
      lineHeight: 24,
      marginTop: 8,
    },

    reflectionCard: {
      backgroundColor:
        "#18122B",
      borderColor:
        colors.borderStrong,
      marginTop: 30,
    },

    reflectionSymbol: {
      color: colors.gold,
      fontSize: 16,
    },

    reflectionTitle: {
      color: colors.text,
      fontFamily:
        fonts.displayItalic,
      fontSize: 22,
      marginTop: 7,
    },

    reflectionText: {
      color:
        colors.textMuted,
      fontFamily: fonts.body,
      fontSize: 12,
      lineHeight: 20,
      marginTop: 8,
    },

    actions: {
      gap: 10,
      marginTop: 30,
    },

    deleteSpacing: {
      marginTop: 7,
    },

    errorArea: {
      marginTop: 24,
      gap: 8,
    },

    dismissError: {
      color:
        colors.textDim,
      fontFamily: fonts.body,
      fontSize: 10,
      textAlign: "center",
    },

    loadingSymbol: {
      color: colors.gold,
      fontSize: 25,
      marginBottom: 18,
    },

    loadingText: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 11,
      marginTop: 12,
    },

    missingSymbol: {
      color: colors.gold,
      fontSize: 30,
    },

    missingTitle: {
      color: colors.text,
      fontFamily:
        fonts.display,
      fontSize: 28,
      textAlign: "center",
      marginTop: 13,
    },

    missingText: {
      color:
        colors.textMuted,
      fontFamily: fonts.body,
      fontSize: 12,
      lineHeight: 19,
      textAlign: "center",
      maxWidth: 420,
      marginTop: 8,
    },

    recoveryActions: {
      width: "100%",
      maxWidth: 400,
      gap: 10,
      marginTop: 25,
    },
  }); 