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
          signs,
        ] =
          await Promise.all([
            getExperiences(),
            getDreamCount(),
            getSynchronicityCount(),
          ]);

        setExperiences(entries);
        setDreamCount(dreams);
        setSynchronicityCount(
          signs
        );
      } catch (error) {
        console.error(
          "Unable to load experiences:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to open your dreams and signs."
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
      const search =
        searchText
          .trim()
          .toLowerCase();

      const now =
        new Date();

      return experiences.filter(
        (experience) => {
          const matchesSearch =
            !search ||
            experience.title
              .toLowerCase()
              .includes(search) ||
            experience.description
              .toLowerCase()
              .includes(search) ||
            (
              experience.interpretation ??
              ""
            )
              .toLowerCase()
              .includes(search);

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

            const start =
              new Date(now);

            start.setHours(
              0,
              0,
              0,
              0
            );

            start.setDate(
              start.getDate() -
                (days - 1)
            );

            matchesDate =
              new Date(
                experience.experienced_at
              ) >= start;
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

  const hasFilters =
    searchText.trim() !== "" ||
    typeFilter !== "all" ||
    significanceFilter !==
      "all" ||
    dateFilter !== "all";

  function clearFilters() {
    setSearchText("");
    setTypeFilter("all");
    setSignificanceFilter(
      "all"
    );
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
          <View style={{ flex: 1 }}>
            <Text
              style={styles.title}
            >
              Dreams & Signs
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              The things that linger
              after waking. The moments
              that ask to be noticed.
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
              +
            </Text>
          </Pressable>
        </View>

        <View
          style={styles.statsRow}
        >
          <View
            style={styles.statCard}
          >
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
              dreams remembered
            </Text>
          </View>

          <View
            style={styles.statCard}
          >
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
              signs noticed
            </Text>
          </View>
        </View>

        <View
          style={styles.searchBox}
        >
          <Text
            style={
              styles.searchSymbol
            }
          >
            ☾
          </Text>

          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={
              setSearchText
            }
            placeholder="Search what you remember..."
            placeholderTextColor={
              colors.textDim
            }
          />

          {searchText ? (
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
          title="What kind of moment?"
        />

        <View
          style={styles.filterRow}
        >
          {[
            ["all", "Everything"],
            ["dream", "Dreams"],
            [
              "synchronicity",
              "Signs",
            ],
          ].map(
            ([value, label]) => {
              const selected =
                typeFilter ===
                value;

              return (
                <Pressable
                  key={value}
                  style={[
                    styles.chip,
                    selected &&
                      styles.chipSelected,
                  ]}
                  onPress={() =>
                    setTypeFilter(
                      value as TypeFilter
                    )
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      selected &&
                        styles.chipTextSelected,
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
          title="When"
        />

        <View
          style={styles.filterRow}
        >
          {[
            ["all", "All time"],
            ["7", "7 days"],
            ["30", "30 days"],
          ].map(
            ([value, label]) => {
              const selected =
                dateFilter ===
                value;

              return (
                <Pressable
                  key={value}
                  style={[
                    styles.chip,
                    selected &&
                      styles.chipSelected,
                  ]}
                  onPress={() =>
                    setDateFilter(
                      value as DateFilter
                    )
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      selected &&
                        styles.chipTextSelected,
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
          title="How deeply it stayed with you"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.significanceRow
          }
        >
          {[
            "all",
            "1",
            "2",
            "3",
            "4",
            "5",
          ].map((value) => {
            const selected =
              significanceFilter ===
              value;

            return (
              <Pressable
                key={value}
                style={[
                  styles.chip,
                  selected &&
                    styles.chipSelected,
                ]}
                onPress={() =>
                  setSignificanceFilter(
                    value as SignificanceFilter
                  )
                }
              >
                <Text
                  style={[
                    styles.chipText,
                    selected &&
                      styles.chipTextSelected,
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

        <View
          style={
            styles.resultsHeader
          }
        >
          <Text
            style={styles.resultText}
          >
            {
              filteredExperiences.length
            }{" "}
            {filteredExperiences.length ===
            1
              ? "memory"
              : "memories"}
          </Text>

          {hasFilters ? (
            <Pressable
              onPress={clearFilters}
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
              Gathering what you've
              recorded...
            </Text>
          </View>
        ) : null}

        {errorMessage ? (
          <View
            style={styles.errorBox}
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
        filteredExperiences.length ===
          0 ? (
          <EmptyState
            symbol="☾ ✦"
            title={
              hasFilters
                ? "Nothing surfaced here"
                : "The page is quiet"
            }
            description={
              hasFilters
                ? "Try changing the words or filters you're using."
                : "Dreams, strange coincidences, and meaningful moments can gather here when they find you."
            }
            actionTitle={
              hasFilters
                ? "Clear filters"
                : "Record something"
            }
            onAction={
              hasFilters
                ? clearFilters
                : () =>
                    router.push(
                      "/experiences/new"
                    )
            }
          />
        ) : (
          <View
            style={styles.list}
          >
            {filteredExperiences.map(
              (experience) => {
                const dream =
                  experience.experience_type ===
                  "dream";

                return (
                  <Pressable
                    key={
                      experience.id
                    }
                    style={({ pressed }) => [
                      styles.experienceCard,
                      pressed &&
                        styles.pressed,
                    ]}
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
                        styles.typeRow
                      }
                    >
                      <Text
                        style={
                          styles.typeSymbol
                        }
                      >
                        {dream
                          ? "☾"
                          : "✦"}
                      </Text>

                      <Text
                        style={
                          styles.typeText
                        }
                      >
                        {dream
                          ? "Dream"
                          : "Synchronicity"}
                      </Text>
                    </View>

                    <Text
                      style={
                        styles.cardTitle
                      }
                    >
                      {
                        experience.title
                      }
                    </Text>

                    <Text
                      style={
                        styles.cardBody
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
                          styles.dateText
                        }
                      >
                        {new Date(
                          experience.experienced_at
                        ).toLocaleDateString()}
                      </Text>

                      {experience.significance_level ? (
                        <Text
                          style={
                            styles.significance
                          }
                        >
                          ✦{" "}
                          {
                            experience.significance_level
                          }
                          /5
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                );
              }
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
      marginBottom: 28,
    },

    title: {
      color: colors.text,
      fontFamily: fonts.display,
      fontSize: 39,
      lineHeight: 43,
    },

    subtitle: {
      color:
        colors.textMuted,
      fontFamily:
        fonts.displayItalic,
      fontSize: 16,
      lineHeight: 22,
      marginTop: 4,
      maxWidth: 480,
    },

    addButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor:
        colors.purple,
      justifyContent:
        "center",
      alignItems: "center",
    },

    addButtonText: {
      color: colors.white,
      fontFamily:
        fonts.bodyMedium,
      fontSize: 26,
    },

    statsRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 24,
    },

    statCard: {
      flex: 1,
      backgroundColor:
        colors.surface,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.lg,
      padding: 18,
    },

    statSymbol: {
      color: colors.gold,
      fontSize: 19,
    },

    statNumber: {
      color: colors.text,
      fontFamily: fonts.display,
      fontSize: 31,
      marginTop: 5,
    },

    statLabel: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 10,
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
      fontSize: 16,
      marginRight: 10,
    },

    searchInput: {
      flex: 1,
      color: colors.text,
      fontFamily: fonts.body,
      paddingVertical: 14,
      fontSize: 14,
    },

    clearSearch: {
      color:
        colors.textMuted,
      fontSize: 21,
    },

    filterRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 27,
    },

    significanceRow: {
      gap: 8,
      paddingBottom: 29,
    },

    chip: {
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

    chipSelected: {
      backgroundColor:
        colors.purpleDark,
      borderColor:
        colors.lavenderStrong,
    },

    chipText: {
      color:
        colors.textMuted,
      fontFamily:
        fonts.bodyMedium,
      fontSize: 11,
    },

    chipTextSelected: {
      color: colors.white,
    },

    resultsHeader: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      marginBottom: 15,
    },

    resultText: {
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

    list: {
      gap: 12,
    },

    experienceCard: {
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
      opacity: 0.8,
    },

    typeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },

    typeSymbol: {
      color: colors.gold,
      fontSize: 14,
    },

    typeText: {
      color: colors.lavender,
      fontFamily:
        fonts.bodySemiBold,
      fontSize: 10,
    },

    cardTitle: {
      color: colors.text,
      fontFamily: fonts.display,
      fontSize: 25,
      lineHeight: 29,
      marginTop: 9,
    },

    cardBody: {
      color:
        colors.textMuted,
      fontFamily: fonts.body,
      fontSize: 12,
      lineHeight: 19,
      marginTop: 6,
    },

    cardFooter: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      marginTop: 14,
    },

    dateText: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 10,
    },

    significance: {
      color: colors.goldSoft,
      fontFamily: fonts.body,
      fontSize: 10,
      backgroundColor:
        colors.surfaceRaised,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius:
        radius.pill,
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
    },

    errorText: {
      color: colors.errorText,
      fontFamily: fonts.body,
      fontSize: 12,
    },
  }); 