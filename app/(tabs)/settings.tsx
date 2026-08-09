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

export default function SettingsScreen() {
  const { session } = useAuth();

  const displayName =
    session?.user.user_metadata?.display_name ||
    "Traveler";

  const email =
    session?.user.email || "";

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
          <View style={styles.settingsRow}>
            <View>
              <Text style={styles.rowTitle}>
                Profile
              </Text>

              <Text style={styles.rowSubtitle}>
                Name and account information
              </Text>
            </View>

            <Text style={styles.chevron}>
              ›
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.settingsRow}>
            <View>
              <Text style={styles.rowTitle}>
                Privacy
              </Text>

              <Text style={styles.rowSubtitle}>
                Manage your private SoulPath data
              </Text>
            </View>

            <Text style={styles.chevron}>
              ›
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          SoulPath
        </Text>

        <View style={styles.settingsGroup}>
          <View style={styles.settingsRow}>
            <View>
              <Text style={styles.rowTitle}>
                Export your data
              </Text>

              <Text style={styles.rowSubtitle}>
                Journal and experience exports
              </Text>
            </View>

            <Text style={styles.chevron}>
              ›
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.settingsRow}>
            <View>
              <Text style={styles.rowTitle}>
                About SoulPath
              </Text>

              <Text style={styles.rowSubtitle}>
                App information and disclaimer
              </Text>
            </View>

            <Text style={styles.chevron}>
              ›
            </Text>
          </View>
        </View>

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>
            Personal reflection
          </Text>

          <Text style={styles.disclaimerText}>
            SoulPath is designed for private personal
            reflection and wellness tracking. It does
            not provide medical, psychological,
            divinatory, or other professional advice.
          </Text>
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
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#211A35",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#D9C6FF",
    fontSize: 26,
  },

  profileInfo: {
    marginLeft: 15,
    flex: 1,
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
    minHeight: 74,
    paddingHorizontal: 18,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  },

  chevron: {
    color: "#81719B",
    fontSize: 24,
  },

  divider: {
    height: 1,
    backgroundColor: "#29213D",
    marginLeft: 18,
  },

  disclaimerCard: {
    backgroundColor: "#181329",
    borderWidth: 1,
    borderColor: "#34294D",
    borderRadius: 17,
    padding: 18,
  },

  disclaimerTitle: {
    color: "#CABAE1",
    fontSize: 14,
    fontWeight: "700",
  },

  disclaimerText: {
    color: "#81788E",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
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