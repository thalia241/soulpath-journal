import {
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
  getSoulPathInsights,
  SoulPathInsights,
} from "../../src/services/insightService";

export default function InsightsScreen() {
  const [
    insights,
    setInsights,
  ] =
    useState<SoulPathInsights | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const loadInsights =
    useCallback(async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const data =
          await getSoulPathInsights();

        setInsights(data);
      } catch (error) {
        console.error(
          "Unable to load insights:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your insights."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useFocusEffect(
    useCallback(() => {
      loadInsights();
    }, [loadInsights])
  );

  if (loading) {
    return (
      <SafeAreaView
        style={styles.loadingContainer}
      >
        <ActivityIndicator
          size="large"
          color="#CDB9FF"
        />

        <Text
          style={styles.loadingText}
        >
          Discovering your patterns...
        </Text>
      </SafeAreaView>
    );
  }

  if (!insights) {
    return (
      <SafeAreaView
        style={styles.loadingContainer}
      >
        <Text style={styles.errorText}>
          {errorMessage ||
            "Unable to load insights."}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={loadInsights}
        >
          <Text
            style={styles.retryText}
          >
            Try Again
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const maxMoodCount = Math.max(
    ...insights.moodDistribution.map(
      (item) => item.count
    ),
    1
  );

  const maxEnergyCount = Math.max(
    ...insights.energyDistribution.map(
      (item) => item.count
    ),
    1
  );

  const maxPracticeCount = Math.max(
    ...insights.practiceUsage.map(
      (item) => item.count
    ),
    1
  );

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
        <Text style={styles.eyebrow}>
          YOUR PATTERNS
        </Text>

        <Text style={styles.title}>
          Insights
        </Text>

        <Text style={styles.subtitle}>
          A reflection of the patterns
          appearing across the information
          you've chosen to record.
        </Text>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text
              style={styles.errorText}
            >
              {errorMessage}
            </Text>
          </View>
        ) : null}

        {/* Overview */}
        <Text
          style={styles.sectionTitle}
        >
          Your path at a glance
        </Text>

        <View style={styles.summaryGrid}>
          <View
            style={styles.summaryCard}
          >
            <Text
              style={
                styles.summarySymbol
              }
            >
              ✎
            </Text>

            <Text
              style={
                styles.summaryNumber
              }
            >
              {insights.totalEntries}
            </Text>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Reflections
            </Text>
          </View>

          <View
            style={styles.summaryCard}
          >
            <Text
              style={
                styles.summarySymbol
              }
            >
              ✧
            </Text>

            <Text
              style={
                styles.summaryNumber
              }
            >
              {insights.averageEnergy ??
                "—"}
            </Text>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Avg. energy
            </Text>
          </View>

          <View
            style={styles.summaryCard}
          >
            <Text
              style={
                styles.summarySymbol
              }
            >
              ◉
            </Text>

            <Text
              style={
                styles.summaryWord
              }
              numberOfLines={1}
            >
              {insights.mostCommonMood ??
                "—"}
            </Text>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Top mood
            </Text>
          </View>
        </View>

        {/* Mood Distribution */}
        <View style={styles.dataCard}>
          <View
            style={styles.cardHeadingRow}
          >
            <View>
              <Text
                style={
                  styles.cardEyebrow
                }
              >
                EMOTIONAL PATTERNS
              </Text>

              <Text
                style={
                  styles.cardTitle
                }
              >
                Recorded moods
              </Text>
            </View>

            <Text
              style={styles.cardSymbol}
            >
              ◉
            </Text>
          </View>

          {insights.moodDistribution
            .length === 0 ? (
            <Text
              style={styles.emptyText}
            >
              Mood patterns will appear
              after you begin recording
              moods in your reflections.
            </Text>
          ) : (
            <View
              style={styles.barList}
            >
              {insights.moodDistribution.map(
                (item) => (
                  <View
                    key={item.mood}
                    style={
                      styles.barItem
                    }
                  >
                    <View
                      style={
                        styles.barHeader
                      }
                    >
                      <Text
                        style={
                          styles.barLabel
                        }
                      >
                        {item.mood}
                      </Text>

                      <Text
                        style={
                          styles.barValue
                        }
                      >
                        {item.count}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.barTrack
                      }
                    >
                      <View
                        style={[
                          styles.barFill,

                          {
                            width: `${Math.max(
                              10,
                              (item.count /
                                maxMoodCount) *
                                100
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                )
              )}
            </View>
          )}
        </View>

        {/* Energy */}
        <View style={styles.dataCard}>
          <View
            style={styles.cardHeadingRow}
          >
            <View>
              <Text
                style={
                  styles.cardEyebrow
                }
              >
                ENERGY
              </Text>

              <Text
                style={
                  styles.cardTitle
                }
              >
                Energy distribution
              </Text>
            </View>

            <Text
              style={styles.cardSymbol}
            >
              ✧
            </Text>
          </View>

          <View
            style={
              styles.energyChart
            }
          >
            {insights.energyDistribution.map(
              (item) => {
                const percentage =
                  item.count === 0
                    ? 0
                    : Math.max(
                        12,
                        (item.count /
                          maxEnergyCount) *
                          100
                      );

                return (
                  <View
                    key={item.level}
                    style={
                      styles.energyColumn
                    }
                  >
                    <Text
                      style={
                        styles.energyCount
                      }
                    >
                      {item.count}
                    </Text>

                    <View
                      style={
                        styles.energyBarArea
                      }
                    >
                      <View
                        style={[
                          styles.energyBar,

                          {
                            height: `${percentage}%`,
                          },
                        ]}
                      />
                    </View>

                    <Text
                      style={
                        styles.energyLevel
                      }
                    >
                      {item.level}
                    </Text>
                  </View>
                );
              }
            )}
          </View>

          <View
            style={styles.chartLabels}
          >
            <Text
              style={
                styles.chartHint
              }
            >
              Lower
            </Text>

            <Text
              style={
                styles.chartHint
              }
            >
              Energy level
            </Text>

            <Text
              style={
                styles.chartHint
              }
            >
              Higher
            </Text>
          </View>
        </View>

        {/* Practice usage */}
        <View style={styles.dataCard}>
          <View
            style={styles.cardHeadingRow}
          >
            <View>
              <Text
                style={
                  styles.cardEyebrow
                }
              >
                SPIRITUAL PRACTICE
              </Text>

              <Text
                style={
                  styles.cardTitle
                }
              >
                Practice frequency
              </Text>
            </View>

            <Text
              style={styles.cardSymbol}
            >
              ✦
            </Text>
          </View>

          {insights.practiceUsage
            .length === 0 ? (
            <Text
              style={styles.emptyText}
            >
              Your spiritual practice
              patterns will appear after
              you connect practices to
              journal entries.
            </Text>
          ) : (
            <View
              style={styles.barList}
            >
              {insights.practiceUsage.map(
                (practice) => (
                  <View
                    key={practice.id}
                    style={
                      styles.barItem
                    }
                  >
                    <View
                      style={
                        styles.barHeader
                      }
                    >
                      <Text
                        style={
                          styles.barLabel
                        }
                      >
                        {practice.name}
                      </Text>

                      <Text
                        style={
                          styles.barValue
                        }
                      >
                        {practice.count}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.barTrack
                      }
                    >
                      <View
                        style={[
                          styles.practiceBarFill,

                          {
                            width: `${Math.max(
                              10,
                              (practice.count /
                                maxPracticeCount) *
                                100
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                )
              )}
            </View>
          )}
        </View>

        {/* Dreams + Signs */}
        <Text
          style={styles.sectionTitle}
        >
          Dreams & signs
        </Text>

        <View
          style={
            styles.experienceStats
          }
        >
          <View
            style={
              styles.experienceStatCard
            }
          >
            <Text
              style={
                styles.experienceSymbol
              }
            >
              ☾
            </Text>

            <Text
              style={
                styles.experienceNumber
              }
            >
              {insights.dreamCount}
            </Text>

            <Text
              style={
                styles.experienceLabel
              }
            >
              Dreams recorded
            </Text>
          </View>

          <View
            style={
              styles.experienceStatCard
            }
          >
            <Text
              style={
                styles.experienceSymbol
              }
            >
              ✦
            </Text>

            <Text
              style={
                styles.experienceNumber
              }
            >
              {
                insights.synchronicityCount
              }
            </Text>

            <Text
              style={
                styles.experienceLabel
              }
            >
              Synchronicities
            </Text>
          </View>
        </View>

        {/* Observations */}
        <View
          style={
            styles.observationCard
          }
        >
          <View
            style={
              styles.observationHeader
            }
          >
            <Text
              style={
                styles.observationSymbol
              }
            >
              ✦
            </Text>

            <View>
              <Text
                style={
                  styles.observationEyebrow
                }
              >
                SOULPATH OBSERVATIONS
              </Text>

              <Text
                style={
                  styles.observationTitle
                }
              >
                What your records show
              </Text>
            </View>
          </View>

          {insights.observations.map(
            (observation, index) => (
              <View
                key={`${observation}-${index}`}
                style={
                  styles.observationRow
                }
              >
                <Text
                  style={
                    styles.observationBullet
                  }
                >
                  ·
                </Text>

                <Text
                  style={
                    styles.observationText
                  }
                >
                  {observation}
                </Text>
              </View>
            )
          )}
        </View>

        {/* Disclaimer */}
        <View style={styles.noticeCard}>
          <Text
            style={
              styles.noticeTitle
            }
          >
            Observational insights
          </Text>

          <Text
            style={styles.noticeText}
          >
            These insights summarize
            patterns in information you
            choose to record. They do not
            establish cause and effect and
            are not medical,
            psychological, divinatory, or
            professional advice.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C0A18",
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#0C0A18",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  loadingText: {
    color: "#8E859F",
    marginTop: 14,
  },

  content: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 115,
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
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
    marginBottom: 30,
    maxWidth: 570,
  },

  sectionTitle: {
    color: "#E9E1F7",
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 14,
  },

  summaryGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 30,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#151126",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#29213D",
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: "center",
  },

  summarySymbol: {
    color: "#D4B866",
    fontSize: 19,
    marginBottom: 8,
  },

  summaryNumber: {
    color: "#EFE7FF",
    fontSize: 25,
    fontWeight: "700",
  },

  summaryWord: {
    color: "#EFE7FF",
    fontSize: 17,
    fontWeight: "700",
    maxWidth: "100%",
  },

  summaryLabel: {
    color: "#80768C",
    fontSize: 11,
    marginTop: 5,
    textAlign: "center",
  },

  dataCard: {
    backgroundColor: "#151126",
    borderWidth: 1,
    borderColor: "#29213D",
    borderRadius: 21,
    padding: 20,
    marginBottom: 16,
  },

  cardHeadingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 22,
  },

  cardEyebrow: {
    color: "#8873B8",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
  },

  cardTitle: {
    color: "#EEE6F9",
    fontSize: 19,
    fontWeight: "700",
    marginTop: 4,
  },

  cardSymbol: {
    color: "#D4B866",
    fontSize: 22,
  },

  barList: {
    gap: 17,
  },

  barItem: {
    gap: 7,
  },

  barHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  barLabel: {
    color: "#CFC4DE",
    fontSize: 13,
    fontWeight: "600",
  },

  barValue: {
    color: "#887B98",
    fontSize: 12,
  },

  barTrack: {
    height: 8,
    backgroundColor: "#211B31",
    borderRadius: 4,
    overflow: "hidden",
  },

  barFill: {
    height: "100%",
    backgroundColor: "#7357C7",
    borderRadius: 4,
  },

  practiceBarFill: {
    height: "100%",
    backgroundColor: "#8C6ACA",
    borderRadius: 4,
  },

  energyChart: {
    height: 175,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    gap: 12,
  },

  energyColumn: {
    flex: 1,
    height: "100%",
    alignItems: "center",
  },

  energyCount: {
    color: "#8E849B",
    fontSize: 11,
    marginBottom: 6,
  },

  energyBarArea: {
    flex: 1,
    width: "70%",
    justifyContent: "flex-end",
    backgroundColor: "#211B31",
    borderRadius: 7,
    overflow: "hidden",
  },

  energyBar: {
    width: "100%",
    backgroundColor: "#7357C7",
    borderRadius: 7,
    minHeight: 2,
  },

  energyLevel: {
    color: "#BFB2D1",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
  },

  chartLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  chartHint: {
    color: "#665E70",
    fontSize: 10,
  },

  experienceStats: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },

  experienceStatCard: {
    flex: 1,
    backgroundColor: "#151126",
    borderWidth: 1,
    borderColor: "#29213D",
    borderRadius: 19,
    padding: 20,
  },

  experienceSymbol: {
    color: "#D4B866",
    fontSize: 23,
  },

  experienceNumber: {
    color: "#F0E8FF",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 10,
  },

  experienceLabel: {
    color: "#81778D",
    fontSize: 12,
    marginTop: 4,
  },

  observationCard: {
    backgroundColor: "#1A1430",
    borderWidth: 1,
    borderColor: "#3A2C62",
    borderRadius: 22,
    padding: 22,
    marginBottom: 16,
  },

  observationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 19,
  },

  observationSymbol: {
    color: "#D8BA69",
    fontSize: 22,
  },

  observationEyebrow: {
    color: "#9A82CB",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
  },

  observationTitle: {
    color: "#F0E8FA",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 3,
  },

  observationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 11,
  },

  observationBullet: {
    color: "#B79BE7",
    fontSize: 22,
    lineHeight: 20,
    width: 18,
  },

  observationText: {
    flex: 1,
    color: "#B3A8C1",
    fontSize: 14,
    lineHeight: 21,
  },

  noticeCard: {
    backgroundColor: "#121020",
    borderWidth: 1,
    borderColor: "#29213D",
    borderRadius: 17,
    padding: 18,
  },

  noticeTitle: {
    color: "#C8BAD8",
    fontSize: 14,
    fontWeight: "700",
  },

  noticeText: {
    color: "#7D7488",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
  },

  emptyText: {
    color: "#80778B",
    fontSize: 13,
    lineHeight: 21,
  },

  errorBox: {
    backgroundColor: "#2A151E",
    borderWidth: 1,
    borderColor: "#683248",
    borderRadius: 12,
    padding: 12,
    marginBottom: 22,
  },

  errorText: {
    color: "#F1A7B9",
    textAlign: "center",
    lineHeight: 20,
  },

  retryButton: {
    backgroundColor: "#7357C7",
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 13,
    marginTop: 18,
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
}); 