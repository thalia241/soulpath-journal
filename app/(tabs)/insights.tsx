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
  PracticeObservation,
  SoulPathInsights,
  TrendPeriod,
} from "../../src/services/insightService";

export default function InsightsScreen() {
  const [
    insights,
    setInsights,
  ] =
    useState<SoulPathInsights | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    trendView,
    setTrendView,
  ] =
    useState<7 | 30>(7);

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
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color="#CDB9FF"
        />

        <Text
          style={styles.loadingText}
        >
          Discovering your
          patterns...
        </Text>
      </SafeAreaView>
    );
  }

  if (!insights) {
    return (
      <SafeAreaView
        style={
          styles.loadingContainer
        }
      >
        <Text
          style={styles.errorText}
        >
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

  const activeTrend =
    trendView === 7
      ? insights.sevenDayTrend
      : insights.thirtyDayTrend;

  const maxTrendMood =
    Math.max(
      ...activeTrend.moodDistribution.map(
        (item) => item.count
      ),
      1
    );

  const maxPracticeCount =
    Math.max(
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

        <Text
          style={styles.subtitle}
        >
          See how the patterns in your
          recorded reflections change
          over time.
        </Text>

        {errorMessage ? (
          <View
            style={styles.errorBox}
          >
            <Text
              style={styles.errorText}
            >
              {errorMessage}
            </Text>
          </View>
        ) : null}

        {/* Overall Summary */}
        <Text
          style={styles.sectionTitle}
        >
          Your path at a glance
        </Text>

        <View
          style={styles.summaryGrid}
        >
          <View
            style={styles.summaryCard}
          >
            <Text
              style={styles.summaryIcon}
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
              style={styles.summaryIcon}
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
              style={styles.summaryIcon}
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

        {/* Trend period */}
        <View style={styles.trendCard}>
          <View
            style={
              styles.trendHeading
            }
          >
            <View>
              <Text
                style={
                  styles.cardEyebrow
                }
              >
                RECENT TRENDS
              </Text>

              <Text
                style={styles.cardTitle}
              >
                Reflection window
              </Text>
            </View>

            <Text
              style={styles.cardIcon}
            >
              ◌
            </Text>
          </View>

          <View
            style={
              styles.periodSelector
            }
          >
            <Pressable
              style={[
                styles.periodButton,

                trendView === 7 &&
                  styles.periodButtonSelected,
              ]}
              onPress={() =>
                setTrendView(7)
              }
            >
              <Text
                style={[
                  styles.periodText,

                  trendView === 7 &&
                    styles.periodTextSelected,
                ]}
              >
                7 Days
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.periodButton,

                trendView === 30 &&
                  styles.periodButtonSelected,
              ]}
              onPress={() =>
                setTrendView(30)
              }
            >
              <Text
                style={[
                  styles.periodText,

                  trendView === 30 &&
                    styles.periodTextSelected,
                ]}
              >
                30 Days
              </Text>
            </Pressable>
          </View>

          <TrendSummary
            trend={activeTrend}
          />

          <View
            style={styles.divider}
          />

          <Text
            style={styles.chartTitle}
          >
            Mood frequency
          </Text>

          {activeTrend
            .moodDistribution.length ===
          0 ? (
            <Text
              style={styles.emptyText}
            >
              No moods were recorded
              during this period.
            </Text>
          ) : (
            <View
              style={styles.barList}
            >
              {activeTrend.moodDistribution.map(
                (mood) => (
                  <View
                    key={mood.mood}
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
                        {mood.mood}
                      </Text>

                      <Text
                        style={
                          styles.barValue
                        }
                      >
                        {mood.count}
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
                              8,

                              (mood.count /
                                maxTrendMood) *
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

        {/* 7 vs 30 comparison */}
        <Text
          style={styles.sectionTitle}
        >
          7-day vs. 30-day
        </Text>

        <View
          style={
            styles.comparisonCard
          }
        >
          <ComparisonRow
            label="Reflections"
            seven={
              insights.sevenDayTrend
                .entryCount
            }
            thirty={
              insights.thirtyDayTrend
                .entryCount
            }
          />

          <View
            style={
              styles.comparisonDivider
            }
          />

          <ComparisonRow
            label="Avg. energy"
            seven={
              insights.sevenDayTrend
                .averageEnergy ?? "—"
            }
            thirty={
              insights.thirtyDayTrend
                .averageEnergy ?? "—"
            }
          />

          <View
            style={
              styles.comparisonDivider
            }
          />

          <ComparisonRow
            label="Top mood"
            seven={
              insights.sevenDayTrend
                .mostCommonMood ?? "—"
            }
            thirty={
              insights.thirtyDayTrend
                .mostCommonMood ?? "—"
            }
          />
        </View>

        {/* Practices */}
        <Text
          style={styles.sectionTitle}
        >
          Spiritual practices
        </Text>

        <View style={styles.dataCard}>
          <View
            style={
              styles.cardHeading
            }
          >
            <View>
              <Text
                style={
                  styles.cardEyebrow
                }
              >
                PRACTICE FREQUENCY
              </Text>

              <Text
                style={styles.cardTitle}
              >
                Your recorded practices
              </Text>
            </View>

            <Text
              style={styles.cardIcon}
            >
              ✦
            </Text>
          </View>

          {insights.practiceUsage
            .length === 0 ? (
            <Text
              style={styles.emptyText}
            >
              Practice patterns will
              appear after you connect
              practices to your journal
              entries.
            </Text>
          ) : (
            <View
              style={styles.barList}
            >
              {insights.practiceUsage.map(
                (practice) => (
                  <View
                    key={
                      practice.id
                    }
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
                        {
                          practice.name
                        }
                      </Text>

                      <Text
                        style={
                          styles.barValue
                        }
                      >
                        {
                          practice.count
                        }
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
                              8,

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

        {/* Practice observations */}
        <Text
          style={styles.sectionTitle}
        >
          Practice observations
        </Text>

        {insights.practiceObservations
          .length === 0 ? (
          <View
            style={styles.emptyCard}
          >
            <Text
              style={
                styles.emptySymbol
              }
            >
              ✦
            </Text>

            <Text
              style={
                styles.emptyTitle
              }
            >
              More entries needed
            </Text>

            <Text
              style={styles.emptyText}
            >
              Record spiritual practices
              alongside mood and energy
              to begin seeing
              observations here.
            </Text>
          </View>
        ) : (
          <View
            style={
              styles.practiceObservationList
            }
          >
            {insights.practiceObservations.map(
              (practice) => (
                <PracticeObservationCard
                  key={
                    practice.practiceId
                  }
                  practice={
                    practice
                  }
                />
              )
            )}
          </View>
        )}

        {/* Dreams + signs */}
        <Text
          style={styles.sectionTitle}
        >
          Dreams & signs
        </Text>

        <View
          style={
            styles.experienceRow
          }
        >
          <View
            style={
              styles.experienceCard
            }
          >
            <Text
              style={
                styles.experienceIcon
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
              Dreams
            </Text>
          </View>

          <View
            style={
              styles.experienceCard
            }
          >
            <Text
              style={
                styles.experienceIcon
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
            styles.observationsCard
          }
        >
          <View
            style={
              styles.observationsHeader
            }
          >
            <Text
              style={
                styles.observationIcon
              }
            >
              ✦
            </Text>

            <View>
              <Text
                style={
                  styles.cardEyebrow
                }
              >
                SOULPATH OBSERVATIONS
              </Text>

              <Text
                style={
                  styles.observationsTitle
                }
              >
                What your records show
              </Text>
            </View>
          </View>

          {insights.observations.map(
            (
              observation,
              index
            ) => (
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

        <View
          style={styles.noticeCard}
        >
          <Text
            style={styles.noticeTitle}
          >
            Observational, not causal
          </Text>

          <Text
            style={styles.noticeText}
          >
            SoulPath compares patterns in
            information you choose to
            record. A difference between
            practice days and other days
            does not mean that the
            practice caused the
            difference.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TrendSummary({
  trend,
}: {
  trend: TrendPeriod;
}) {
  return (
    <View
      style={styles.trendStats}
    >
      <View
        style={styles.trendStat}
      >
        <Text
          style={
            styles.trendNumber
          }
        >
          {trend.entryCount}
        </Text>

        <Text
          style={styles.trendLabel}
        >
          Reflections
        </Text>
      </View>

      <View
        style={styles.trendStat}
      >
        <Text
          style={
            styles.trendNumber
          }
        >
          {trend.averageEnergy ??
            "—"}
        </Text>

        <Text
          style={styles.trendLabel}
        >
          Avg. energy
        </Text>
      </View>

      <View
        style={styles.trendStat}
      >
        <Text
          style={
            styles.trendMood
          }
          numberOfLines={1}
        >
          {trend.mostCommonMood ??
            "—"}
        </Text>

        <Text
          style={styles.trendLabel}
        >
          Top mood
        </Text>
      </View>
    </View>
  );
}

function ComparisonRow({
  label,
  seven,
  thirty,
}: {
  label: string;

  seven: string | number;

  thirty: string | number;
}) {
  return (
    <View
      style={styles.comparisonRow}
    >
      <Text
        style={
          styles.comparisonLabel
        }
      >
        {label}
      </Text>

      <View
        style={styles.comparisonValues}
      >
        <View
          style={styles.comparisonValue}
        >
          <Text
            style={
              styles.comparisonNumber
            }
          >
            {seven}
          </Text>

          <Text
            style={
              styles.comparisonPeriod
            }
          >
            7 days
          </Text>
        </View>

        <View
          style={styles.comparisonValue}
        >
          <Text
            style={
              styles.comparisonNumber
            }
          >
            {thirty}
          </Text>

          <Text
            style={
              styles.comparisonPeriod
            }
          >
            30 days
          </Text>
        </View>
      </View>
    </View>
  );
}

function PracticeObservationCard({
  practice,
}: {
  practice: PracticeObservation;
}) {
  let differenceText =
    "Not enough energy data to compare.";

  if (
    practice.energyDifferenceFromOverall !==
    null
  ) {
    const difference =
      practice.energyDifferenceFromOverall;

    if (difference > 0) {
      differenceText = `Recorded energy on these entries averages ${difference.toFixed(
        1
      )} points above your overall average.`;
    } else if (
      difference < 0
    ) {
      differenceText = `Recorded energy on these entries averages ${Math.abs(
        difference
      ).toFixed(
        1
      )} points below your overall average.`;
    } else {
      differenceText =
        "Recorded energy on these entries matches your overall average.";
    }
  }

  return (
    <View
      style={
        styles.practiceObservationCard
      }
    >
      <View
        style={
          styles.practiceObservationHeader
        }
      >
        <Text
          style={
            styles.practiceObservationIcon
          }
        >
          ✦
        </Text>

        <View style={{ flex: 1 }}>
          <Text
            style={
              styles.practiceObservationTitle
            }
          >
            {practice.practiceName}
          </Text>

          <Text
            style={
              styles.practiceObservationCount
            }
          >
            Recorded in{" "}
            {practice.timesRecorded}{" "}
            {practice.timesRecorded ===
            1
              ? "reflection"
              : "reflections"}
          </Text>
        </View>
      </View>

      <View
        style={
          styles.practiceMetrics
        }
      >
        <View
          style={
            styles.practiceMetric
          }
        >
          <Text
            style={
              styles.practiceMetricValue
            }
          >
            {practice.averageEnergy ??
              "—"}
          </Text>

          <Text
            style={
              styles.practiceMetricLabel
            }
          >
            Avg. energy
          </Text>
        </View>

        <View
          style={
            styles.practiceMetric
          }
        >
          <Text
            style={
              styles.practiceMoodValue
            }
            numberOfLines={1}
          >
            {practice.mostCommonMood ??
              "—"}
          </Text>

          <Text
            style={
              styles.practiceMetricLabel
            }
          >
            Common mood
          </Text>
        </View>
      </View>

      <Text
        style={
          styles.practiceObservationText
        }
      >
        {differenceText}
      </Text>
    </View>
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
  },

  sectionTitle: {
    color: "#E9E1F7",
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 14,
    marginTop: 12,
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
    paddingVertical: 19,
    paddingHorizontal: 10,
    alignItems: "center",
  },

  summaryIcon: {
    color: "#D4B866",
    fontSize: 18,
    marginBottom: 7,
  },

  summaryNumber: {
    color: "#EFE7FF",
    fontSize: 25,
    fontWeight: "700",
  },

  summaryWord: {
    color: "#EFE7FF",
    fontSize: 16,
    fontWeight: "700",
    maxWidth: "100%",
  },

  summaryLabel: {
    color: "#80768C",
    fontSize: 11,
    marginTop: 5,
  },

  trendCard: {
    backgroundColor: "#151126",
    borderWidth: 1,
    borderColor: "#29213D",
    borderRadius: 21,
    padding: 20,
    marginBottom: 26,
  },

  trendHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  cardHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 21,
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

  cardIcon: {
    color: "#D4B866",
    fontSize: 21,
  },

  periodSelector: {
    flexDirection: "row",
    backgroundColor: "#100D1B",
    borderRadius: 13,
    padding: 4,
    marginTop: 20,
    marginBottom: 22,
  },

  periodButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },

  periodButtonSelected: {
    backgroundColor: "#5E489D",
  },

  periodText: {
    color: "#80758D",
    fontSize: 13,
    fontWeight: "600",
  },

  periodTextSelected: {
    color: "#FFFFFF",
  },

  trendStats: {
    flexDirection: "row",
    gap: 8,
  },

  trendStat: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#1A152A",
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 6,
  },

  trendNumber: {
    color: "#EDE4FA",
    fontSize: 21,
    fontWeight: "700",
  },

  trendMood: {
    color: "#EDE4FA",
    fontSize: 14,
    fontWeight: "700",
    maxWidth: "100%",
  },

  trendLabel: {
    color: "#776E82",
    fontSize: 10,
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: "#29213D",
    marginVertical: 22,
  },

  chartTitle: {
    color: "#CFC3DD",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 16,
  },

  barList: {
    gap: 16,
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

  comparisonCard: {
    backgroundColor: "#151126",
    borderWidth: 1,
    borderColor: "#29213D",
    borderRadius: 20,
    paddingHorizontal: 18,
    marginBottom: 28,
  },

  comparisonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 17,
  },

  comparisonLabel: {
    flex: 1,
    color: "#BDB1CC",
    fontSize: 13,
    fontWeight: "600",
  },

  comparisonValues: {
    flexDirection: "row",
    width: "55%",
  },

  comparisonValue: {
    flex: 1,
    alignItems: "center",
  },

  comparisonNumber: {
    color: "#EEE5FA",
    fontSize: 15,
    fontWeight: "700",
  },

  comparisonPeriod: {
    color: "#70677C",
    fontSize: 9,
    marginTop: 3,
  },

  comparisonDivider: {
    height: 1,
    backgroundColor: "#29213D",
  },

  dataCard: {
    backgroundColor: "#151126",
    borderWidth: 1,
    borderColor: "#29213D",
    borderRadius: 21,
    padding: 20,
    marginBottom: 28,
  },

  practiceObservationList: {
    gap: 12,
    marginBottom: 28,
  },

  practiceObservationCard: {
    backgroundColor: "#151126",
    borderWidth: 1,
    borderColor: "#302745",
    borderRadius: 19,
    padding: 19,
  },

  practiceObservationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  practiceObservationIcon: {
    color: "#D4B866",
    fontSize: 20,
  },

  practiceObservationTitle: {
    color: "#EEE5FA",
    fontSize: 17,
    fontWeight: "700",
  },

  practiceObservationCount: {
    color: "#7F758B",
    fontSize: 11,
    marginTop: 3,
  },

  practiceMetrics: {
    flexDirection: "row",
    gap: 10,
    marginTop: 17,
  },

  practiceMetric: {
    flex: 1,
    backgroundColor: "#1D172D",
    borderRadius: 13,
    padding: 13,
  },

  practiceMetricValue: {
    color: "#E7DCFA",
    fontSize: 20,
    fontWeight: "700",
  },

  practiceMoodValue: {
    color: "#E7DCFA",
    fontSize: 14,
    fontWeight: "700",
  },

  practiceMetricLabel: {
    color: "#756B80",
    fontSize: 10,
    marginTop: 4,
  },

  practiceObservationText: {
    color: "#998EA5",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 15,
  },

  experienceRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },

  experienceCard: {
    flex: 1,
    backgroundColor: "#151126",
    borderWidth: 1,
    borderColor: "#29213D",
    borderRadius: 19,
    padding: 19,
  },

  experienceIcon: {
    color: "#D4B866",
    fontSize: 21,
  },

  experienceNumber: {
    color: "#F0E8FF",
    fontSize: 27,
    fontWeight: "700",
    marginTop: 9,
  },

  experienceLabel: {
    color: "#81778D",
    fontSize: 11,
    marginTop: 4,
  },

  observationsCard: {
    backgroundColor: "#1A1430",
    borderWidth: 1,
    borderColor: "#3A2C62",
    borderRadius: 22,
    padding: 21,
    marginBottom: 16,
  },

  observationsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 18,
  },

  observationIcon: {
    color: "#D8BA69",
    fontSize: 21,
  },

  observationsTitle: {
    color: "#F0E8FA",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 3,
  },

  observationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
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

  emptyCard: {
    backgroundColor: "#151126",
    borderWidth: 1,
    borderColor: "#29213D",
    borderRadius: 19,
    padding: 24,
    alignItems: "center",
    marginBottom: 28,
  },

  emptySymbol: {
    color: "#A88AD3",
    fontSize: 25,
  },

  emptyTitle: {
    color: "#DAD0E7",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 10,
  },

  emptyText: {
    color: "#80778B",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
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