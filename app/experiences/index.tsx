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

import {
  Experience,
  ExperienceType,
  getDreamCount,
  getExperiences,
  getSynchronicityCount,
} from "../../src/services/experienceService";

type TypeFilter =
  | "all"
  | ExperienceType;

type SignificanceFilter =
  | "all"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5";

type DateFilter =
  | "all"
  | "7"
  | "30";

export default function ExperiencesScreen() {
  const [
    experiences,
    setExperiences,
  ] = useState<Experience[]>([]);

  const [
    dreamCount,
    setDreamCount,
  ] = useState(0);

  const [
    synchronicityCount,
    setSynchronicityCount,
  ] = useState(0);

  const [loading, setLoading] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    searchText,
    setSearchText,
  ] = useState("");

  const [
    typeFilter,
    setTypeFilter,
  ] =
    useState<TypeFilter>("all");

  const [
    significanceFilter,
    setSignificanceFilter,
  ] =
    useState<SignificanceFilter>(
      "all"
    );

  const [
    dateFilter,
    setDateFilter,
  ] =
    useState<DateFilter>("all");

  const loadData =
    useCallback(async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const [
          entries,
          dreams,
          synchronicities,
        ] = await Promise.all([
          getExperiences(),
          getDreamCount(),
          getSynchronicityCount(),
        ]);

        setExperiences(entries);
        setDreamCount(dreams);

        setSynchronicityCount(
          synchronicities
        );
      } catch (error) {
        console.error(
          "Unable to load experiences:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your experiences."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const filteredExperiences =
    useMemo(() => {
      const normalizedSearch =
        searchText
          .trim()
          .toLowerCase();

      const now = new Date();

      return experiences.filter(
        (experience) => {
          const matchesSearch =
            !normalizedSearch ||
            experience.title
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            experience.description
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            (
              experience.interpretation ??
              ""
            )
              .toLowerCase()
              .includes(
                normalizedSearch
              );

          const matchesType =
            typeFilter === "all" ||
            experience.experience_type ===
              typeFilter;

          const matchesSignificance =
            significanceFilter ===
              "all" ||
            experience.significance_level ===
              Number(
                significanceFilter
              );

          let matchesDate = true;

          if (
            dateFilter !== "all"
          ) {
            const days =
              Number(dateFilter);

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

            const experienceDate =
              new Date(
                experience.experienced_at
              );

            matchesDate =
              experienceDate >=
              startDate;
          }

          return (
            matchesSearch &&
            matchesType &&
            matchesSignificance &&
            matchesDate
          );
        }
      );
    }, [
      experiences,
      searchText,
      typeFilter,
      significanceFilter,
      dateFilter,
    ]);

  const hasActiveFilters =
    searchText.trim().length > 0 ||
    typeFilter !== "all" ||
    significanceFilter !== "all" ||
    dateFilter !== "all";

  function clearFilters() {
    setSearchText("");
    setTypeFilter("all");
    setSignificanceFilter("all");
    setDateFilter("all");
  }

  function getIcon(
    type: ExperienceType
  ) {
    return type === "dream"
      ? "☾"
      : "✦";
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
        <View style={styles.header}>
          <View>
            <Text
              style={styles.eyebrow}
            >
              MEANINGFUL EXPERIENCES
            </Text>

            <Text
              style={styles.title}
            >
              Dreams & Signs
            </Text>
          </View>

          <Pressable
            style={styles.addButton}
            onPress={() =>
              router.push(
                "/experiences/new"
              )
            }
          >
            <Text
              style={
                styles.addButtonText
              }
            >
              ＋
            </Text>
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text
              style={styles.statSymbol}
            >
              ☾
            </Text>

            <Text
              style={styles.statNumber}
            >
              {dreamCount}
            </Text>

            <Text
              style={styles.statLabel}
            >
              Dreams
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text
              style={styles.statSymbol}
            >
              ✦
            </Text>

            <Text
              style={styles.statNumber}
            >
              {synchronicityCount}
            </Text>

            <Text
              style={styles.statLabel}
            >
              Synchronicities
            </Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>
            ⌕
          </Text>

          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search dreams and signs..."
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
          Type
        </Text>

        <View style={styles.filterRow}>
          {(
            [
              ["all", "All"],
              ["dream", "Dreams"],
              [
                "synchronicity",
                "Synchronicities",
              ],
            ] as [
              TypeFilter,
              string
            ][]
          ).map(([value, label]) => {
            const selected =
              typeFilter === value;

            return (
              <Pressable
                key={value}
                style={[
                  styles.filterChip,
                  selected &&
                    styles.filterChipSelected,
                ]}
                onPress={() =>
                  setTypeFilter(value)
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
          Significance
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.horizontalFilters
          }
        >
          {(
            [
              "all",
              "1",
              "2",
              "3",
              "4",
              "5",
            ] as SignificanceFilter[]
          ).map((value) => {
            const selected =
              significanceFilter === value;

            return (
              <Pressable
                key={value}
                style={[
                  styles.filterChip,
                  selected &&
                    styles.filterChipSelected,
                ]}
                onPress={() =>
                  setSignificanceFilter(
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
                  {value === "all"
                    ? "Any"
                    : `${value}/5`}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.resultHeader}>
          <Text style={styles.resultText}>
            {
              filteredExperiences.length
            }{" "}
            {filteredExperiences.length ===
            1
              ? "experience"
              : "experiences"}
          </Text>

          {hasActiveFilters ? (
            <Pressable
              onPress={clearFilters}
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
          <ActivityIndicator
            color="#CDB9FF"
            size="large"
            style={styles.loader}
          />
        ) : null}

        {errorMessage ? (
          <Text style={styles.error}>
            {errorMessage}
          </Text>
        ) : null}

        {!loading &&
        filteredExperiences.length ===
          0 ? (
          <View
            style={styles.emptyState}
          >
            <Text
              style={styles.emptySymbol}
            >
              ☾ ✦
            </Text>

            <Text
              style={styles.emptyTitle}
            >
              {hasActiveFilters
                ? "No experiences match"
                : "Nothing recorded yet"}
            </Text>

            <Text
              style={styles.emptyText}
            >
              {hasActiveFilters
                ? "Try changing your search or filters."
                : "Dreams and meaningful coincidences can be captured here whenever they stand out to you."}
            </Text>

            {hasActiveFilters ? (
              <Pressable
                style={
                  styles.secondaryButton
                }
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
                style={
                  styles.createButton
                }
                onPress={() =>
                  router.push(
                    "/experiences/new"
                  )
                }
              >
                <Text
                  style={
                    styles.createButtonText
                  }
                >
                  Record an Experience
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={styles.list}>
            {filteredExperiences.map(
              (experience) => (
                <Pressable
                  key={experience.id}
                  style={
                    styles.experienceCard
                  }
                  onPress={() =>
                    router.push({
                      pathname:
                        "/experiences/[id]",
                      params: {
                        id: experience.id,
                      },
                    })
                  }
                >
                  <View
                    style={
                      styles.cardHeader
                    }
                  >
                    <Text
                      style={
                        styles.cardSymbol
                      }
                    >
                      {getIcon(
                        experience.experience_type
                      )}
                    </Text>

                    <Text
                      style={
                        styles.cardType
                      }
                    >
                      {experience.experience_type ===
                      "dream"
                        ? "DREAM"
                        : "SYNCHRONICITY"}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.cardTitle
                    }
                  >
                    {experience.title}
                  </Text>

                  <Text
                    style={
                      styles.cardPreview
                    }
                    numberOfLines={3}
                  >
                    {
                      experience.description
                    }
                  </Text>

                  <View
                    style={
                      styles.cardFooter
                    }
                  >
                    <Text
                      style={
                        styles.cardDate
                      }
                    >
                      {new Date(
                        experience.experienced_at
                      ).toLocaleDateString()}
                    </Text>

                    {experience.significance_level ? (
                      <Text
                        style={
                          styles.significanceChip
                        }
                      >
                        Significance{" "}
                        {
                          experience.significance_level
                        }
                        /5
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
    marginBottom: 26,
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

  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#7357C7",
    justifyContent: "center",
    alignItems: "center",
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 26,
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 22,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#151126",
    borderWidth: 1,
    borderColor: "#29213D",
    borderRadius: 18,
    padding: 18,
  },

  statSymbol: {
    color: "#D4B866",
    fontSize: 20,
  },

  statNumber: {
    color: "#F0E8FF",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 8,
  },

  statLabel: {
    color: "#82798E",
    fontSize: 12,
    marginTop: 2,
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
    flexWrap: "wrap",
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

  list: {
    gap: 13,
  },

  experienceCard: {
    backgroundColor: "#151126",
    borderWidth: 1,
    borderColor: "#29213D",
    borderRadius: 19,
    padding: 20,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  cardSymbol: {
    color: "#D4B866",
    fontSize: 18,
  },

  cardType: {
    color: "#917CB8",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
  },

  cardTitle: {
    color: "#EFE8FA",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 11,
  },

  cardPreview: {
    color: "#948A9F",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },

  cardFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },

  cardDate: {
    color: "#777080",
    fontSize: 12,
  },

  significanceChip: {
    color: "#C1AEE1",
    backgroundColor: "#211A35",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
  },

  emptyState: {
    backgroundColor: "#151126",
    borderWidth: 1,
    borderColor: "#29213D",
    borderRadius: 20,
    alignItems: "center",
    padding: 34,
  },

  emptySymbol: {
    color: "#A68ECF",
    fontSize: 32,
  },

  emptyTitle: {
    color: "#E4DAF0",
    fontSize: 19,
    fontWeight: "700",
    marginTop: 14,
  },

  emptyText: {
    color: "#83798D",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 380,
  },

  createButton: {
    backgroundColor: "#7357C7",
    borderRadius: 14,
    paddingHorizontal: 19,
    paddingVertical: 13,
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
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginTop: 20,
  },

  secondaryButtonText: {
    color: "#C9B6E8",
    fontWeight: "700",
  },

  error: {
    color: "#F1A7B9",
    textAlign: "center",
    marginVertical: 20,
  },
}); 