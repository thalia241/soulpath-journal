import { router } from "expo-router";

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import SoulCard from "../../src/components/SoulCard";

import {
  colors,
  fonts,
} from "../../src/theme";

export default function AboutSettingsScreen() {
  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        <Pressable
          style={styles.back}
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={styles.backText}
          >
            ‹ Settings
          </Text>
        </Pressable>

        <View
          style={styles.hero}
        >
          <Text
            style={
              styles.heroSymbol
            }
          >
            ☾ ✦
          </Text>

          <Text
            style={styles.title}
          >
            SoulPath
          </Text>

          <Text
            style={
              styles.tagline
            }
          >
            A private space for the
            journey within.
          </Text>

          <Text
            style={
              styles.version
            }
          >
            Version 1.0.0
          </Text>
        </View>

        <InfoCard
          symbol="☾"
          title="A place to remember yourself"
        >
          SoulPath gives your
          reflections, moods, energy,
          practices, dreams,
          synchronicities, and personal
          observations somewhere quiet
          to gather.
        </InfoCard>

        <InfoCard
          symbol="◌"
          title="Private by design"
        >
          Your records are associated
          with your authenticated
          account, with database access
          controlled through
          authentication and Row Level
          Security.
        </InfoCard>

        <InfoCard
          symbol="✦"
          title="Patterns, not prophecy"
        >
          Insights are drawn from the
          information you choose to
          record. They are observations
          of your own data, not
          predictions and not claims of
          cause and effect.
        </InfoCard>

        <InfoCard
          symbol="♡"
          title="Reflection, not treatment"
        >
          SoulPath is intended for
          personal reflection. It is not
          a medical, psychological,
          diagnostic, therapeutic,
          divinatory, or other
          professional service.
        </InfoCard>

        <View
          style={styles.madeWith}
        >
          <Text
            style={
              styles.madeSymbol
            }
          >
            ✦
          </Text>

          <Text
            style={
              styles.madeText
            }
          >
            Built with React Native,
            Expo, TypeScript, Expo
            Router, Supabase, and
            PostgreSQL.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoCard({
  symbol,
  title,
  children,
}: {
  symbol: string;
  title: string;
  children: string;
}) {
  return (
    <SoulCard
      style={styles.infoCard}
    >
      <Text
        style={styles.infoSymbol}
      >
        {symbol}
      </Text>

      <Text
        style={styles.infoTitle}
      >
        {title}
      </Text>

      <Text
        style={styles.infoText}
      >
        {children}
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

    content: {
      width: "100%",
      maxWidth: 650,
      alignSelf: "center",
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 60,
    },

    back: {
      alignSelf: "flex-start",
      paddingVertical: 8,
    },

    backText: {
      color: colors.lavender,
      fontFamily:
        fonts.bodySemiBold,
      fontSize: 12,
    },

    hero: {
      alignItems: "center",
      paddingVertical: 39,
    },

    heroSymbol: {
      color: colors.gold,
      fontSize: 32,
    },

    title: {
      color: colors.text,
      fontFamily: fonts.display,
      fontSize: 43,
      marginTop: 9,
    },

    tagline: {
      color:
        colors.textMuted,
      fontFamily:
        fonts.displayItalic,
      fontSize: 18,
      textAlign: "center",
      marginTop: 3,
    },

    version: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 9,
      marginTop: 13,
    },

    infoCard: {
      marginBottom: 12,
    },

    infoSymbol: {
      color: colors.gold,
      fontSize: 17,
    },

    infoTitle: {
      color: colors.text,
      fontFamily: fonts.display,
      fontSize: 23,
      marginTop: 7,
    },

    infoText: {
      color:
        colors.textMuted,
      fontFamily: fonts.body,
      fontSize: 11,
      lineHeight: 18,
      marginTop: 7,
    },

    madeWith: {
      alignItems: "center",
      paddingVertical: 28,
      paddingHorizontal: 25,
    },

    madeSymbol: {
      color: colors.gold,
      fontSize: 15,
    },

    madeText: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 9,
      lineHeight: 15,
      textAlign: "center",
      marginTop: 7,
      maxWidth: 380,
    },
  }); 