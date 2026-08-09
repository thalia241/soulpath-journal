import {
  router,
  useFocusEffect,
} from "expo-router";

import {
  useCallback,
  useMemo,
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

import EmptyState from "../../src/components/EmptyState";
import SectionHeading from "../../src/components/SectionHeading";

import {
  colors,
  fonts,
  radius,
  spacing,
} from "../../src/theme";

import {
  getJournalEntries,
  JournalEntry,
} from "../../src/services/journalService";

type MoodFilter =
  | "all"
  | "Peaceful"
  | "Happy"
  | "Reflective"
  | "Neutral"
  | "Anxious"
  | "Sad"
  | "Overwhelmed";

type DateFilter =
  | "all"
  | "7"
  | "30";

const moodFilters: MoodFilter[] = [
  "all",
  "Peaceful",
  "Happy",
  "Reflective",
  "Neutral",
  "Anxious",
  "Sad",
  "Overwhelmed",
];

export default function JournalScreen() {
  const [
    entries,
    setEntries,
  ] =
    useState<JournalEntry[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    searchText,
    setSearchText,
  ] = useState("");

  const [
    moodFilter,
    setMoodFilter,
  ] =
    useState<MoodFilter>("all");

  const [
    dateFilter,
    setDateFilter,
  ] =
    useState<DateFilter>("all");

  const loadEntries =
    useCallback(async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const data =
          await getJournalEntries();

        setEntries(data);
      } catch (error) {
        console.error(
          "Unable to load journal entries:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your journal."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  const filteredEntries =
    useMemo(() => {
      const normalizedSearch =
        searchText
          .trim()
          .toLowerCase();

      const now =
        new Date();

      return entries.filter(
        (entry) => {
          const matchesSearch =
            !normalizedSearch ||
            entry.title
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            entry.content
              .toLowerCase()
              .includes(
                normalizedSearch
              );

          const matchesMood =
            moodFilter === "all" ||
            entry.mood ===
              moodFilter;

          let matchesDate = true;

          if (
            dateFilter !== "all"
          ) {
            const days =
              Number(
                dateFilter
              );

            const startDate =
              new Date(now);

            startDate.setHours(
              0,
              0,
              0,
              0
            );

            startDate.setDate(
              startDate.getDate() -
                (days - 1)
            );

            const entryDate =
              new Date(
                `${entry.entry_date}T00:00:00`
              );

            matchesDate =
              entryDate >=
              startDate;
          }

          return (
            matchesSearch &&
            matchesMood &&
            matchesDate
          );
        }
      );
    }, [
      entries,
      searchText,
      moodFilter,
      dateFilter,
    ]);

  const hasActiveFilters =
    searchText
      .trim()
      .length > 0 ||
    moodFilter !== "all" ||
    dateFilter !== "all";

  function clearFilters() {
    setSearchText("");
    setMoodFilter("all");
    setDateFilter("all");
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
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={
            styles.header
          }
        >
          <View style={{ flex: 1 }}>
            <Text
              style={
                styles.title
              }
            >
              Journal
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              A place for what wants
              to be remembered.
            </Text>
          </View>

          <Pressable
            style={
              styles.newButton
            }
            onPress={() =>
              router.push(
                "/journal/new"
              )
            }
          >
            <Text
              style={
                styles.newButtonText
              }
            >
              +
            </Text>
          </Pressable>
        </View>

        <View
          style={
            styles.searchBox
          }
        >
          <Text
            style={
              styles.searchSymbol
            }
          >
            ✦
          </Text>

          <TextInput
            style={
              styles.searchInput
            }
            value={
              searchText
            }
            onChangeText={
              setSearchText
            }
            placeholder="Search your reflections..."
            placeholderTextColor={
              colors.textDim
            }
          />

          {searchText.length >
          0 ? (
            <Pressable
              onPress={() =>
                setSearchText("")
              }
            >
              <Text
                style={
                  styles.clearSearch
                }
              >
                ×
              </Text>
            </Pressable>
          ) : null}
        </View>

        <SectionHeading
          title="When"
        />

        <View
          style={
            styles.filterRow
          }
        >
          {(
            [
              [
                "all",
                "All time",
              ],
              [
                "7",
                "7 days",
              ],
              [
                "30",
                "30 days",
              ],
            ] as [
              DateFilter,
              string
            ][]
          ).map(
            ([
              value,
              label,
            ]) => {
              const selected =
                dateFilter ===
                value;

              return (
                <Pressable
                  key={value}
                  style={[
                    styles.filterChip,

                    selected &&
                      styles.filterChipSelected,
                  ]}
                  onPress={() =>
                    setDateFilter(
                      value
                    )
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,

                      selected &&
                        styles.filterChipTextSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            }
          )}
        </View>

        <SectionHeading
          title="How it felt"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.moodFilters
          }
        >
          {moodFilters.map(
            (mood) => {
              const selected =
                moodFilter ===
                mood;

              return (
                <Pressable
                  key={mood}
                  style={[
                    styles.filterChip,

                    selected &&
                      styles.filterChipSelected,
                  ]}
                  onPress={() =>
                    setMoodFilter(
                      mood
                    )
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,

                      selected &&
                        styles.filterChipTextSelected,
                    ]}
                  >
                    {mood ===
                    "all"
                      ? "All moods"
                      : mood}
                  </Text>
                </Pressable>
              );
            }
          )}
        </ScrollView>

        <View
          style={
            styles.resultHeader
          }
        >
          <Text
            style={
              styles.resultCount
            }
          >
            {filteredEntries.length}{" "}
            {filteredEntries.length ===
            1
              ? "reflection"
              : "reflections"}
          </Text>

          {hasActiveFilters ? (
            <Pressable
              onPress={
                clearFilters
              }
            >
              <Text
                style={
                  styles.clearFilters
                }
              >
                Clear
              </Text>
            </Pressable>
          ) : null}
        </View>

        {loading ? (
          <View
            style={
              styles.loadingState
            }
          >
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
              Opening your
              journal...
            </Text>
          </View>
        ) : null}

        {errorMessage ? (
          <View
            style={
              styles.errorBox
            }
          >
            <Text
              style={
                styles.errorText
              }
            >
              {errorMessage}
            </Text>
          </View>
        ) : null}

        {!loading &&
        filteredEntries.length ===
          0 ? (
          <EmptyState
            symbol="☾"
            title={
              hasActiveFilters
                ? "Nothing here just yet"
                : "Your pages are waiting"
            }
            description={
              hasActiveFilters
                ? "Try another word, mood, or time window."
                : "Your reflections will gather here as you write."
            }
            actionTitle={
              hasActiveFilters
                ? "Clear filters"
                : "Write a reflection"
            }
            onAction={
              hasActiveFilters
                ? clearFilters
                : () =>
                    router.push(
                      "/journal/new"
                    )
            }
          />
        ) : (
          <View
            style={
              styles.entryList
            }
          >
            {filteredEntries.map(
              (entry) => (
                <Pressable
                  key={entry.id}
                  style={({ pressed }) => [
                    styles.entryCard,

                    pressed &&
                      styles.entryPressed,
                  ]}
                  onPress={() =>
                    router.push({
                      pathname:
                        "/journal/[id]",

                      params: {
                        id: entry.id,
                      },
                    })
                  }
                >
                  <Text
                    style={
                      styles.entryDate
                    }
                  >
                    {
                      entry.entry_date
                    }
                  </Text>

                  <Text
                    style={
                      styles.entryTitle
                    }
                  >
                    {entry.title}
                  </Text>

                  <Text
                    style={
                      styles.entryPreview
                    }
                    numberOfLines={3}
                  >
                    {
                      entry.content
                    }
                  </Text>

                  <View
                    style={
                      styles.metadata
                    }
                  >
                    {entry.mood ? (
                      <View
                        style={
                          styles.metaChip
                        }
                      >
                        <Text
                          style={
                            styles.metaText
                          }
                        >
                          {
                            entry.mood
                          }
                        </Text>
                      </View>
                    ) : null}

                    {entry.energy_level ? (
                      <View
                        style={
                          styles.metaChip
                        }
                      >
                        <Text
                          style={
                            styles.metaText
                          }
                        >
                          Energy{" "}
                          {
                            entry.energy_level
                          }
                          /5
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </Pressable>
              )
            )}
          </View>
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
      maxWidth: 720,
      alignSelf: "center",
      paddingHorizontal: 24,
      paddingTop: 34,
      paddingBottom: 115,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      marginBottom: 30,
    },

    title: {
      color: colors.text,
      fontFamily:
        fonts.display,
      fontSize: 40,
      lineHeight: 43,
    },

    subtitle: {
      color:
        colors.textMuted,
      fontFamily: fonts.body,
      fontSize: 13,
      lineHeight: 20,
      marginTop: 3,
    },

    newButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor:
        colors.purple,
      alignItems: "center",
      justifyContent:
        "center",
    },

    newButtonText: {
      color: colors.white,
      fontFamily:
        fonts.bodyMedium,
      fontSize: 26,
      lineHeight: 28,
    },

    searchBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        colors.surface,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: radius.lg,
      paddingHorizontal: 15,
      marginBottom: 30,
    },

    searchSymbol: {
      color: colors.gold,
      fontSize: 14,
      marginRight: 9,
    },

    searchInput: {
      flex: 1,
      color: colors.text,
      fontFamily: fonts.body,
      fontSize: 14,
      paddingVertical: 14,
    },

    clearSearch: {
      color:
        colors.textMuted,
      fontSize: 21,
      paddingHorizontal: 4,
    },

    filterRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 27,
    },

    moodFilters: {
      gap: 8,
      paddingBottom: 30,
    },

    filterChip: {
      backgroundColor:
        colors.surface,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.pill,
      paddingHorizontal: 14,
      paddingVertical: 9,
    },

    filterChipSelected: {
      backgroundColor:
        colors.purpleDark,
      borderColor:
        colors.lavenderStrong,
    },

    filterChipText: {
      color:
        colors.textMuted,
      fontFamily:
        fonts.bodyMedium,
      fontSize: 11,
    },

    filterChipTextSelected: {
      color: colors.white,
    },

    resultHeader: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      marginBottom: 15,
    },

    resultCount: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 11,
    },

    clearFilters: {
      color: colors.lavender,
      fontFamily:
        fonts.bodySemiBold,
      fontSize: 11,
    },

    loadingState: {
      alignItems: "center",
      paddingVertical: 30,
    },

    loadingText: {
      color: colors.textDim,
      fontFamily: fonts.body,
      marginTop: 10,
      fontSize: 12,
    },

    errorBox: {
      backgroundColor:
        colors.errorBackground,
      borderWidth: 1,
      borderColor:
        colors.errorBorder,
      borderRadius:
        radius.md,
      padding: 13,
      marginBottom: 15,
    },

    errorText: {
      color: colors.errorText,
      fontFamily: fonts.body,
      fontSize: 12,
    },

    entryList: {
      gap: 12,
    },

    entryCard: {
      backgroundColor:
        colors.surface,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.xl,
      padding: 20,
    },

    entryPressed: {
      opacity: 0.8,
    },

    entryDate: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 10,
    },

    entryTitle: {
      color: colors.text,
      fontFamily:
        fonts.display,
      fontSize: 24,
      lineHeight: 28,
      marginTop: 5,
    },

    entryPreview: {
      color:
        colors.textMuted,
      fontFamily: fonts.body,
      fontSize: 12,
      lineHeight: 19,
      marginTop: 7,
    },

    metadata: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 7,
      marginTop: 14,
    },

    metaChip: {
      backgroundColor:
        colors.surfaceRaised,
      borderRadius:
        radius.pill,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },

    metaText: {
      color: colors.lavender,
      fontFamily: fonts.body,
      fontSize: 10,
    },
  }); 