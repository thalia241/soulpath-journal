import {
  router,
  useLocalSearchParams,
} from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  getJournalEntry,
  JournalEntry,
  updateJournalEntry,
} from "../../../src/services/journalService";

const moods = [
  "Peaceful",
  "Happy",
  "Reflective",
  "Neutral",
  "Anxious",
  "Sad",
  "Overwhelmed",
];

const energyLevels = [1, 2, 3, 4, 5];

export default function EditJournalEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!id) {
      return;
    }

    async function loadEntry() {
      try {
        const data = await getJournalEntry(id);

        setEntry(data);
        setTitle(data.title);
        setContent(data.content);
        setMood(data.mood);
        setEnergy(data.energy_level);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load this reflection."
        );
      } finally {
        setLoading(false);
      }
    }

    loadEntry();
  }, [id]);

  async function handleSave() {
    if (!entry) {
      return;
    }

    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("Your reflection needs a title.");
      return;
    }

    if (!content.trim()) {
      setErrorMessage("Your reflection cannot be empty.");
      return;
    }

    try {
      setSaving(true);

      await updateJournalEntry(entry.id, {
        title: title.trim(),
        content: content.trim(),
        mood,
        energy_level: energy,
      });

      router.replace({
        pathname: "/journal/[id]",
        params: {
          id: entry.id,
        },
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update this reflection."
      );
    } finally {
      setSaving(false);
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backText}>‹ Back</Text>
          </Pressable>

          <Text style={styles.eyebrow}>EDIT REFLECTION</Text>

          <Text style={styles.heading}>
            Refine what you captured
          </Text>

          <Text style={styles.label}>Title</Text>

          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Reflection title"
            placeholderTextColor="#70677F"
          />

          <Text style={styles.label}>Your reflection</Text>

          <TextInput
            style={[styles.input, styles.journalInput]}
            value={content}
            onChangeText={setContent}
            placeholder="Write freely..."
            placeholderTextColor="#70677F"
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.sectionTitle}>
            Mood
          </Text>

          <View style={styles.wrapRow}>
            {moods.map((item) => {
              const selected = mood === item;

              return (
                <Pressable
                  key={item}
                  style={[
                    styles.choice,
                    selected && styles.choiceSelected,
                  ]}
                  onPress={() =>
                    setMood(selected ? null : item)
                  }
                >
                  <Text
                    style={[
                      styles.choiceText,
                      selected && styles.choiceTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>
            Energy level
          </Text>

          <View style={styles.energyRow}>
            {energyLevels.map((level) => {
              const selected = energy === level;

              return (
                <Pressable
                  key={level}
                  style={[
                    styles.energyButton,
                    selected && styles.energySelected,
                  ]}
                  onPress={() =>
                    setEnergy(selected ? null : level)
                  }
                >
                  <Text
                    style={[
                      styles.energyText,
                      selected && styles.energyTextSelected,
                    ]}
                  >
                    {level}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {errorMessage ? (
            <Text style={styles.errorText}>
              {errorMessage}
            </Text>
          ) : null}

          <Pressable
            style={[
              styles.saveButton,
              saving && styles.disabledButton,
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>
                Save Changes
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 60,
  },

  backText: {
    color: "#B9AED0",
    fontSize: 16,
    marginBottom: 28,
  },

  eyebrow: {
    color: "#8F77BF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
  },

  heading: {
    color: "#F5F0FF",
    fontSize: 31,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 24,
  },

  label: {
    color: "#D8C9F1",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 9,
    marginTop: 16,
  },

  input: {
    backgroundColor: "#171329",
    color: "#F2EDFA",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#332A49",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },

  journalInput: {
    minHeight: 220,
    lineHeight: 24,
  },

  sectionTitle: {
    color: "#E5DCF4",
    fontSize: 17,
    fontWeight: "600",
    marginTop: 28,
    marginBottom: 12,
  },

  wrapRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  choice: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#151126",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#312847",
  },

  choiceSelected: {
    backgroundColor: "#5E489D",
    borderColor: "#8F74D2",
  },

  choiceText: {
    color: "#A89DBB",
  },

  choiceTextSelected: {
    color: "#FFFFFF",
  },

  energyRow: {
    flexDirection: "row",
    gap: 10,
  },

  energyButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#151126",
    borderWidth: 1,
    borderColor: "#312847",
    justifyContent: "center",
    alignItems: "center",
  },

  energySelected: {
    backgroundColor: "#7357C7",
  },

  energyText: {
    color: "#A89DBB",
    fontWeight: "600",
  },

  energyTextSelected: {
    color: "#FFFFFF",
  },

  errorText: {
    color: "#F1A7B9",
    marginTop: 20,
  },

  saveButton: {
    backgroundColor: "#7357C7",
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
    marginTop: 34,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
}); 