import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";

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
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchText, setSearchText] = useState("");
  const [moodFilter, setMoodFilter] =
    useState<MoodFilter>("all");
  const [dateFilter, setDateFilter] =
    useState<DateFilter>("all");

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getJournalEntries();

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

  const filteredEntries = useMemo(() => {
    const normalizedSearch =
      searchText.trim().toLowerCase();

    const now = new Date();

    return entries.filter((entry) => {
      const matchesSearch =
        !normalizedSearch ||
        entry.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        entry.content
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesMood =
        moodFilter === "all" ||
        entry.mood === moodFilter;

      let matchesDate = true;

      if (dateFilter !== "all") {
        const days = Number(dateFilter);

        const startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(
          startDate.getDate() - (days - 1)
        );

        const entryDate = new Date(
          `${entry.entry_date}T00:00:00`
        );

        matchesDate =
          entryDate >= startDate;
      }

      return (
        matchesSearch &&
        matchesMood &&
        matchesDate
      );
    });
  }, [
    entries,
    searchText,
    moodFilter,
    dateFilter,
  ]);

  const hasActiveFilters =
    searchText.trim().length > 0 ||
    moodFilter !== "all" ||
    dateFilter !== "all";

  function clearFilters() {
    setSearchText("");
    setMoodFilter("all");
    setDateFilter("all");
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>
              YOUR REFLECTIONS
            </Text>

            <Text style={styles.title}>
              Journal
            </Text>
          </View>

          <Pressable
            style={styles.newButton}
            onPress={() =>
              router.push("/journal/new")
            }
          >
            <Text style={styles.newButtonText}>
              ＋
            </Text>
          </Pressable>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>
            ⌕
          </Text>

          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search reflections..."
            placeholderTextColor="#70677F"
          />

          {searchText.length > 0 ? (
            <Pressable
              onPress={() =>
                setSearchText("")
              }
            >
              <Text style={styles.clearSearch}>
                ×
              </Text>
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.filterLabel}>
          Time
        </Text>

        <View style={styles.filterRow}>
          {(
            [
              ["all", "All"],
              ["7", "7 Days"],
              ["30", "30 Days"],
            ] as [
              DateFilter,
              string
            ][]
          ).map(([value, label]) => {
            const selected =
              dateFilter === value;

            return (
              <Pressable
                key={value}
                style={[
                  styles.filterChip,
                  selected &&
                    styles.filterChipSelected,
                ]}
                onPress={() =>
                  setDateFilter(value)
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
          })}
        </View>

        <Text style={styles.filterLabel}>
          Mood
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.horizontalFilters
          }
        >
          {moodFilters.map((mood) => {
            const selected =
              moodFilter === mood;

            return (
              <Pressable
                key={mood}
                style={[
                  styles.filterChip,
                  selected &&
                    styles.filterChipSelected,
                ]}
                onPress={() =>
                  setMoodFilter(mood)
                }
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selected &&
                      styles.filterChipTextSelected,
                  ]}
                >
                  {mood === "all"
                    ? "All moods"
                    : mood}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.resultHeader}>
          <Text style={styles.resultText}>
            {filteredEntries.length}{" "}
            {filteredEntries.length === 1
              ? "reflection"
              : "reflections"}
          </Text>

          {hasActiveFilters ? (
            <Pressable onPress={clearFilters}>
              <Text style={styles.clearFilters}>
                Clear filters
              </Text>
            </Pressable>
          ) : null}
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#CDB9FF"
            style={styles.loader}
          />
        ) : null}

        {errorMessage ? (
          <Text style={styles.error}>
            {errorMessage}
          </Text>
        ) : null}

        {!loading &&
        filteredEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyMoon}>
              ☾
            </Text>

            <Text style={styles.emptyTitle}>
              {hasActiveFilters
                ? "No reflections match"
                : "Your journal is waiting"}
            </Text>

            <Text style={styles.emptyText}>
              {hasActiveFilters
                ? "Try changing your search or filters."
                : "Write your first reflection whenever something feels worth remembering."}
            </Text>

            {hasActiveFilters ? (
              <Pressable
                style={styles.secondaryButton}
                onPress={clearFilters}
              >
                <Text
                  style={
                    styles.secondaryButtonText
                  }
                >
                  Clear Filters
                </Text>
              </Pressable>
            ) : (
              <Pressable
                style={styles.createButton}
                onPress={() =>
                  router.push(
                    "/journal/new"
                  )
                }
              >
                <Text
                  style={
                    styles.createButtonText
                  }
                >
                  Write First Entry
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={styles.entries}>
            {filteredEntries.map(
              (entry) => (
                <Pressable
                  key={entry.id}
                  style={styles.entryCard}
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
                    style={styles.entryDate}
                  >
                    {entry.entry_date}
                  </Text>

                  <Text
                    style={
                      styles.entryTitle
                    }
                  >
                    {entry.title}
                  </Text>

                  <Text
                    style={styles.preview}
                    numberOfLines={3}
                  >
                    {entry.content}
                  </Text>

                  <View
                    style={styles.metadata}
                  >
                    {entry.mood ? (
                      <Text
                        style={
                          styles.metadataText
                        }
                      >
                        {entry.mood}
                      </Text>
                    ) : null}

                    {entry.energy_level ? (
                      <Text
                        style={
                          styles.metadataText
                        }
                      >
                        Energy{" "}
                        {entry.energy_level}/5
                      </Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C0A18",
  },

  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 110,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
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
    marginTop: 4,
  },

  newButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#7357C7",
    justifyContent: "center",
    alignItems: "center",
  },

  newButtonText: {
    color: "#FFFFFF",
    fontSize: 26,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#151126",
    borderWidth: 1,
    borderColor: "#302847",
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 20,
  },

  searchIcon: {
    color: "#8E819F",
    fontSize: 20,
    marginRight: 9,
  },

  searchInput: {
    flex: 1,
    color: "#F2EDFA",
    fontSize: 15,
    paddingVertical: 14,
  },

  clearSearch: {
    color: "#A998BD",
    fontSize: 22,
    paddingHorizontal: 4,
  },

  filterLabel: {
    color: "#8F84A0",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 9,
  },

  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
  },

  horizontalFilters: {
    gap: 8,
    paddingBottom: 20,
  },

  filterChip: {
    backgroundColor: "#151126",
    borderWidth: 1,
    borderColor: "#302847",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  filterChipSelected: {
    backgroundColor: "#5E489D",
    borderColor: "#8F74D2",
  },

  filterChipText: {
    color: "#A89DBB",
    fontSize: 12,
  },

  filterChipTextSelected: {
    color: "#FFFFFF",
  },

  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  resultText: {
    color: "#81778D",
    fontSize: 12,
  },

  clearFilters: {
    color: "#A98BE0",
    fontSize: 12,
    fontWeight: "600",
  },

  loader: {
    marginTop: 30,
  },

  entries: {
    gap: 14,
  },

  entryCard: {
    backgroundColor: "#151126",
    padding: 20,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#29213D",
  },

  entryDate: {
    color: "#81758F",
    fontSize: 12,
  },

  entryTitle: {
    color: "#EFE8FA",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 6,
  },

  preview: {
    color: "#948A9F",
    lineHeight: 21,
    marginTop: 8,
  },

  metadata: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginTop: 15,
  },

  metadataText: {
    color: "#B5A4D3",
    backgroundColor: "#211A35",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
  },

  emptyState: {
    alignItems: "center",
    backgroundColor: "#151126",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#29213D",
    padding: 34,
  },

  emptyMoon: {
    color: "#8B74B3",
    fontSize: 42,
  },

  emptyTitle: {
    color: "#E2DAEE",
    fontSize: 19,
    fontWeight: "700",
    marginTop: 12,
  },

  emptyText: {
    color: "#83798D",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 8,
  },

  createButton: {
    backgroundColor: "#7357C7",
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 20,
    marginTop: 20,
  },

  createButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: "#5B477D",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginTop: 20,
  },

  secondaryButtonText: {
    color: "#C9B6E8",
    fontWeight: "700",
  },

  error: {
    color: "#F1A7B9",
    marginBottom: 18,
  },
}); 