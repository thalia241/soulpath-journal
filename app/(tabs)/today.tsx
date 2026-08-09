import {
  router,
  useFocusEffect,
} from "expo-router";

import {
  useCallback,
  useState,
} from "react";

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import SoulButton from "../../src/components/SoulButton";
import SoulCard from "../../src/components/SoulCard";
import SectionHeading from "../../src/components/SectionHeading";

import {
  colors,
  fonts,
  radius,
  spacing,
} from "../../src/theme";

import {
  useAuth,
} from "../../src/context/AuthContext";

import {
  supabase,
} from "../../src/lib/supabase";

import {
  getJournalEntryCount,
  getJournalStreak,
  getRecentJournalEntries,
  getTodayJournalEntry,
  JournalEntry,
} from "../../src/services/journalService";

import {
  getTodayPractices,
  getUniquePracticeCount,
  Practice,
} from "../../src/services/practiceService";

export default function TodayScreen() {
  const { session } =
    useAuth();

  const displayName =
    session?.user.user_metadata
      ?.display_name ||
    "Traveler";

  const [
    entryCount,
    setEntryCount,
  ] = useState(0);

  const [
    streak,
    setStreak,
  ] = useState(0);

  const [
    practiceCount,
    setPracticeCount,
  ] = useState(0);

  const [
    todayEntry,
    setTodayEntry,
  ] =
    useState<JournalEntry | null>(
      null
    );

  const [
    todayPractices,
    setTodayPractices,
  ] = useState<Practice[]>([]);

  const [
    recentEntries,
    setRecentEntries,
  ] =
    useState<JournalEntry[]>([]);

  const [
    dashboardLoading,
    setDashboardLoading,
  ] = useState(true);

  const loadDashboard =
    useCallback(async () => {
      try {
        setDashboardLoading(true);

        const [
          count,
          journalStreak,
          todaysEntry,
          recent,
          practices,
          uniquePracticeCount,
        ] = await Promise.all([
          getJournalEntryCount(),
          getJournalStreak(),
          getTodayJournalEntry(),
          getRecentJournalEntries(3),
          getTodayPractices(),
          getUniquePracticeCount(),
        ]);

        setEntryCount(count);
        setStreak(journalStreak);

        setTodayEntry(
          todaysEntry
        );

        setRecentEntries(
          recent
        );

        setTodayPractices(
          practices
        );

        setPracticeCount(
          uniquePracticeCount
        );
      } catch (error) {
        console.error(
          "Unable to load SoulPath dashboard:",
          error
        );
      } finally {
        setDashboardLoading(
          false
        );
      }
    }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  function openTodayEntry() {
    if (todayEntry) {
      router.push({
        pathname:
          "/journal/[id]",

        params: {
          id: todayEntry.id,
        },
      });

      return;
    }

    router.push(
      "/journal/new"
    );
  }

  function editTodayEntry() {
    if (todayEntry) {
      router.push({
        pathname:
          "/journal/edit/[id]",

        params: {
          id: todayEntry.id,
        },
      });

      return;
    }

    router.push(
      "/journal/new"
    );
  }

  async function handleLogout() {
    const { error } =
      await supabase.auth.signOut({
        scope: "local",
      });

    if (error) {
      console.error(
        "Unable to sign out:",
        error
      );

      return;
    }

    router.replace("/");
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
        <View
          style={styles.topRow}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={
                styles.smallGreeting
              }
            >
              Welcome back,
            </Text>

            <Text
              style={
                styles.greeting
              }
            >
              {displayName}
            </Text>
          </View>

          <Pressable
            style={styles.moonButton}
            onPress={() =>
              router.push(
                "/settings"
              )
            }
          >
            <Text
              style={styles.moon}
            >
              ☾
            </Text>
          </Pressable>
        </View>

        <View
          style={
            styles.reflectionPrompt
          }
        >
          <Text
            style={
              styles.promptSymbol
            }
          >
            ✦
          </Text>

          <Text
            style={
              styles.prompt
            }
          >
            What has stayed with you
            today?
          </Text>

          <Text
            style={
              styles.promptSubtext
            }
          >
            You don't have to understand
            it yet. Just notice what is
            here.
          </Text>
        </View>

        <SectionHeading
          title="How are you feeling?"
        />

        <View
          style={styles.checkInRow}
        >
          <Pressable
            style={
              styles.checkInCard
            }
            onPress={
              editTodayEntry
            }
          >
            <Text
              style={
                styles.checkInSymbol
              }
            >
              ◉
            </Text>

            <Text
              style={
                styles.checkInLabel
              }
            >
              Mood
            </Text>

            <Text
              style={
                styles.checkInValue
              }
            >
              {dashboardLoading
                ? "..."
                : todayEntry?.mood ||
                  "Check in"}
            </Text>
          </Pressable>

          <Pressable
            style={
              styles.checkInCard
            }
            onPress={
              editTodayEntry
            }
          >
            <Text
              style={
                styles.checkInSymbol
              }
            >
              ✧
            </Text>

            <Text
              style={
                styles.checkInLabel
              }
            >
              Energy
            </Text>

            <Text
              style={
                styles.checkInValue
              }
            >
              {dashboardLoading
                ? "..."
                : todayEntry
                    ?.energy_level
                  ? `${todayEntry.energy_level}/5`
                  : "Check in"}
            </Text>
          </Pressable>
        </View>

        <SectionHeading
          title="Today's practices"
          subtitle="Small rituals can become landmarks."
        />

        {dashboardLoading ? (
          <Text
            style={
              styles.mutedText
            }
          >
            Gathering today's
            practices...
          </Text>
        ) : todayPractices.length ===
          0 ? (
          <Pressable
            style={
              styles.practiceEmpty
            }
            onPress={
              editTodayEntry
            }
          >
            <Text
              style={
                styles.practiceSymbol
              }
            >
              ✦
            </Text>

            <View style={{ flex: 1 }}>
              <Text
                style={
                  styles.practiceEmptyTitle
                }
              >
                No practice recorded yet
              </Text>

              <Text
                style={
                  styles.practiceEmptyText
                }
              >
                Add whatever supported
                your inner life today.
              </Text>
            </View>
          </Pressable>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.practiceRow
            }
          >
            {todayPractices.map(
              (practice) => (
                <Pressable
                  key={practice.id}
                  style={
                    styles.practiceChip
                  }
                  onPress={
                    editTodayEntry
                  }
                >
                  <Text
                    style={
                      styles.practiceChipText
                    }
                  >
                    ✦{" "}
                    {practice.name}
                  </Text>
                </Pressable>
              )
            )}
          </ScrollView>
        )}

        <SoulCard
          style={
            styles.journalCard
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
              styles.journalTitle
            }
          >
            A place for what wants to be
            remembered.
          </Text>

          <Text
            style={
              styles.journalBody
            }
          >
            Write without needing to
            solve anything. A thought,
            feeling, question, memory, or
            realization is enough.
          </Text>

          <View
            style={
              styles.primaryAction
            }
          >
            <SoulButton
              title={
                todayEntry
                  ? "Read today's reflection"
                  : "Write today's reflection"
              }
              onPress={
                openTodayEntry
              }
            />
          </View>

          <SoulButton
            title="Visit your journal"
            variant="ghost"
            onPress={() =>
              router.push(
                "/journal"
              )
            }
          />
        </SoulCard>

        <SoulCard
          style={
            styles.experienceCard
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
              styles.experienceTitle
            }
          >
            Dreams & Signs
          </Text>

          <Text
            style={
              styles.experienceQuote
            }
          >
            The things that linger after
            waking. The coincidences that
            ask to be noticed.
          </Text>

          <View
            style={
              styles.primaryAction
            }
          >
            <SoulButton
              title="Explore dreams & signs"
              variant="secondary"
              onPress={() =>
                router.push(
                  "/experiences"
                )
              }
            />
          </View>

          <SoulButton
            title="Record something new"
            variant="ghost"
            onPress={() =>
              router.push(
                "/experiences/new"
              )
            }
          />
        </SoulCard>

        <SectionHeading
          title="Your path so far"
        />

        <View
          style={styles.statsRow}
        >
          <View
            style={styles.stat}
          >
            <Text
              style={
                styles.statNumber
              }
            >
              {dashboardLoading
                ? "—"
                : entryCount}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              reflections
            </Text>
          </View>

          <View
            style={styles.stat}
          >
            <Text
              style={
                styles.statNumber
              }
            >
              {dashboardLoading
                ? "—"
                : streak}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              day streak
            </Text>
          </View>

          <View
            style={styles.stat}
          >
            <Text
              style={
                styles.statNumber
              }
            >
              {dashboardLoading
                ? "—"
                : practiceCount}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              practices
            </Text>
          </View>
        </View>

        <SectionHeading
          title="Recently"
          subtitle="Pieces of your path you have already left behind."
        />

        {dashboardLoading ? (
          <Text
            style={
              styles.mutedText
            }
          >
            Gathering your recent
            reflections...
          </Text>
        ) : recentEntries.length ===
          0 ? (
          <SoulCard>
            <Text
              style={
                styles.emptyTitle
              }
            >
              Your pages are still quiet.
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Your recent reflections
              will gather here as your
              journal grows.
            </Text>
          </SoulCard>
        ) : (
          <View
            style={styles.recentList}
          >
            {recentEntries.map(
              (entry) => (
                <Pressable
                  key={entry.id}
                  style={
                    styles.recentCard
                  }
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
                      styles.recentDate
                    }
                  >
                    {entry.entry_date}
                  </Text>

                  <Text
                    style={
                      styles.recentTitle
                    }
                  >
                    {entry.title}
                  </Text>

                  <Text
                    style={
                      styles.recentBody
                    }
                    numberOfLines={2}
                  >
                    {entry.content}
                  </Text>

                  <View
                    style={
                      styles.recentMeta
                    }
                  >
                    {entry.mood ? (
                      <Text
                        style={
                          styles.metaText
                        }
                      >
                        {entry.mood}
                      </Text>
                    ) : null}

                    {entry.energy_level ? (
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
                    ) : null}
                  </View>
                </Pressable>
              )
            )}
          </View>
        )}

        <Pressable
          style={
            styles.quietSignOut
          }
          onPress={
            handleLogout
          }
        >
          <Text
            style={
              styles.quietSignOutText
            }
          >
            Sign out
          </Text>
        </Pressable>
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
      maxWidth: 760,
      alignSelf: "center",
      paddingHorizontal: 24,
      paddingTop: 34,
      paddingBottom: 115,
    },

    topRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 34,
    },

    smallGreeting: {
      color: colors.textMuted,
      fontFamily: fonts.body,
      fontSize: 13,
    },

    greeting: {
      color: colors.text,
      fontFamily: fonts.display,
      fontSize: 39,
      lineHeight: 43,
      marginTop: 1,
    },

    moonButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor:
        colors.surface,
      borderWidth: 1,
      borderColor:
        colors.border,
      justifyContent: "center",
      alignItems: "center",
    },

    moon: {
      color: colors.gold,
      fontSize: 23,
    },

    reflectionPrompt: {
      paddingVertical: 10,
      paddingHorizontal: 5,
      marginBottom: 38,
    },

    promptSymbol: {
      color: colors.gold,
      fontSize: 17,
      marginBottom: 10,
    },

    prompt: {
      color: colors.text,
      fontFamily:
        fonts.displayItalic,
      fontSize: 30,
      lineHeight: 36,
      maxWidth: 540,
    },

    promptSubtext: {
      color: colors.textMuted,
      fontFamily: fonts.body,
      fontSize: 13,
      lineHeight: 20,
      marginTop: 11,
      maxWidth: 470,
    },

    checkInRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 34,
    },

    checkInCard: {
      flex: 1,
      backgroundColor:
        colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor:
        colors.border,
      padding: 17,
    },

    checkInSymbol: {
      color: colors.gold,
      fontSize: 18,
      marginBottom: 13,
    },

    checkInLabel: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 11,
    },

    checkInValue: {
      color: colors.textSoft,
      fontFamily:
        fonts.bodySemiBold,
      fontSize: 15,
      marginTop: 3,
    },

    mutedText: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 12,
      marginBottom: 30,
    },

    practiceEmpty: {
      flexDirection: "row",
      gap: 13,
      alignItems: "center",
      backgroundColor:
        colors.surface,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: radius.lg,
      padding: 17,
      marginBottom: 34,
    },

    practiceSymbol: {
      color: colors.gold,
      fontSize: 19,
    },

    practiceEmptyTitle: {
      color: colors.textSoft,
      fontFamily:
        fonts.bodySemiBold,
      fontSize: 13,
    },

    practiceEmptyText: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 11,
      marginTop: 3,
    },

    practiceRow: {
      gap: 9,
      paddingBottom: 34,
    },

    practiceChip: {
      backgroundColor:
        colors.surfaceSoft,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: radius.pill,
      paddingHorizontal: 15,
      paddingVertical: 10,
    },

    practiceChipText: {
      color: colors.lavender,
      fontFamily:
        fonts.bodySemiBold,
      fontSize: 12,
    },

    journalCard: {
      marginBottom: 18,
      borderColor:
        colors.borderStrong,
      backgroundColor: "#18122B",
    },

    cardSymbol: {
      color: colors.gold,
      fontSize: 20,
      marginBottom: 12,
    },

    journalTitle: {
      color: colors.text,
      fontFamily: fonts.display,
      fontSize: 27,
      lineHeight: 31,
    },

    journalBody: {
      color: colors.textMuted,
      fontFamily: fonts.body,
      fontSize: 13,
      lineHeight: 21,
      marginTop: 10,
    },

    primaryAction: {
      marginTop: 21,
    },

    experienceCard: {
      marginBottom: 36,
    },

    experienceTitle: {
      color: colors.text,
      fontFamily: fonts.display,
      fontSize: 29,
    },

    experienceQuote: {
      color: colors.textMuted,
      fontFamily:
        fonts.displayItalic,
      fontSize: 18,
      lineHeight: 25,
      marginTop: 7,
    },

    statsRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 37,
    },

    stat: {
      flex: 1,
      backgroundColor:
        colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor:
        colors.border,
      alignItems: "center",
      paddingVertical: 18,
      paddingHorizontal: 8,
    },

    statNumber: {
      color: colors.text,
      fontFamily: fonts.display,
      fontSize: 30,
    },

    statLabel: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 10,
      marginTop: -1,
    },

    recentList: {
      gap: 11,
    },

    recentCard: {
      backgroundColor:
        colors.surface,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: radius.lg,
      padding: 18,
    },

    recentDate: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 10,
    },

    recentTitle: {
      color: colors.text,
      fontFamily: fonts.display,
      fontSize: 22,
      marginTop: 5,
    },

    recentBody: {
      color: colors.textMuted,
      fontFamily: fonts.body,
      fontSize: 12,
      lineHeight: 19,
      marginTop: 6,
    },

    recentMeta: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 7,
      marginTop: 11,
    },

    metaText: {
      color: colors.lavender,
      backgroundColor:
        colors.surfaceRaised,
      fontFamily: fonts.body,
      fontSize: 10,
      borderRadius: radius.pill,
      paddingHorizontal: 9,
      paddingVertical: 4,
    },

    emptyTitle: {
      color: colors.text,
      fontFamily: fonts.display,
      fontSize: 23,
      textAlign: "center",
    },

    emptyText: {
      color: colors.textMuted,
      fontFamily: fonts.body,
      textAlign: "center",
      lineHeight: 20,
      marginTop: 7,
    },

    quietSignOut: {
      alignSelf: "center",
      padding: 18,
      marginTop: 28,
    },

    quietSignOutText: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 11,
    },
  });