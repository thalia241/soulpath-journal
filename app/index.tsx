import { router } from "expo-router";

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import SoulButton from "../src/components/SoulButton";

import {
  colors,
  fonts,
  radius,
} from "../src/theme";

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stars}>
          <Text style={styles.star}>✦</Text>
          <Text style={styles.moon}>☾</Text>
          <Text style={styles.smallStar}>·</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.name}>
            SoulPath
          </Text>

          <Text style={styles.tagline}>
            A private space for the journey within.
          </Text>

          <Text style={styles.description}>
            Keep the thoughts, dreams, rituals, questions,
            and quiet moments that help you understand
            your own inner landscape.
          </Text>
        </View>

        <View style={styles.quoteArea}>
          <Text style={styles.quoteSymbol}>
            ✦
          </Text>

          <Text style={styles.quote}>
            You don't need to know where the path leads
            before you begin paying attention.
          </Text>
        </View>

        <View style={styles.actions}>
          <SoulButton
            title="Begin your journal"
            onPress={() =>
              router.push("/register")
            }
          />

          <SoulButton
            title="I already have a SoulPath"
            variant="secondary"
            onPress={() =>
              router.push("/login")
            }
          />
        </View>

        <Pressable
          style={styles.privacy}
        >
          <Text style={styles.privacyText}>
            Private reflection • Your data belongs to you
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 620,
    alignSelf: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 50,
  },

  stars: {
    alignItems: "center",
    marginBottom: 26,
  },

  star: {
    position: "absolute",
    left: "31%",
    top: 2,
    color: colors.gold,
    fontSize: 15,
  },

  smallStar: {
    position: "absolute",
    right: "33%",
    bottom: 6,
    color: colors.lavender,
    fontSize: 24,
  },

  moon: {
    color: colors.gold,
    fontSize: 54,
  },

  hero: {
    alignItems: "center",
  },

  name: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 55,
    lineHeight: 59,
  },

  tagline: {
    color: colors.lavender,
    fontFamily: fonts.displayItalic,
    fontSize: 21,
    textAlign: "center",
    marginTop: 5,
  },

  description: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 18,
    maxWidth: 440,
  },

  quoteArea: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: 22,
    marginTop: 34,
  },

  quoteSymbol: {
    color: colors.gold,
    fontSize: 15,
  },

  quote: {
    color: colors.textSoft,
    fontFamily: fonts.displayItalic,
    fontSize: 20,
    lineHeight: 27,
    marginTop: 8,
  },

  actions: {
    gap: 11,
    marginTop: 28,
  },

  privacy: {
    padding: 18,
    alignItems: "center",
  },

  privacyText: {
    color: colors.textDim,
    fontFamily: fonts.body,
    fontSize: 9,
    textAlign: "center",
  },
}); 