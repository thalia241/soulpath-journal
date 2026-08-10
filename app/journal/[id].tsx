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
  deleteJournalEntry,
  getJournalEntry,
  JournalEntry,
} from "../../src/services/journalService";

import {
  EntryPractice,
  getEntryPractices,
} from "../../src/services/practiceService";

import {
  classifySoulPathError,
  SoulPathErrorInfo,
} from "../../src/utils/errors";

import {
  formatLocalDate,
} from "../../src/utils/date";

export default function JournalDetailScreen() {
  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const [
    entry,
    setEntry,
  ] =
    useState<JournalEntry | null>(
      null
    );

  const [
    practices,
    setPractices,
  ] =
    useState<EntryPractice[]>([]);

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

  const loadEntry =
    useCallback(async () => {
      if (!id) {
        setLoading(false);

        setErrorInfo({
          kind: "not_found",
          message:
            "This reflection could not be found.",
          retryable: false,
        });

        return;
      }

      try {
        setLoading(true);
        setErrorInfo(null);

        const [
          journalEntry,
          entryPractices,
        ] =
          await Promise.all([
            getJournalEntry(
              id
            ),

            getEntryPractices(
              id
            ),
          ]);

        setEntry(
          journalEntry
        );

        setPractices(
          entryPractices
        );
      } catch (error) {
        console.error(
          "Unable to open reflection:",
          error
        );

        setEntry(null);

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
      void loadEntry();
    }, [loadEntry])
  );

  function requestDelete() {
    const warning =
      "This reflection will be permanently removed.";

    if (
      Platform.OS === "web"
    ) {
      const confirmed =
        typeof window !==
          "undefined" &&
        window.confirm(
          `Let this reflection go?\n\n${warning}`
        );

      if (confirmed) {
        void removeEntry();
      }

      return;
    }

    Alert.alert(
      "Let this reflection go?",
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
            void removeEntry(),
        },
      ]
    );
  }

  async function removeEntry() {
    if (
      !id ||
      deleting
    ) {
      return;
    }

    try {
      setDeleting(true);
      setErrorInfo(null);

      await deleteJournalEntry(
        id
      );

      router.replace(
        "/journal"
      );
    } catch (error) {
      setErrorInfo(
        classifySoulPathError(
          error
        )
      );
    } finally {
      setDeleting(false);
    }
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
          style={styles.loadingText}
        >
          Opening this page...
        </Text>
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView
        style={styles.centered}
      >
        <Text
          style={styles.missingSymbol}
        >
          ☾
        </Text>

        <Text
          style={styles.missingTitle}
        >
          {errorInfo?.kind ===
          "not_found"
            ? "This page is no longer here."
            : "This page couldn't be opened."}
        </Text>

        <Text
          style={styles.missingText}
        >
          {errorInfo?.message}
        </Text>

        <View
          style={styles.recoveryActions}
        >
          {errorInfo?.retryable ? (
            <SoulButton
              title="Try again"
              onPress={() =>
                void loadEntry()
              }
            />
          ) : null}

          {errorInfo?.kind ===
          "auth" ? (
            <SoulButton
              title="Return to sign in"
              onPress={() =>
                router.replace(
                  "/login"
                )
              }
            />
          ) : (
            <SoulButton
              title="Back to journal"
              variant="secondary"
              onPress={() =>
                router.replace(
                  "/journal"
                )
              }
            />
          )}
        </View>
      </SafeAreaView>
    );
  }

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
            ‹ Journal
          </Text>
        </Pressable>

        <Text
          style={styles.date}
        >
          {formatLocalDate(
            entry.entry_date
          )}
        </Text>

        <Text
          style={styles.title}
        >
          {entry.title}
        </Text>

        <View
          style={styles.metadata}
        >
          {entry.mood ? (
            <View
              style={styles.metaChip}
            >
              <Text
                style={styles.metaText}
              >
                ◉ {entry.mood}
              </Text>
            </View>
          ) : null}

          {entry.energy_level !==
          null ? (
            <View
              style={styles.metaChip}
            >
              <Text
                style={styles.metaText}
              >
                ✧ Energy{" "}
                {
                  entry.energy_level
                }
                /5
              </Text>
            </View>
          ) : null}
        </View>

        {practices.length >
        0 ? (
          <View
            style={styles.practiceArea}
          >
            <Text
              style={
                styles.practiceHeading
              }
            >
              What supported you
            </Text>

            <View
              style={
                styles.practiceWrap
              }
            >
              {practices.map(
                (item) => (
                  <View
                    key={item.id}
                    style={
                      styles.practiceChip
                    }
                  >
                    <Text
                      style={
                        styles.practiceText
                      }
                    >
                      ✦{" "}
                      {item.practice
                        ?.name ??
                        "Practice"}
                    </Text>
                  </View>
                )
              )}
            </View>
          </View>
        ) : null}

        <View
          style={styles.divider}
        />

        <Text
          style={
            styles.contentText
          }
        >
          {entry.content}
        </Text>

        <SoulCard
          style={
            styles.closingCard
          }
        >
          <Text
            style={
              styles.closingSymbol
            }
          >
            ☾
          </Text>

          <Text
            style={
              styles.closingText
            }
          >
            A reflection doesn't
            have to be finished to
            be worth keeping.
          </Text>
        </SoulCard>

        {errorInfo ? (
          <FeedbackMessage
            type="error"
            message={
              errorInfo.message
            }
          />
        ) : null}

        <View
          style={styles.actions}
        >
          <SoulButton
            title="Edit this reflection"
            onPress={() =>
              router.push({
                pathname:
                  "/journal/edit/[id]",

                params: {
                  id: entry.id,
                },
              })
            }
          />

          <SoulButton
            title="Back to journal"
            variant="secondary"
            onPress={() =>
              router.replace(
                "/journal"
              )
            }
          />

          <View
            style={
              styles.deleteSpacing
            }
          >
            <SoulButton
              title="Let this reflection go"
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
      maxWidth: 700,
      alignSelf: "center",
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 65,
    },

    back: {
      alignSelf:
        "flex-start",
      paddingVertical: 8,
      marginBottom: 28,
    },

    backText: {
      color:
        colors.lavender,
      fontFamily:
        fonts.bodySemiBold,
      fontSize: 12,
    },

    date: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 10,
    },

    title: {
      color: colors.text,
      fontFamily:
        fonts.display,
      fontSize: 41,
      lineHeight: 45,
      marginTop: 5,
    },

    metadata: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 16,
    },

    metaChip: {
      backgroundColor:
        colors.surfaceRaised,
      borderRadius:
        radius.pill,
      paddingHorizontal: 11,
      paddingVertical: 6,
    },

    metaText: {
      color:
        colors.lavender,
      fontFamily: fonts.body,
      fontSize: 10,
    },

    practiceArea: {
      marginTop: 26,
    },

    practiceHeading: {
      color:
        colors.textSoft,
      fontFamily:
        fonts.display,
      fontSize: 20,
      marginBottom: 10,
    },

    practiceWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 7,
    },

    practiceChip: {
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.pill,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },

    practiceText: {
      color:
        colors.goldSoft,
      fontFamily: fonts.body,
      fontSize: 10,
    },

    divider: {
      height: 1,
      backgroundColor:
        colors.border,
      marginVertical: 30,
    },

    contentText: {
      color:
        colors.textSoft,
      fontFamily: fonts.body,
      fontSize: 15,
      lineHeight: 26,
    },

    closingCard: {
      marginTop: 34,
      backgroundColor:
        "#18122B",
      borderColor:
        colors.borderStrong,
    },

    closingSymbol: {
      color: colors.gold,
      fontSize: 17,
    },

    closingText: {
      color:
        colors.textMuted,
      fontFamily:
        fonts.displayItalic,
      fontSize: 18,
      lineHeight: 25,
      marginTop: 7,
    },

    actions: {
      gap: 10,
      marginTop: 26,
    },

    deleteSpacing: {
      marginTop: 7,
    },

    loadingSymbol: {
      color: colors.gold,
      fontSize: 26,
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
      marginTop: 13,
      textAlign: "center",
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