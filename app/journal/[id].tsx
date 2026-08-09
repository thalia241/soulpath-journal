import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";

import {
  useCallback,
  useState,
} from "react";

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

import {
  EntryPractice,
  getEntryPractices,
} from "../../src/services/practiceService";

export default function JournalEntryScreen() {
  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const [entry, setEntry] =
    useState<JournalEntry | null>(
      null
    );

  const [
    entryPractices,
    setEntryPracticesState,
  ] = useState<EntryPractice[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [deleting, setDeleting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const loadEntry =
    useCallback(async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const [
          journalData,
          practiceData,
        ] = await Promise.all([
          getJournalEntry(id),
          getEntryPractices(id),
        ]);

        setEntry(journalData);

        setEntryPracticesState(
          practiceData
        );
      } catch (error) {
        console.error(
          "Unable to load journal entry:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load this entry."
        );
      } finally {
        setLoading(false);
      }
    }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadEntry();
    }, [loadEntry])
  );

  async function handleDelete() {
    if (!entry || deleting) {
      return;
    }

    try {
      setDeleting(true);
      setErrorMessage("");

      await deleteJournalEntry(
        entry.id
      );

      router.replace("/journal");
    } catch (error) {
      console.error(
        "Unable to delete reflection:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete this reflection."
      );

      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView
        style={styles.loadingContainer}
      >
        <ActivityIndicator
          size="large"
          color="#CDB9FF"
        />

        <Text style={styles.loadingText}>
          Opening your reflection...
        </Text>
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView
        style={styles.loadingContainer}
      >
        <Text style={styles.error}>
          {errorMessage ||
            "Entry not found."}
        </Text>

        <Pressable
          onPress={() =>
            router.replace("/journal")
          }
        >
          <Text style={styles.backText}>
            Return to Journal
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
        >
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
              Energy{" "}
              {entry.energy_level}/5
            </Text>
          ) : null}
        </View>

        {entryPractices.length > 0 ? (
          <View
            style={
              styles.practiceSection
            }
          >
            <Text
              style={
                styles.practiceHeading
              }
            >
              PRACTICES
            </Text>

            <View
              style={
                styles.practiceList
              }
            >
              {entryPractices.map(
                (item) => (
                  <Text
                    key={item.id}
                    style={
                      styles.practiceChip
                    }
                  >
                    {item.practice?.name ??
                      "Practice"}
                  </Text>
                )
              )}
            </View>
          </View>
        ) : null}

        <View style={styles.divider} />

        <Text style={styles.body}>
          {entry.content}
        </Text>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.error}>
              {errorMessage}
            </Text>
          </View>
        ) : null}

        <Pressable
          style={styles.editButton}
          onPress={() =>
            router.push({
              pathname:
                "/journal/edit/[id]",
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
          style={[
            styles.deleteButton,
            deleting &&
              styles.disabledButton,
          ]}
          onPress={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator
              color="#C27A91"
            />
          ) : (
            <Text
              style={
                styles.deleteText
              }
            >
              Delete Reflection
            </Text>
          )}
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

  loadingContainer: {
    flex: 1,
    backgroundColor: "#0C0A18",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  loadingText: {
    color: "#8E859F",
    marginTop: 14,
  },

  content: {
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
    paddingHorizontal: 26,
    paddingTop: 26,
    paddingBottom: 60,
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
    flexWrap: "wrap",
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

  practiceSection: {
    marginTop: 24,
  },

  practiceHeading: {
    color: "#9587A8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginBottom: 10,
  },

  practiceList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  practiceChip: {
    color: "#CDB9ED",
    backgroundColor: "#211A35",
    borderWidth: 1,
    borderColor: "#352A50",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },

  divider: {
    height: 1,
    backgroundColor: "#29213D",
    marginTop: 30,
  },

  body: {
    color: "#D4CCDF",
    fontSize: 17,
    lineHeight: 28,
    marginTop: 30,
  },

  errorBox: {
    backgroundColor: "#2A151E",
    borderWidth: 1,
    borderColor: "#683248",
    borderRadius: 12,
    padding: 12,
    marginTop: 24,
  },

  error: {
    color: "#F1A7B9",
    textAlign: "center",
    lineHeight: 20,
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
    fontSize: 16,
  },

  deleteButton: {
    alignItems: "center",
    paddingVertical: 15,
    marginTop: 10,
  },

  deleteText: {
    color: "#C27A91",
    fontWeight: "600",
  },

  disabledButton: {
    opacity: 0.6,
  },
}); 