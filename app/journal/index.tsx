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
} from "../../src/theme";

import {
  getJournalEntries,
  JournalEntry,
} from "../../src/services/journalService";

import {
  formatLocalDate,
  isWithinLastDays,
} from "../../src/utils/date";

type MoodFilter =
  | "all"
  | string;

type DateFilter =
  | "all"
  | "7"
  | "30";

export default function JournalScreen() {
  const [
    entries,
    setEntries,
  ] =
    useState<JournalEntry[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("");

  const [
    searchText,
    setSearchText,
  ] =
    useState("");

  const [
    moodFilter,
    setMoodFilter,
  ] =
    useState<MoodFilter>(
      "all"
    );

  const [
    dateFilter,
    setDateFilter,
  ] =
    useState<DateFilter>(
      "all"
    );

  const loadEntries =
    useCallback(
      async () => {
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
              : "Unable to open your journal."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  useFocusEffect(
    useCallback(() => {
      void loadEntries();
    }, [loadEntries])
  );

  /*
   * Derive mood options from the user's actual journal
   * instead of maintaining a hard-coded list.
   *
   * This makes filtering work even if we add new moods
   * later or older records contain another value.
   */
  const moodOptions =
    useMemo(() => {
      const moods =
        entries
          .map(
            (entry) =>
              entry.mood?.trim()
          )
          .filter(
            (
              mood
            ): mood is string =>
              Boolean(mood)
          );

      return Array.from(
        new Set(moods)
      ).sort(
        (a, b) =>
          a.localeCompare(b)
      );
    }, [entries]);

  const filteredEntries =
    useMemo(() => {
      const normalizedSearch =
        searchText
          .trim()
          .toLowerCase();

      return entries.filter(
        (entry) => {
          const title =
            entry.title
              .toLowerCase();

          const content =
            entry.content
              .toLowerCase();

          const matchesSearch =
            normalizedSearch ===
              "" ||
            title.includes(
              normalizedSearch
            ) ||
            content.includes(
              normalizedSearch
            );

          const matchesMood =
            moodFilter ===
              "all" ||
            entry.mood ===
              moodFilter;

          const matchesDate =
            dateFilter ===
            "all"
              ? true
              : isWithinLastDays(
                  entry.entry_date,
                  Number(
                    dateFilter
                  )
                );

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
    searchText.trim() !==
      "" ||
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
          style={styles.header}
        >
          <View
            style={
              styles.headerText
            }
          >
            <Text
              style={styles.title}
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
            accessibilityRole="button"
            accessibilityLabel="Write a new reflection"
            style={({ pressed }) => [
              styles.newButton,

              pressed &&
                styles.pressed,
            ]}
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
            value={searchText}
            onChangeText={
              setSearchText
            }
            style={
              styles.searchInput
            }
            placeholder="Search your reflections..."
            placeholderTextColor={
              colors.textDim
            }
            autoCorrect
            autoCapitalize="sentences"
            returnKeyType="search"
          />

          {searchText ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
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
          <FilterChip
            label="All time"
            selected={
              dateFilter ===
              "all"
            }
            onPress={() =>
              setDateFilter(
                "all"
              )
            }
          />

          <FilterChip
            label="7 days"
            selected={
              dateFilter === "7"
            }
            onPress={() =>
              setDateFilter("7")
            }
          />

          <FilterChip
            label="30 days"
            selected={
              dateFilter ===
              "30"
            }
            onPress={() =>
              setDateFilter("30")
            }
          />
        </View>

        {moodOptions.length >
        0 ? (
          <>
            <SectionHeading
              title="How it felt"
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.moodRow
              }
            >
              <FilterChip
                label="All moods"
                selected={
                  moodFilter ===
                  "all"
                }
                onPress={() =>
                  setMoodFilter(
                    "all"
                  )
                }
              />

              {moodOptions.map(
                (mood) => (
                  <FilterChip
                    key={mood}
                    label={mood}
                    selected={
                      moodFilter ===
                      mood
                    }
                    onPress={() =>
                      setMoodFilter(
                        mood
                      )
                    }
                  />
                )
              )}
            </ScrollView>
          </>
        ) : null}

        <View
          style={
            styles.resultsHeader
          }
        >
          <Text
            style={
              styles.resultsText
            }
          >
            {
              filteredEntries.length
            }{" "}
            {filteredEntries.length ===
            1
              ? "reflection"
              : "reflections"}
          </Text>

          {hasActiveFilters ? (
            <Pressable
              accessibilityRole="button"
              onPress={
                clearFilters
              }
            >
              <Text
                style={
                  styles.clearFilters
                }
              >
                Clear filters
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
        ) : errorMessage ? (
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

            <Pressable
              style={
                styles.retryButton
              }
              onPress={() =>
                void loadEntries()
              }
            >
              <Text
                style={
                  styles.retryText
                }
              >
                Try again
              </Text>
            </Pressable>
          </View>
        ) : filteredEntries.length ===
          0 ? (
          <EmptyState
            symbol="☾"
            title={
              hasActiveFilters
                ? "Nothing surfaced here"
                : "Your pages are waiting"
            }
            description={
              hasActiveFilters
                ? "Try another word, mood, or stretch of time."
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
                  style={({
                    pressed,
                  }) => [
                    styles.entryCard,

                    pressed &&
                      styles.pressed,
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
                    {formatLocalDate(
                      entry.entry_date
                    )}
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
                          ◉{" "}
                          {entry.mood}
                        </Text>
                      </View>
                    ) : null}

                    {entry.energy_level !==
                    null ? (
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
                          ✧ Energy{" "}
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

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{
        selected,
      }}
      style={({ pressed }) => [
        styles.filterChip,

        selected &&
          styles.filterChipSelected,

        pressed &&
          styles.pressed,
      ]}
      onPress={onPress}
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

    headerText: {
      flex: 1,
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

      fontFamily:
        fonts.displayItalic,

      fontSize: 16,

      lineHeight: 22,

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

      fontSize: 27,

      lineHeight: 29,
    },

    searchBox: {
      flexDirection: "row",

      alignItems: "center",

      backgroundColor:
        colors.surface,

      borderWidth: 1,

      borderColor:
        colors.border,

      borderRadius:
        radius.lg,

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

      flexWrap: "wrap",

      gap: 8,

      marginBottom: 27,
    },

    moodRow: {
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

    resultsHeader: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems: "center",

      marginBottom: 15,
    },

    resultsText: {
      color: colors.textDim,

      fontFamily: fonts.body,

      fontSize: 11,
    },

    clearFilters: {
      color:
        colors.lavender,

      fontFamily:
        fonts.bodySemiBold,

      fontSize: 11,
    },

    loadingState: {
      alignItems: "center",

      paddingVertical: 34,
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

      padding: 16,
    },

    errorText: {
      color:
        colors.errorText,

      fontFamily: fonts.body,

      fontSize: 12,

      lineHeight: 18,
    },

    retryButton: {
      alignSelf:
        "flex-start",

      marginTop: 12,
    },

    retryText: {
      color:
        colors.lavender,

      fontFamily:
        fonts.bodySemiBold,

      fontSize: 11,
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

    pressed: {
      opacity: 0.78,
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
      color:
        colors.lavender,

      fontFamily: fonts.body,

      fontSize: 10,
    },
  }); 