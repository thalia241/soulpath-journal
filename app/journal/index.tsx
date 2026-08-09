import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  getJournalEntries,
  JournalEntry,
} from "../../src/services/journalService";

export default function JournalScreen() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadEntries = useCallback(async () => {
    try {
      setErrorMessage("");

      const data = await getJournalEntries();

      setEntries(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load your journal."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadEntries();
    }, [loadEntries])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>
              YOUR REFLECTIONS
            </Text>

            <Text style={styles.title}>
              Journal
            </Text>
          </View>

          <Pressable
            style={styles.newButton}
            onPress={() => router.push("/journal/new")}
          >
            <Text style={styles.newButtonText}>＋</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#CDB9FF"
          />
        ) : null}

        {errorMessage ? (
          <Text style={styles.error}>
            {errorMessage}
          </Text>
        ) : null}

        {!loading && entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyMoon}>☾</Text>

            <Text style={styles.emptyTitle}>
              Your journal is waiting
            </Text>

            <Text style={styles.emptyText}>
              Write your first reflection whenever
              something feels worth remembering.
            </Text>

            <Pressable
              style={styles.createButton}
              onPress={() => router.push("/journal/new")}
            >
              <Text style={styles.createButtonText}>
                Write First Entry
              </Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.entries}>
          {entries.map((entry) => (
            <Pressable
              key={entry.id}
              style={styles.entryCard}
              onPress={() =>
                router.push({
                  pathname: "/journal/[id]",
                  params: {
                    id: entry.id,
                  },
                })
              }
            >
              <Text style={styles.entryDate}>
                {entry.entry_date}
              </Text>

              <Text style={styles.entryTitle}>
                {entry.title}
              </Text>

              <Text
                style={styles.preview}
                numberOfLines={3}
              >
                {entry.content}
              </Text>

              <View style={styles.metadata}>
                {entry.mood ? (
                  <Text style={styles.metadataText}>
                    {entry.mood}
                  </Text>
                ) : null}

                {entry.energy_level ? (
                  <Text style={styles.metadataText}>
                    Energy {entry.energy_level}/5
                  </Text>
                ) : null}
              </View>
            </Pressable>
          ))}
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
    paddingTop: 30,
    paddingBottom: 60,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
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
    marginTop: 4,
  },

  newButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#7357C7",
    justifyContent: "center",
    alignItems: "center",
  },

  newButtonText: {
    color: "#FFFFFF",
    fontSize: 26,
  },

  entries: {
    gap: 14,
  },

  entryCard: {
    backgroundColor: "#151126",
    padding: 20,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#29213D",
  },

  entryDate: {
    color: "#81758F",
    fontSize: 12,
  },

  entryTitle: {
    color: "#EFE8FA",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 6,
  },

  preview: {
    color: "#948A9F",
    lineHeight: 21,
    marginTop: 8,
  },

  metadata: {
    flexDirection: "row",
    gap: 9,
    marginTop: 15,
  },

  metadataText: {
    color: "#B5A4D3",
    backgroundColor: "#211A35",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
  },

  emptyState: {
    alignItems: "center",
    backgroundColor: "#151126",
    borderRadius: 20,
    padding: 34,
  },

  emptyMoon: {
    color: "#8B74B3",
    fontSize: 42,
  },

  emptyTitle: {
    color: "#E2DAEE",
    fontSize: 19,
    fontWeight: "700",
    marginTop: 12,
  },

  emptyText: {
    color: "#83798D",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 8,
  },

  createButton: {
    backgroundColor: "#7357C7",
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 20,
    marginTop: 20,
  },

  createButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  error: {
    color: "#F1A7B9",
    marginBottom: 18,
  },
}); 