import { router } from "expo-router";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "../src/context/AuthContext";
import { supabase } from "../src/lib/supabase";

const practices = [
  "Meditation",
  "Prayer",
  "Tarot",
  "Astrology",
  "Breathwork",
];

export default function HomeScreen() {
  const { session } = useAuth();

  const displayName =
    session?.user.user_metadata?.display_name ||
    "Traveler";

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (!error) {
      router.replace("/");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>
              YOUR SOULPATH
            </Text>

            <Text style={styles.greeting}>
              Welcome back, {displayName}
            </Text>

            <Text style={styles.dateText}>
              A quiet space for today's reflection.
            </Text>
          </View>

          <Pressable
            style={styles.profileButton}
            onPress={handleLogout}
          >
            <Text style={styles.profileButtonText}>
              ☾
            </Text>
          </Pressable>
        </View>

        <View style={styles.quoteCard}>
          <Text style={styles.quoteSymbol}>✦</Text>

          <Text style={styles.quote}>
            “What is asking for your attention today?”
          </Text>

          <Text style={styles.quoteHint}>
            Begin with awareness. The rest can follow.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          How are you feeling?
        </Text>

        <View style={styles.trackingGrid}>
          <Pressable style={styles.trackingCard}>
            <Text style={styles.trackingIcon}>
              ◉
            </Text>

            <Text style={styles.trackingLabel}>
              Mood
            </Text>

            <Text style={styles.trackingValue}>
              Check in
            </Text>
          </Pressable>

          <Pressable style={styles.trackingCard}>
            <Text style={styles.trackingIcon}>
              ✧
            </Text>

            <Text style={styles.trackingLabel}>
              Energy
            </Text>

            <Text style={styles.trackingValue}>
              Check in
            </Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Today's practices
          </Text>

          <Text style={styles.sectionAction}>
            Edit
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.practiceContainer
          }
        >
          {practices.map((practice) => (
            <Pressable
              key={practice}
              style={styles.practiceChip}
            >
              <Text style={styles.practiceText}>
                {practice}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.journalCard}>
          <View style={styles.journalTopRow}>
            <Text style={styles.journalSymbol}>
              ✎
            </Text>

            <Text style={styles.journalLabel}>
              DAILY REFLECTION
            </Text>
          </View>

          <Text style={styles.journalTitle}>
            What's moving through you today?
          </Text>

          <Text style={styles.journalDescription}>
            Capture a thought, realization, emotion,
            dream, or moment that feels meaningful.
          </Text>

          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>
              Write Today's Entry
            </Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>
          Your path
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              0
            </Text>

            <Text style={styles.statLabel}>
              Entries
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              0
            </Text>

            <Text style={styles.statLabel}>
              Day streak
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              0
            </Text>

            <Text style={styles.statLabel}>
              Practices
            </Text>
          </View>
        </View>

        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>
            Recent reflections
          </Text>

          <View style={styles.emptyState}>
            <Text style={styles.emptySymbol}>
              ☾
            </Text>

            <Text style={styles.emptyTitle}>
              Your journal is waiting
            </Text>

            <Text style={styles.emptyDescription}>
              Your most recent reflections will appear
              here once you begin writing.
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>
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