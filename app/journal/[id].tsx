import {
  router,
  useLocalSearchParams,
} from "expo-router";
import { useEffect, useState } from "react";
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
  deleteJournalEntry,
  getJournalEntry,
  JournalEntry,
} from "../../src/services/journalService";

export default function JournalEntryScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const [entry, setEntry] =
    useState<JournalEntry | null>(null);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    if (!id) {
      return;
    }

    async function loadEntry() {
      try {
        const data = await getJournalEntry(id);

        setEntry(data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load this entry."
        );
      } finally {
        setLoading(false);
      }
    }

    loadEntry();
  }, [id]);

  async function handleDelete() {
    if (!entry) {
      return;
    }

    try {
      await deleteJournalEntry(entry.id);

      router.replace("/journal");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete this entry."
      );
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color="#CDB9FF"
        />
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>
          {errorMessage || "Entry not found."}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>
            ‹ Journal
          </Text>
        </Pressable>

        <Text style={styles.date}>
          {entry.entry_date}
        </Text>

        <Text style={styles.title}>
          {entry.title}
        </Text>

        <View style={styles.metadata}>
          {entry.mood ? (
            <Text style={styles.chip}>
              {entry.mood}
            </Text>
          ) : null}

          {entry.energy_level ? (
            <Text style={styles.chip}>
              Energy {entry.energy_level}/5
            </Text>
          ) : null}
        </View>

        <Text style={styles.body}>
          {entry.content}
        </Text>

        {errorMessage ? (
          <Text style={styles.error}>
            {errorMessage}
          </Text>
        ) : null}

        <Pressable
          style={styles.editButton}
          onPress={() =>
            router.push({
              pathname: "/journal/edit/[id]",
              params: {
                id: entry.id,
              },
            })
          }
        >
          <Text style={styles.editText}>
            Edit Reflection
          </Text>
        </Pressable>

        <Pressable
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Text style={styles.deleteText}>
            Delete Reflection
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
    maxWidth: 700,
    alignSelf: "center",
    padding: 26,
  },

  backText: {
    color: "#B8A5DC",
    fontSize: 16,
    marginBottom: 30,
  },

  date: {
    color: "#84778E",
    fontSize: 13,
  },

  title: {
    color: "#F5EFFF",
    fontSize: 33,
    fontWeight: "700",
    marginTop: 8,
  },

  metadata: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },

  chip: {
    color: "#BDA9DF",
    backgroundColor: "#1E1831",
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 13,
  },

  body: {
    color: "#D4CCDF",
    fontSize: 17,
    lineHeight: 28,
    marginTop: 34,
  },

  editButton: {
    backgroundColor: "#7357C7",
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 42,
  },

  editText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  deleteButton: {
    alignItems: "center",
    paddingVertical: 15,
    marginTop: 10,
  },

  deleteText: {
    color: "#C27A91",
  },

  error: {
    color: "#F1A7B9",
    padding: 24,
  },
}); 