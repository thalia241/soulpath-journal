import { router } from "expo-router";

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
} from "../../src/context/AuthContext";

import {
  supabase,
} from "../../src/lib/supabase";

import {
  colors,
  fonts,
  radius,
} from "../../src/theme";

export default function SettingsScreen() {
  const { session } =
    useAuth();

  const displayName =
    session?.user.user_metadata
      ?.display_name ||
    "Traveler";

  const email =
    session?.user.email ||
    "";

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
        <Text
          style={styles.title}
        >
          Settings
        </Text>

        <Text
          style={styles.subtitle}
        >
          Tend to the quieter,
          practical parts of your
          SoulPath.
        </Text>

        <View
          style={styles.profileCard}
        >
          <View
            style={styles.avatar}
          >
            <Text
              style={
                styles.avatarText
              }
            >
              ☾
            </Text>
          </View>

          <View
            style={
              styles.profileInfo
            }
          >
            <Text
              style={styles.name}
            >
              {displayName}
            </Text>

            <Text
              style={styles.email}
            >
              {email}
            </Text>
          </View>
        </View>

        <Text
          style={
            styles.groupTitle
          }
        >
          Your account
        </Text>

        <View
          style={
            styles.settingsGroup
          }
        >
          <SettingsRow
            symbol="✦"
            title="Profile"
            subtitle="How your name appears in SoulPath"
            onPress={() =>
              router.push(
                "/settings/profile"
              )
            }
          />

          <View
            style={styles.divider}
          />

          <SettingsRow
            symbol="◌"
            title="Privacy & Security"
            subtitle="Password and session controls"
            onPress={() =>
              router.push(
                "/settings/privacy"
              )
            }
          />
        </View>

        <Text
          style={
            styles.groupTitle
          }
        >
          What belongs to you
        </Text>

        <View
          style={
            styles.settingsGroup
          }
        >
          <SettingsRow
            symbol="⇩"
            title="Data & Export"
            subtitle="Keep a copy or clear your records"
            onPress={() =>
              router.push(
                "/settings/data"
              )
            }
          />
        </View>

        <Text
          style={
            styles.groupTitle
          }
        >
          About this space
        </Text>

        <View
          style={
            styles.settingsGroup
          }
        >
          <SettingsRow
            symbol="☾"
            title="About SoulPath"
            subtitle="Purpose, privacy, and philosophy"
            onPress={() =>
              router.push(
                "/settings/about"
              )
            }
          />
        </View>

        <View
          style={
            styles.quietCard
          }
        >
          <Text
            style={
              styles.quietSymbol
            }
          >
            ✦
          </Text>

          <Text
            style={
              styles.quietTitle
            }
          >
            Your inner world stays yours.
          </Text>

          <Text
            style={
              styles.quietText
            }
          >
            SoulPath is built around
            private, account-specific
            reflection and user-controlled
            data exports.
          </Text>
        </View>

        <Pressable
          style={
            styles.signOutButton
          }
          onPress={
            handleLogout
          }
        >
          <Text
            style={
              styles.signOutText
            }
          >
            Sign out
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsRow({
  symbol,
  title,
  subtitle,
  onPress,
}: {
  symbol: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        pressed &&
          styles.pressed,
      ]}
      onPress={onPress}
    >
      <Text
        style={styles.rowSymbol}
      >
        {symbol}
      </Text>

      <View
        style={styles.rowContent}
      >
        <Text
          style={styles.rowTitle}
        >
          {title}
        </Text>

        <Text
          style={
            styles.rowSubtitle
          }
        >
          {subtitle}
        </Text>
      </View>

      <Text
        style={styles.chevron}
      >
        ›
      </Text>
    </Pressable>
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
      maxWidth: 700,
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
      marginTop: 2,
      marginBottom: 29,
    },

    profileCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        colors.surface,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.xl,
      padding: 19,
      marginBottom: 31,
    },

    avatar: {
      width: 57,
      height: 57,
      borderRadius: 29,
      backgroundColor:
        colors.surfaceRaised,
      justifyContent:
        "center",
      alignItems: "center",
    },

    avatarText: {
      color: colors.gold,
      fontSize: 27,
    },

    profileInfo: {
      flex: 1,
      marginLeft: 14,
    },

    name: {
      color: colors.text,
      fontFamily: fonts.display,
      fontSize: 22,
    },

    email: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 11,
      marginTop: 2,
    },

    groupTitle: {
      color: colors.textSoft,
      fontFamily: fonts.display,
      fontSize: 20,
      marginBottom: 9,
    },

    settingsGroup: {
      backgroundColor:
        colors.surface,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.lg,
      overflow: "hidden",
      marginBottom: 28,
    },

    row: {
      minHeight: 76,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 17,
      paddingVertical: 14,
    },

    pressed: {
      opacity: 0.72,
    },

    rowSymbol: {
      color: colors.gold,
      width: 29,
      fontSize: 16,
    },

    rowContent: {
      flex: 1,
    },

    rowTitle: {
      color: colors.textSoft,
      fontFamily:
        fonts.bodySemiBold,
      fontSize: 14,
    },

    rowSubtitle: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 10,
      marginTop: 3,
    },

    chevron: {
      color: colors.lavender,
      fontSize: 23,
    },

    divider: {
      height: 1,
      backgroundColor:
        colors.border,
      marginLeft: 46,
    },

    quietCard: {
      paddingHorizontal: 14,
      paddingVertical: 21,
      alignItems: "center",
    },

    quietSymbol: {
      color: colors.gold,
      fontSize: 16,
    },

    quietTitle: {
      color: colors.textSoft,
      fontFamily:
        fonts.displayItalic,
      fontSize: 20,
      marginTop: 8,
      textAlign: "center",
    },

    quietText: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 10,
      lineHeight: 17,
      textAlign: "center",
      maxWidth: 400,
      marginTop: 6,
    },

    signOutButton: {
      alignSelf: "center",
      padding: 17,
      marginTop: 8,
    },

    signOutText: {
      color: colors.danger,
      fontFamily:
        fonts.bodySemiBold,
      fontSize: 12,
    },
  }); 