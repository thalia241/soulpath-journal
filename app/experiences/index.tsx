import {
  router,
  useFocusEffect,
} from "expo-router";

import {
  useCallback,
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

import {
  Experience,
  ExperienceType,
  getDreamCount,
  getExperiences,
  getSynchronicityCount,
} from "../../src/services/experienceService";

type Filter =
  | "all"
  | ExperienceType;

export default function ExperiencesScreen() {
  const [
    experiences,
    setExperiences,
  ] = useState<Experience[]>([]);

  const [filter, setFilter] =
    useState<Filter>("all");

  const [dreamCount, setDreamCount] =
    useState(0);

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
          getExperiences(
            filter === "all"
              ? undefined
              : filter
          ),

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
    }, [filter]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

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

        <View style={styles.filters}>
          {(
            [
              "all",
              "dream",
              "synchronicity",
            ] as Filter[]
          ).map((item) => {
            const selected =
              filter === item;

            const label =
              item === "all"
                ? "All"
                : item === "dream"
                  ? "Dreams"
                  : "Synchronicities";

            return (
              <Pressable
                key={item}
                style={[
                  styles.filterButton,

                  selected &&
                    styles.filterSelected,
                ]}
                onPress={() =>
                  setFilter(item)
                }
              >
                <Text
                  style={[
                    styles.filterText,

                    selected &&
                      styles.filterTextSelected,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
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
        experiences.length === 0 ? (
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
              Nothing recorded yet
            </Text>

            <Text
              style={styles.emptyText}
            >
              Dreams and meaningful
              coincidences can be captured
              here whenever they stand out
              to you.
            </Text>

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
          </View>
        ) : (
          <View style={styles.list}>
            {experiences.map(
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

const styles =
  StyleSheet.create({
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
      paddingBottom: 60,
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
      marginBottom: 25,
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

    filters: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 24,
    },

    filterButton: {
      backgroundColor: "#151126",
      borderWidth: 1,
      borderColor: "#302847",
      borderRadius: 18,
      paddingHorizontal: 15,
      paddingVertical: 9,
    },

    filterSelected: {
      backgroundColor: "#5E489D",
      borderColor: "#8F74D2",
    },

    filterText: {
      color: "#A89DBB",
      fontSize: 13,
    },

    filterTextSelected: {
      color: "#FFFFFF",
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
      justifyContent:
        "space-between",
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

    error: {
      color: "#F1A7B9",
      textAlign: "center",
      marginVertical: 20,
    },
  }); 