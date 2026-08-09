import { router } from "expo-router";

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "../../src/context/AuthContext";
import { supabase } from "../../src/lib/supabase";

export default function SettingsScreen() {
  const { session } = useAuth();

  const displayName =
    session?.user.user_metadata?.display_name ||
    "Traveler";

  const email =
    session?.user.email || "";

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
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>
          YOUR SPACE
        </Text>

        <Text style={styles.title}>
          Settings
        </Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              ☾
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.name}>
              {displayName}
            </Text>

            <Text style={styles.email}>
              {email}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Account
        </Text>

        <View style={styles.settingsGroup}>
          <SettingsRow
            title="Profile"
            subtitle="Name and account information"
            onPress={() =>
              router.push("/settings/profile")
            }
          />

          <View style={styles.divider} />

          <SettingsRow
            title="Privacy & Security"
            subtitle="Password, sessions, and privacy"
            onPress={() =>
              router.push("/settings/privacy")
            }
          />
        </View>

        <Text style={styles.sectionTitle}>
          Your data
        </Text>

        <View style={styles.settingsGroup}>
          <SettingsRow
            title="Data & Export"
            subtitle="PDF, text, JSON, and data management"
            onPress={() =>
              router.push("/settings/data")
            }
          />
        </View>

        <Text style={styles.sectionTitle}>
          SoulPath
        </Text>

        <View style={styles.settingsGroup}>
          <SettingsRow
            title="About SoulPath"
            subtitle="Purpose, privacy, and app information"
            onPress={() =>
              router.push("/settings/about")
            }
          />
        </View>

        <View style={styles.privacyCard}>
          <Text style={styles.privacySymbol}>
            ✦
          </Text>

          <View style={styles.privacyContent}>
            <Text style={styles.privacyTitle}>
              Your inner world stays yours
            </Text>

            <Text style={styles.privacyText}>
              SoulPath is designed around private,
              account-specific reflection data and
              user-controlled exports.
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.signOutButton}
          onPress={handleLogout}
        >
          <Text style={styles.signOutText}>
            Sign Out
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsRow({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingsRow,
        pressed && styles.rowPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle}>
          {title}
        </Text>

        <Text style={styles.rowSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Text style={styles.chevron}>
        ›
      </Text>
    </Pressable>
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
    marginBottom: 26,
  },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#151126",
    borderWidth: 1,
    borderColor: "#29213D",
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#211A35",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#D9C6FF",
    fontSize: 27,
  },

  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },

  name: {
    color: "#EEE7F8",
    fontSize: 18,
    fontWeight: "700",
  },

  email: {
    color: "#847B91",
    fontSize: 13,
    marginTop: 4,
  },

  sectionTitle: {
    color: "#DCD2EA",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },

  settingsGroup: {
    backgroundColor: "#151126",
    borderWidth: 1,
    borderColor: "#29213D",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 28,
  },

  settingsRow: {
    minHeight: 78,
    paddingHorizontal: 18,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  rowPressed: {
    opacity: 0.7,
  },

  rowContent: {
    flex: 1,
    paddingRight: 14,
  },

  rowTitle: {
    color: "#EAE2F5",
    fontSize: 15,
    fontWeight: "600",
  },

  rowSubtitle: {
    color: "#81788E",
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },

  chevron: {
    color: "#81719B",
    fontSize: 26,
  },

  divider: {
    height: 1,
    backgroundColor: "#29213D",
    marginLeft: 18,
  },

  privacyCard: {
    flexDirection: "row",
    backgroundColor: "#181329",
    borderWidth: 1,
    borderColor: "#34294D",
    borderRadius: 17,
    padding: 18,
  },

  privacySymbol: {
    color: "#D4B866",
    fontSize: 19,
    marginRight: 12,
  },

  privacyContent: {
    flex: 1,
  },

  privacyTitle: {
    color: "#CFC1DF",
    fontSize: 14,
    fontWeight: "700",
  },

  privacyText: {
    color: "#81778D",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 5,
  },

  signOutButton: {
    borderWidth: 1,
    borderColor: "#553041",
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 28,
  },

  signOutText: {
    color: "#D68DA3",
    fontSize: 15,
    fontWeight: "700",
  },
}); 