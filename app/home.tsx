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

import {
  useAuth,
} from "../src/context/AuthContext";

import {
  supabase,
} from "../src/lib/supabase";

import {
  getJournalEntryCount,
  getJournalStreak,
  getRecentJournalEntries,
  getTodayJournalEntry,
  JournalEntry,
} from "../src/services/journalService";

import {
  getTodayPractices,
  getUniquePracticeCount,
  Practice,
} from "../src/services/practiceService";

export default function HomeScreen() {
  const { session } = useAuth();

  const displayName =
    session?.user.user_metadata
      ?.display_name ||
    "Traveler";

  const [entryCount, setEntryCount] =
    useState(0);

  const [streak, setStreak] =
    useState(0);

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
  ] = useState<JournalEntry[]>([]);

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

        setStreak(
          journalStreak
        );

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
        setDashboardLoading(false);
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

    router.push("/journal/new");
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

    router.push("/journal/new");
  }

  async function handleLogout() {
    const { error } =
      await supabase.auth.signOut();

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
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>
              YOUR SOULPATH
            </Text>

            <Text style={styles.greeting}>
              Welcome back,{" "}
              {displayName}
            </Text>

            <Text style={styles.dateText}>
              A quiet space for today's
              reflection.
            </Text>
          </View>

          <Pressable
            style={styles.profileButton}
            onPress={handleLogout}
          >
            <Text
              style={
                styles.profileButtonText
              }
            >
              ☾
            </Text>
          </Pressable>
        </View>

        {/* Prompt */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteSymbol}>
            ✦
          </Text>

          <Text style={styles.quote}>
            “What is asking for your
            attention today?”
          </Text>

          <Text style={styles.quoteHint}>
            Begin with awareness. The rest
            can follow.
          </Text>
        </View>

        {/* Mood + energy */}
        <Text style={styles.sectionTitle}>
          How are you feeling?
        </Text>

        <View style={styles.trackingGrid}>
          <Pressable
            style={styles.trackingCard}
            onPress={editTodayEntry}
          >
            <Text
              style={
                styles.trackingIcon
              }
            >
              ◉
            </Text>

            <Text
              style={
                styles.trackingLabel
              }
            >
              Mood
            </Text>

            <Text
              style={
                styles.trackingValue
              }
            >
              {dashboardLoading
                ? "..."
                : todayEntry?.mood ??
                  "Check in"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.trackingCard}
            onPress={editTodayEntry}
          >
            <Text
              style={
                styles.trackingIcon
              }
            >
              ✧
            </Text>

            <Text
              style={
                styles.trackingLabel
              }
            >
              Energy
            </Text>

            <Text
              style={
                styles.trackingValue
              }
            >
              {dashboardLoading
                ? "..."
                : todayEntry
                    ?.energy_level
                  ? `${todayEntry.energy_level} / 5`
                  : "Check in"}
            </Text>
          </Pressable>
        </View>

        {/* Practices */}
        <View
          style={
            styles.sectionHeader
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Today's practices
          </Text>

          <Pressable
            onPress={editTodayEntry}
          >
            <Text
              style={
                styles.sectionAction
              }
            >
              {todayEntry
                ? "Edit"
                : "Add"}
            </Text>
          </Pressable>
        </View>

        {dashboardLoading ? (
          <Text
            style={
              styles.practiceLoadingText
            }
          >
            Loading practices...
          </Text>
        ) : todayPractices.length ===
          0 ? (
          <Pressable
            style={
              styles.practiceEmpty
            }
            onPress={editTodayEntry}
          >
            <Text
              style={
                styles.practiceEmptySymbol
              }
            >
              ✦
            </Text>

            <View
              style={
                styles.practiceEmptyContent
              }
            >
              <Text
                style={
                  styles.practiceEmptyTitle
                }
              >
                No practices recorded yet
              </Text>

              <Text
                style={
                  styles.practiceEmptyText
                }
              >
                Tap to add today's
                spiritual practice.
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
              styles.practiceContainer
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
                      styles.practiceText
                    }
                  >
                    {practice.name}
                  </Text>
                </Pressable>
              )
            )}
          </ScrollView>
        )}

        {/* Reflection card */}
        <View style={styles.journalCard}>
          <View
            style={
              styles.journalTopRow
            }
          >
            <Text
              style={
                styles.journalSymbol
              }
            >
              ✎
            </Text>

            <Text
              style={
                styles.journalLabel
              }
            >
              DAILY REFLECTION
            </Text>
          </View>

          <Text
            style={
              styles.journalTitle
            }
          >
            What's moving through you
            today?
          </Text>

          <Text
            style={
              styles.journalDescription
            }
          >
            Capture a thought,
            realization, emotion, dream,
            or moment that feels
            meaningful.
          </Text>

          <Pressable
            style={
              styles.primaryButton
            }
            onPress={openTodayEntry}
          >
            <Text
              style={
                styles.primaryButtonText
              }
            >
              {todayEntry
                ? "View Today's Reflection"
                : "Write Today's Entry"}
            </Text>
          </Pressable>

          <Pressable
            style={
              styles.secondaryJournalButton
            }
            onPress={() =>
              router.push("/journal")
            }
          >
            <Text
              style={
                styles.secondaryJournalText
              }
            >
              View Journal
            </Text>
          </Pressable>
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>
          Your path
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
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
              Entries
            </Text>
          </View>

          <View style={styles.statCard}>
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
              Day streak
            </Text>
          </View>

          <View style={styles.statCard}>
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
              Practices
            </Text>
          </View>
        </View>

        {/* Recent reflections */}
        <View
          style={
            styles.recentSection
          }
        >
          <View
            style={
              styles.sectionHeader
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Recent reflections
            </Text>

            {recentEntries.length >
            0 ? (
              <Pressable
                onPress={() =>
                  router.push(
                    "/journal"
                  )
                }
              >
                <Text
                  style={
                    styles.sectionAction
                  }
                >
                  View all
                </Text>
              </Pressable>
            ) : null}
          </View>

          {dashboardLoading ? (
            <Text
              style={
                styles.loadingText
              }
            >
              Gathering your
              reflections...
            </Text>
          ) : recentEntries.length ===
            0 ? (
            <View
              style={
                styles.emptyState
              }
            >
              <Text
                style={
                  styles.emptySymbol
                }
              >
                ☾
              </Text>

              <Text
                style={
                  styles.emptyTitle
                }
              >
                Your journal is waiting
              </Text>

              <Text
                style={
                  styles.emptyDescription
                }
              >
                Your most recent
                reflections will appear
                here once you begin
                writing.
              </Text>
            </View>
          ) : (
            <View
              style={
                styles.recentList
              }
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
                      {
                        entry.entry_date
                      }
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
                        styles.recentPreview
                      }
                      numberOfLines={2}
                    >
                      {entry.content}
                    </Text>

                    <View
                      style={
                        styles.recentMetadata
                      }
                    >
                      {entry.mood ? (
                        <Text
                          style={
                            styles.recentChip
                          }
                        >
                          {entry.mood}
                        </Text>
                      ) : null}

                      {entry.energy_level ? (
                        <Text
                          style={
                            styles.recentChip
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
        </View>

        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text
            style={
              styles.logoutText
            }
          >
            Sign Out
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C0A18",
  },

  scrollContent: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 60,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
  },

  headerText: {
    flex: 1,
    paddingRight: 18,
  },

  eyebrow: {
    color: "#8773B8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 8,
  },

  greeting: {
    color: "#F5F0FF",
    fontSize: 30,
    fontWeight: "700",
  },

  dateText: {
    color: "#8E859F",
    fontSize: 15,
    marginTop: 7,
  },

  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#171329",
    borderWidth: 1,
    borderColor: "#302847",
    justifyContent: "center",
    alignItems: "center",
  },

  profileButtonText: {
    color: "#D9C6FF",
    fontSize: 25,
  },

  quoteCard: {
    backgroundColor: "#151126",
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: "#29213D",
    marginBottom: 34,
  },

  quoteSymbol: {
    color: "#D4B866",
    fontSize: 18,
    marginBottom: 12,
  },

  quote: {
    color: "#EEE6FF",
    fontSize: 21,
    lineHeight: 30,
    fontWeight: "600",
  },

  quoteHint: {
    color: "#847B95",
    fontSize: 14,
    marginTop: 12,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    color: "#E9E1F7",
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 16,
  },

  sectionAction: {
    color: "#A78DE3",
    fontSize: 14,
    marginBottom: 16,
  },

  trackingGrid: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 34,
  },

  trackingCard: {
    flex: 1,
    backgroundColor: "#151126",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#29213D",
    padding: 18,
  },

  trackingIcon: {
    color: "#CDB9FF",
    fontSize: 23,
    marginBottom: 18,
  },

  trackingLabel: {
    color: "#8F859F",
    fontSize: 13,
  },

  trackingValue: {
    color: "#F0E9FF",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 4,
  },

  practiceContainer: {
    gap: 10,
    paddingBottom: 34,
  },

  practiceChip: {
    backgroundColor: "#171329",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#31284A",
    paddingHorizontal: 18,
    paddingVertical: 11,
  },

  practiceText: {
    color: "#C8B7E8",
    fontSize: 14,
  },

  practiceLoadingText: {
    color: "#7E758C",
    fontSize: 13,
    marginBottom: 34,
  },

  practiceEmpty: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#151126",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#29213D",
    padding: 17,
    marginBottom: 34,
  },

  practiceEmptyContent: {
    flex: 1,
  },

  practiceEmptySymbol: {
    color: "#A98DE3",
    fontSize: 21,
  },

  practiceEmptyTitle: {
    color: "#D9D0E8",
    fontSize: 14,
    fontWeight: "600",
  },

  practiceEmptyText: {
    color: "#7E758C",
    fontSize: 13,
    marginTop: 3,
  },

  journalCard: {
    backgroundColor: "#1A1430",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#3A2C62",
    marginBottom: 36,
  },

  journalTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },

  journalSymbol: {
    color: "#D8BA69",
    fontSize: 17,
  },

  journalLabel: {
    color: "#9A82CB",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  journalTitle: {
    color: "#F4EEFF",
    fontSize: 22,
    fontWeight: "700",
  },

  journalDescription: {
    color: "#9187A3",
    lineHeight: 22,
    fontSize: 14,
    marginTop: 9,
  },

  primaryButton: {
    backgroundColor: "#7357C7",
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 22,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  secondaryJournalButton: {
    alignItems: "center",
    paddingVertical: 13,
    marginTop: 5,
  },

  secondaryJournalText: {
    color: "#B8A5DC",
    fontSize: 14,
    fontWeight: "600",
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 36,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#151126",
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#29213D",
  },

  statNumber: {
    color: "#E7D9FF",
    fontSize: 24,
    fontWeight: "700",
  },

  statLabel: {
    color: "#7F778C",
    fontSize: 12,
    marginTop: 5,
  },

  recentSection: {
    marginTop: 2,
  },

  loadingText: {
    color: "#83798D",
    textAlign: "center",
    paddingVertical: 30,
  },

  emptyState: {
    backgroundColor: "#121020",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#252039",
  },

  emptySymbol: {
    color: "#75649B",
    fontSize: 34,
    marginBottom: 12,
  },

  emptyTitle: {
    color: "#D9D0E8",
    fontSize: 17,
    fontWeight: "600",
  },

  emptyDescription: {
    color: "#777080",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    maxWidth: 360,
  },

  recentList: {
    gap: 12,
  },

  recentCard: {
    backgroundColor: "#151126",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#29213D",
  },

  recentDate: {
    color: "#81758F",
    fontSize: 12,
  },

  recentTitle: {
    color: "#EFE8FA",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 5,
  },

  recentPreview: {
    color: "#948A9F",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 7,
  },

  recentMetadata: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },

  recentChip: {
    color: "#B5A4D3",
    backgroundColor: "#211A35",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    fontSize: 12,
  },

  logoutButton: {
    alignSelf: "center",
    marginTop: 38,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  logoutText: {
    color: "#726A80",
    fontSize: 13,
  },
}); 