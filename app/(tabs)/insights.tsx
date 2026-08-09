import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function InsightsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>
          YOUR PATTERNS
        </Text>

        <Text style={styles.title}>
          Insights
        </Text>

        <Text style={styles.subtitle}>
          Discover patterns across your reflections,
          moods, energy, practices, dreams, and
          meaningful experiences.
        </Text>

        <View style={styles.featureCard}>
          <Text style={styles.symbol}>✦</Text>

          <Text style={styles.cardTitle}>
            Reflection patterns
          </Text>

          <Text style={styles.cardDescription}>
            As you continue journaling, SoulPath will
            surface patterns in your recorded moods,
            energy levels, and reflections.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.symbol}>☾</Text>

          <Text style={styles.cardTitle}>
            Dream patterns
          </Text>

          <Text style={styles.cardDescription}>
            Explore recurring themes and patterns
            across the dreams you choose to record.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.symbol}>◉</Text>

          <Text style={styles.cardTitle}>
            Practice observations
          </Text>

          <Text style={styles.cardDescription}>
            See how your recorded moods and energy
            vary across days when different spiritual
            practices are selected.
          </Text>
        </View>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>
            Insights are observational
          </Text>

          <Text style={styles.noticeText}>
            SoulPath reflects patterns in the
            information you record. It does not claim
            that one practice, dream, or experience
            causes a particular emotional or physical
            outcome.
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

  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 110,
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
    marginBottom: 28,
    maxWidth: 560,
  },

  featureCard: {
    backgroundColor: "#151126",
    borderWidth: 1,
    borderColor: "#29213D",
    borderRadius: 20,
    padding: 22,
    marginBottom: 14,
  },

  symbol: {
    color: "#D4B866",
    fontSize: 21,
    marginBottom: 10,
  },

  cardTitle: {
    color: "#EFE8FA",
    fontSize: 19,
    fontWeight: "700",
  },

  cardDescription: {
    color: "#91879E",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },

  noticeCard: {
    backgroundColor: "#181329",
    borderWidth: 1,
    borderColor: "#3A2C62",
    borderRadius: 18,
    padding: 20,
    marginTop: 10,
  },

  noticeTitle: {
    color: "#D8C9F1",
    fontSize: 15,
    fontWeight: "700",
  },

  noticeText: {
    color: "#8E849D",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
  },
}); 