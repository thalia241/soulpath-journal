import { router } from "expo-router";

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function AboutSettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>
            ‹ Settings
          </Text>
        </Pressable>

        <View style={styles.hero}>
          <Text style={styles.symbol}>
            ☾ ✦
          </Text>

          <Text style={styles.title}>
            SoulPath Journal
          </Text>

          <Text style={styles.tagline}>
            A private space for the journey within.
          </Text>

          <Text style={styles.version}>
            Version 1.0.0
          </Text>
        </View>

        <InfoSection
          eyebrow="PURPOSE"
          title="A space for reflection"
        >
          SoulPath is designed to help you record
          personal reflections, moods, energy,
          spiritual practices, dreams, synchronicities,
          and the patterns you notice over time.
        </InfoSection>

        <InfoSection
          eyebrow="PRIVACY"
          title="Designed around private records"
        >
          Your SoulPath content is associated with
          your authenticated account. Database access
          is controlled using Supabase authentication
          and Row Level Security policies.
        </InfoSection>

        <InfoSection
          eyebrow="INSIGHTS"
          title="Patterns, not predictions"
        >
          SoulPath Insights summarizes patterns in the
          information you choose to record. These
          observations do not establish cause and
          effect and are not predictions.
        </InfoSection>

        <InfoSection
          eyebrow="WELLNESS"
          title="Personal reflection only"
        >
          SoulPath is not a medical, psychological,
          diagnostic, therapeutic, divinatory, or
          other professional service. Information
          shown in the app is intended for personal
          reflection.
        </InfoSection>

        <View style={styles.footerCard}>
          <Text style={styles.footerSymbol}>
            ✦
          </Text>

          <Text style={styles.footerText}>
            Built with React Native, Expo, TypeScript,
            Expo Router, Supabase Auth, and PostgreSQL.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: string;
}) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionEyebrow}>
        {eyebrow}
      </Text>

      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      <Text style={styles.sectionText}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C0A18",
  },

  content: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 60,
  },

  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    marginBottom: 20,
  },

  backText: {
    color: "#A78DE3",
    fontSize: 15,
    fontWeight: "600",
  },

  hero: {
    alignItems: "center",
    paddingVertical: 30,
    marginBottom: 10,
  },

  symbol: {
    color: "#D4B866",
    fontSize: 37,
  },

  title: {
    color: "#F5F0FF",
    fontSize: 30,
    fontWeight: "700",
    marginTop: 13,
  },

  tagline: {
    color: "#9387A0",
    fontSize: 14,
    marginTop: 7,
    textAlign: "center",
  },

  version: {
    color: "#655D70",
    fontSize: 11,
    marginTop: 13,
  },

  sectionCard: {
    backgroundColor: "#151126",
    borderWidth: 1,
    borderColor: "#29213D",
    borderRadius: 19,
    padding: 20,
    marginBottom: 14,
  },

  sectionEyebrow: {
    color: "#8873B8",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  sectionTitle: {
    color: "#EDE4F7",
    fontSize: 17,
    fontWeight: "700",
    marginTop: 5,
  },

  sectionText: {
    color: "#8D8398",
    fontSize: 13,
    lineHeight: 21,
    marginTop: 8,
  },

  footerCard: {
    backgroundColor: "#181329",
    borderWidth: 1,
    borderColor: "#34294D",
    borderRadius: 17,
    padding: 18,
    alignItems: "center",
    marginTop: 8,
  },

  footerSymbol: {
    color: "#D4B866",
    fontSize: 19,
  },

  footerText: {
    color: "#81778D",
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 8,
  },
}); 