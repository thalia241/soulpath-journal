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

import SoulCard from "../../src/components/SoulCard";
import SectionHeading from "../../src/components/SectionHeading";

import {
  colors,
  fonts,
  radius,
} from "../../src/theme";

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
            : "Unable to read your patterns."
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
          styles.centered
        }
      >
        <Text
          style={
            styles.loadingSymbol
          }
        >
          ✦
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
          Listening for patterns...
        </Text>
      </SafeAreaView>
    );
  }

  if (!insights) {
    return (
      <SafeAreaView
        style={
          styles.centered
        }
      >
        <Text
          style={
            styles.errorTitle
          }
        >
          The patterns are quiet.
        </Text>

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
          onPress={
            loadInsights
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
      </SafeAreaView>
    );
  }

  const activeTrend =
    trendView === 7
      ? insights.sevenDayTrend
      : insights.thirtyDayTrend;

  const maxMoodCount =
    Math.max(
      ...activeTrend.moodDistribution.map(
        (mood) => mood.count
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
        <Text
          style={styles.title}
        >
          Insights
        </Text>

        <Text
          style={styles.subtitle}
        >
          Patterns along your path,
          drawn only from what you've
          chosen to record.
        </Text>

        <SectionHeading
          title="Your path at a glance"
        />

        <View
          style={styles.summaryRow}
        >
          <SummaryCard
            symbol="✎"
            value={
              insights.totalEntries
            }
            label="reflections"
          />

          <SummaryCard
            symbol="✧"
            value={
              insights.averageEnergy ??
              "—"
            }
            label="avg. energy"
          />

          <SummaryCard
            symbol="◉"
            value={
              insights.mostCommonMood ??
              "—"
            }
            label="common mood"
            small
          />
        </View>

        <SoulCard
          style={
            styles.trendCard
          }
        >
          <Text
            style={
              styles.cardSymbol
            }
          >
            ☾
          </Text>

          <Text
            style={
              styles.cardTitle
            }
          >
            A recent stretch of your
            path
          </Text>

          <Text
            style={
              styles.cardSubtitle
            }
          >
            Choose how much of the
            recent past you want to
            look at.
          </Text>

          <View
            style={
              styles.periodSelector
            }
          >
            <PeriodButton
              label="7 days"
              selected={
                trendView === 7
              }
              onPress={() =>
                setTrendView(7)
              }
            />

            <PeriodButton
              label="30 days"
              selected={
                trendView === 30
              }
              onPress={() =>
                setTrendView(30)
              }
            />
          </View>

          <TrendSummary
            trend={activeTrend}
          />

          <View
            style={styles.divider}
          />

          <Text
            style={
              styles.softHeading
            }
          >
            Moods that surfaced
          </Text>

          {activeTrend.moodDistribution
            .length === 0 ? (
            <Text
              style={
                styles.mutedText
              }
            >
              No moods were recorded
              during this window.
            </Text>
          ) : (
            <View
              style={styles.barList}
            >
              {activeTrend.moodDistribution.map(
                (mood) => (
                  <View
                    key={
                      mood.mood
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
                        {mood.mood}
                      </Text>

                      <Text
                        style={
                          styles.barCount
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
        </SoulCard>

        <SectionHeading
          title="Near & farther"
          subtitle="A small comparison between your recent week and month."
        />

        <SoulCard
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
            style={styles.divider}
          />

          <ComparisonRow
            label="Average energy"
            seven={
              insights.sevenDayTrend
                .averageEnergy ??
              "—"
            }
            thirty={
              insights.thirtyDayTrend
                .averageEnergy ??
              "—"
            }
          />

          <View
            style={styles.divider}
          />

          <ComparisonRow
            label="Mood seen most"
            seven={
              insights.sevenDayTrend
                .mostCommonMood ??
              "—"
            }
            thirty={
              insights.thirtyDayTrend
                .mostCommonMood ??
              "—"
            }
          />
        </SoulCard>

        <SectionHeading
          title="Practices along the way"
          subtitle="Not causes. Just patterns worth noticing."
        />

        {insights.practiceObservations
          .length === 0 ? (
          <SoulCard>
            <Text
              style={
                styles.emptyTitle
              }
            >
              This part needs a little
              more history.
            </Text>

            <Text
              style={
                styles.mutedText
              }
            >
              Record practices alongside
              mood and energy and
              observations will begin to
              gather here.
            </Text>
          </SoulCard>
        ) : (
          <View
            style={
              styles.practiceList
            }
          >
            {insights.practiceObservations.map(
              (practice) => (
                <PracticeCard
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

        <SectionHeading
          title="Dreams & signs"
        />

        <View
          style={
            styles.experienceRow
          }
        >
          <SummaryCard
            symbol="☾"
            value={
              insights.dreamCount
            }
            label="dreams"
          />

          <SummaryCard
            symbol="✦"
            value={
              insights.synchronicityCount
            }
            label="signs"
          />
        </View>

        <SoulCard
          style={
            styles.observationCard
          }
        >
          <Text
            style={
              styles.cardSymbol
            }
          >
            ✦
          </Text>

          <Text
            style={
              styles.observationTitle
            }
          >
            What your records seem to
            be saying
          </Text>

          <Text
            style={
              styles.observationIntro
            }
          >
            These are gentle
            observations, not
            conclusions.
          </Text>

          <View
            style={
              styles.observationList
            }
          >
            {insights.observations.map(
              (
                observation,
                index
              ) => (
                <View
                  key={index}
                  style={
                    styles.observationRow
                  }
                >
                  <Text
                    style={
                      styles.observationBullet
                    }
                  >
                    ✦
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
        </SoulCard>

        <View
          style={styles.notice}
        >
          <Text
            style={styles.noticeText}
          >
            SoulPath reflects patterns
            in the information you
            record. It does not claim
            that a practice, mood,
            dream, or experience caused
            another outcome.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({
  symbol,
  value,
  label,
  small = false,
}: {
  symbol: string;
  value: string | number;
  label: string;
  small?: boolean;
}) {
  return (
    <View
      style={styles.summaryCard}
    >
      <Text
        style={
          styles.summarySymbol
        }
      >
        {symbol}
      </Text>

      <Text
        style={[
          styles.summaryValue,
          small &&
            styles.summaryValueSmall,
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>

      <Text
        style={
          styles.summaryLabel
        }
      >
        {label}
      </Text>
    </View>
  );
}

function PeriodButton({
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
      style={[
        styles.periodButton,
        selected &&
          styles.periodButtonSelected,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.periodText,
          selected &&
            styles.periodTextSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function TrendSummary({
  trend,
}: {
  trend: TrendPeriod;
}) {
  return (
    <View
      style={
        styles.trendSummary
      }
    >
      <View
        style={
          styles.trendStat
        }
      >
        <Text
          style={
            styles.trendValue
          }
        >
          {trend.entryCount}
        </Text>

        <Text
          style={
            styles.trendLabel
          }
        >
          reflections
        </Text>
      </View>

      <View
        style={
          styles.trendStat
        }
      >
        <Text
          style={
            styles.trendValue
          }
        >
          {trend.averageEnergy ??
            "—"}
        </Text>

        <Text
          style={
            styles.trendLabel
          }
        >
          avg. energy
        </Text>
      </View>

      <View
        style={
          styles.trendStat
        }
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
          style={
            styles.trendLabel
          }
        >
          common mood
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
      style={
        styles.comparisonRow
      }
    >
      <Text
        style={
          styles.comparisonLabel
        }
      >
        {label}
      </Text>

      <View
        style={
          styles.comparisonValue
        }
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
        style={
          styles.comparisonValue
        }
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
  );
}

function PracticeCard({
  practice,
}: {
  practice: PracticeObservation;
}) {
  let observation =
    "There isn't enough energy information to compare yet.";

  if (
    practice.energyDifferenceFromOverall !==
    null
  ) {
    const difference =
      practice.energyDifferenceFromOverall;

    if (difference > 0) {
      observation =
        `On entries where this practice was recorded, energy averaged ${difference.toFixed(
          1
        )} points above your overall recorded average.`;
    } else if (
      difference < 0
    ) {
      observation =
        `On entries where this practice was recorded, energy averaged ${Math.abs(
          difference
        ).toFixed(
          1
        )} points below your overall recorded average.`;
    } else {
      observation =
        "Energy on these entries matches your overall recorded average.";
    }
  }

  return (
    <SoulCard>
      <Text
        style={
          styles.practiceSymbol
        }
      >
        ✦
      </Text>

      <Text
        style={
          styles.practiceTitle
        }
      >
        {practice.practiceName}
      </Text>

      <Text
        style={
          styles.practiceCount
        }
      >
        Appears in{" "}
        {practice.timesRecorded}{" "}
        {practice.timesRecorded ===
        1
          ? "reflection"
          : "reflections"}
      </Text>

      <View
        style={
          styles.practiceMetrics
        }
      >
        <View
          style={
            styles.metric
          }
        >
          <Text
            style={
              styles.metricValue
            }
          >
            {practice.averageEnergy ??
              "—"}
          </Text>

          <Text
            style={
              styles.metricLabel
            }
          >
            avg. energy
          </Text>
        </View>

        <View
          style={
            styles.metric
          }
        >
          <Text
            style={
              styles.metricMood
            }
            numberOfLines={1}
          >
            {practice.mostCommonMood ??
              "—"}
          </Text>

          <Text
            style={
              styles.metricLabel
            }
          >
            common mood
          </Text>
        </View>
      </View>

      <Text
        style={
          styles.practiceObservation
        }
      >
        {observation}
      </Text>
    </SoulCard>
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
      padding: 24,
    },

    content: {
      width: "100%",
      maxWidth: 720,
      alignSelf: "center",
      paddingHorizontal: 24,
      paddingTop: 34,
      paddingBottom: 115,
    },

    title: {
      color: colors.text,
      fontFamily: fonts.display,
      fontSize: 40,
    },

    subtitle: {
      color:
        colors.textMuted,
      fontFamily:
        fonts.displayItalic,
      fontSize: 17,
      lineHeight: 23,
      marginTop: 3,
      marginBottom: 34,
      maxWidth: 520,
    },

    summaryRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 34,
    },

    summaryCard: {
      flex: 1,
      backgroundColor:
        colors.surface,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.lg,
      padding: 15,
      alignItems: "center",
    },

    summarySymbol: {
      color: colors.gold,
      fontSize: 16,
    },

    summaryValue: {
      color: colors.text,
      fontFamily: fonts.display,
      fontSize: 28,
      marginTop: 4,
    },

    summaryValueSmall: {
      fontSize: 18,
    },

    summaryLabel: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 9,
    },

    trendCard: {
      marginBottom: 34,
    },

    cardSymbol: {
      color: colors.gold,
      fontSize: 18,
      marginBottom: 9,
    },

    cardTitle: {
      color: colors.text,
      fontFamily: fonts.display,
      fontSize: 27,
    },

    cardSubtitle: {
      color:
        colors.textMuted,
      fontFamily: fonts.body,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 5,
    },

    periodSelector: {
      flexDirection: "row",
      backgroundColor:
        colors.backgroundSoft,
      borderRadius:
        radius.md,
      padding: 4,
      marginTop: 20,
    },

    periodButton: {
      flex: 1,
      paddingVertical: 9,
      alignItems: "center",
      borderRadius:
        radius.sm,
    },

    periodButtonSelected: {
      backgroundColor:
        colors.purpleDark,
    },

    periodText: {
      color: colors.textDim,
      fontFamily:
        fonts.bodySemiBold,
      fontSize: 11,
    },

    periodTextSelected: {
      color: colors.white,
    },

    trendSummary: {
      flexDirection: "row",
      gap: 8,
      marginTop: 20,
    },

    trendStat: {
      flex: 1,
      backgroundColor:
        colors.surfaceRaised,
      borderRadius:
        radius.md,
      padding: 13,
      alignItems: "center",
    },

    trendValue: {
      color: colors.text,
      fontFamily: fonts.display,
      fontSize: 24,
    },

    trendMood: {
      color: colors.text,
      fontFamily:
        fonts.bodySemiBold,
      fontSize: 13,
    },

    trendLabel: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 9,
      marginTop: 2,
    },

    divider: {
      height: 1,
      backgroundColor:
        colors.border,
      marginVertical: 20,
    },

    softHeading: {
      color: colors.textSoft,
      fontFamily: fonts.display,
      fontSize: 20,
      marginBottom: 14,
    },

    barList: {
      gap: 15,
    },

    barItem: {
      gap: 6,
    },

    barHeader: {
      flexDirection: "row",
      justifyContent:
        "space-between",
    },

    barLabel: {
      color: colors.textSoft,
      fontFamily: fonts.body,
      fontSize: 11,
    },

    barCount: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 10,
    },

    barTrack: {
      height: 7,
      backgroundColor:
        colors.surfaceRaised,
      borderRadius: 7,
      overflow: "hidden",
    },

    barFill: {
      height: "100%",
      backgroundColor:
        colors.purple,
      borderRadius: 7,
    },

    comparisonCard: {
      marginBottom: 34,
    },

    comparisonRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    comparisonLabel: {
      flex: 1,
      color: colors.textSoft,
      fontFamily: fonts.body,
      fontSize: 11,
    },

    comparisonValue: {
      width: 76,
      alignItems: "center",
    },

    comparisonNumber: {
      color: colors.text,
      fontFamily:
        fonts.bodySemiBold,
      fontSize: 13,
    },

    comparisonPeriod: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 8,
      marginTop: 2,
    },

    practiceList: {
      gap: 12,
      marginBottom: 34,
    },

    practiceSymbol: {
      color: colors.gold,
      fontSize: 16,
    },

    practiceTitle: {
      color: colors.text,
      fontFamily: fonts.display,
      fontSize: 24,
      marginTop: 5,
    },

    practiceCount: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 10,
      marginTop: 2,
    },

    practiceMetrics: {
      flexDirection: "row",
      gap: 8,
      marginTop: 15,
    },

    metric: {
      flex: 1,
      backgroundColor:
        colors.surfaceRaised,
      borderRadius:
        radius.md,
      padding: 12,
    },

    metricValue: {
      color: colors.text,
      fontFamily: fonts.display,
      fontSize: 23,
    },

    metricMood: {
      color: colors.text,
      fontFamily:
        fonts.bodySemiBold,
      fontSize: 13,
    },

    metricLabel: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 9,
      marginTop: 2,
    },

    practiceObservation: {
      color:
        colors.textMuted,
      fontFamily: fonts.body,
      fontSize: 11,
      lineHeight: 18,
      marginTop: 14,
    },

    experienceRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 34,
    },

    observationCard: {
      borderColor:
        colors.borderStrong,
      backgroundColor:
        "#18122B",
    },

    observationTitle: {
      color: colors.text,
      fontFamily:
        fonts.displayItalic,
      fontSize: 25,
      lineHeight: 30,
    },

    observationIntro: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 11,
      marginTop: 5,
      marginBottom: 17,
    },

    observationList: {
      gap: 12,
    },

    observationRow: {
      flexDirection: "row",
      alignItems:
        "flex-start",
      gap: 9,
    },

    observationBullet: {
      color: colors.gold,
      fontSize: 10,
      marginTop: 5,
    },

    observationText: {
      flex: 1,
      color:
        colors.textMuted,
      fontFamily: fonts.body,
      fontSize: 12,
      lineHeight: 19,
    },

    notice: {
      paddingHorizontal: 8,
      paddingVertical: 18,
    },

    noticeText: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 10,
      lineHeight: 16,
      textAlign: "center",
    },

    mutedText: {
      color: colors.textMuted,
      fontFamily: fonts.body,
      fontSize: 12,
      lineHeight: 19,
      marginTop: 6,
    },

    emptyTitle: {
      color: colors.text,
      fontFamily: fonts.display,
      fontSize: 22,
    },

    loadingSymbol: {
      color: colors.gold,
      fontSize: 26,
      marginBottom: 18,
    },

    loadingText: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 12,
      marginTop: 12,
    },

    errorTitle: {
      color: colors.text,
      fontFamily: fonts.display,
      fontSize: 25,
    },

    errorText: {
      color: colors.errorText,
      fontFamily: fonts.body,
      fontSize: 12,
      marginTop: 8,
      textAlign: "center",
    },

    retryButton: {
      backgroundColor:
        colors.purple,
      paddingHorizontal: 19,
      paddingVertical: 11,
      borderRadius:
        radius.md,
      marginTop: 20,
    },

    retryText: {
      color: colors.white,
      fontFamily:
        fonts.bodySemiBold,
    },
  }); 