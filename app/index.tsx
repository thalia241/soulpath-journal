import { router } from "expo-router";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.symbolContainer}>
          <Text style={styles.moon}>☾</Text>
          <Text style={styles.star}>✦</Text>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>SoulPath Journal</Text>

          <Text style={styles.subtitle}>
            A private space for the journey within.
          </Text>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Reflect on your emotions, spiritual practices, dreams,
            synchronicities, and meaningful experiences in one peaceful place.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => router.push("/register")}
          >
            <Text style={styles.primaryButtonText}>Begin Your Journey</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.secondaryButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.privacyText}>
          Your reflections belong to you.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C0A18",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },

  symbolContainer: {
    width: 110,
    height: 110,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },

  moon: {
    fontSize: 82,
    color: "#D9C6FF",
    position: "absolute",
  },

  star: {
    fontSize: 22,
    color: "#E4C77D",
    position: "absolute",
    top: 7,
    right: 10,
  },

  titleSection: {
    alignItems: "center",
    marginBottom: 28,
  },

  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "#F6F0FF",
    textAlign: "center",
    letterSpacing: 0.5,
  },

  subtitle: {
    marginTop: 12,
    fontSize: 17,
    color: "#B9AED0",
    textAlign: "center",
    fontStyle: "italic",
  },

  descriptionContainer: {
    maxWidth: 420,
    marginBottom: 42,
  },

  description: {
    fontSize: 16,
    color: "#9D94B5",
    lineHeight: 25,
    textAlign: "center",
  },

  buttonContainer: {
    width: "100%",
    maxWidth: 420,
    gap: 14,
  },

  primaryButton: {
    backgroundColor: "#7357C7",
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: "#4D426C",
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
    backgroundColor: "#151126",
  },

  secondaryButtonText: {
    color: "#D9C6FF",
    fontSize: 17,
    fontWeight: "600",
  },

  privacyText: {
    marginTop: 30,
    color: "#716982",
    fontSize: 13,
  },
}); 