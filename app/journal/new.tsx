import { router } from "expo-router";
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
  createJournalEntry,
} from "../../src/services/journalService";

import {
  getPractices,
  Practice,
  setEntryPractices,
} from "../../src/services/practiceService";

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

export default function NewJournalEntryScreen() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [mood, setMood] =
    useState<string | null>(null);

  const [energy, setEnergy] =
    useState<number | null>(null);

  const [practices, setPractices] =
    useState<Practice[]>([]);

  const [
    selectedPracticeIds,
    setSelectedPracticeIds,
  ] = useState<string[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [practicesLoading, setPracticesLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadPractices() {
      try {
        const data = await getPractices();

        setPractices(data);
      } catch (error) {
        console.error(
          "Unable to load practices:",
          error
        );

        setErrorMessage(
          "Unable to load spiritual practices."
        );
      } finally {
        setPracticesLoading(false);
      }
    }

    loadPractices();
  }, []);

  function togglePractice(id: string) {
    setSelectedPracticeIds((current) => {
      if (current.includes(id)) {
        return current.filter(
          (practiceId) =>
            practiceId !== id
        );
      }

      return [...current, id];
    });
  }

  async function handleSave() {
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage(
        "Give your reflection a title."
      );
      return;
    }

    if (!content.trim()) {
      setErrorMessage(
        "Write something before saving your reflection."
      );
      return;
    }

    try {
      setLoading(true);

      const entry =
        await createJournalEntry({
          title: title.trim(),
          content: content.trim(),
          mood,
          energy_level: energy,
        });

      await setEntryPractices(
        entry.id,
        selectedPracticeIds
      );

      router.replace({
        pathname: "/journal/[id]",
        params: {
          id: entry.id,
        },
      });
    } catch (error) {
      console.error(
        "Unable to save reflection:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save your reflection."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.content
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>
              ‹ Back
            </Text>
          </Pressable>

          <Text style={styles.eyebrow}>
            DAILY REFLECTION
          </Text>

          <Text style={styles.heading}>
            What's moving through you?
          </Text>

          <Text style={styles.subheading}>
            There is no right way to write
            here.
          </Text>

          <Text style={styles.label}>
            Title
          </Text>

          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Give this reflection a name"
            placeholderTextColor="#70677F"
          />

          <Text style={styles.label}>
            Your reflection
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.journalInput,
            ]}
            value={content}
            onChangeText={setContent}
            placeholder="Write freely..."
            placeholderTextColor="#70677F"
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.sectionTitle}>
            How are you feeling?
          </Text>

          <View style={styles.wrapRow}>
            {moods.map((item) => {
              const selected =
                mood === item;

              return (
                <Pressable
                  key={item}
                  style={[
                    styles.choice,
                    selected &&
                      styles.choiceSelected,
                  ]}
                  onPress={() =>
                    setMood(
                      selected
                        ? null
                        : item
                    )
                  }
                >
                  <Text
                    style={[
                      styles.choiceText,
                      selected &&
                        styles.choiceTextSelected,
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
              const selected =
                energy === level;

              return (
                <Pressable
                  key={level}
                  style={[
                    styles.energyButton,
                    selected &&
                      styles.energySelected,
                  ]}
                  onPress={() =>
                    setEnergy(
                      selected
                        ? null
                        : level
                    )
                  }
                >
                  <Text
                    style={[
                      styles.energyText,
                      selected &&
                        styles.energyTextSelected,
                    ]}
                  >
                    {level}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>
            Spiritual practices
          </Text>

          <Text style={styles.practiceHint}>
            Select anything that was part
            of today's spiritual practice.
          </Text>

          {practicesLoading ? (
            <ActivityIndicator
              color="#CDB9FF"
              style={
                styles.practiceLoader
              }
            />
          ) : (
            <View style={styles.wrapRow}>
              {practices.map(
                (practice) => {
                  const selected =
                    selectedPracticeIds.includes(
                      practice.id
                    );

                  return (
                    <Pressable
                      key={practice.id}
                      style={[
                        styles.choice,
                        selected &&
                          styles.choiceSelected,
                      ]}
                      onPress={() =>
                        togglePractice(
                          practice.id
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.choiceText,
                          selected &&
                            styles.choiceTextSelected,
                        ]}
                      >
                        {practice.name}
                      </Text>
                    </Pressable>
                  );
                }
              )}
            </View>
          )}

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                {errorMessage}
              </Text>
            </View>
          ) : null}

          <Pressable
            style={[
              styles.saveButton,
              loading &&
                styles.disabledButton,
            ]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text
                style={
                  styles.saveButtonText
                }
              >
                Save Reflection
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
  },

  subheading: {
    color: "#8D859A",
    fontSize: 15,
    marginTop: 8,
    marginBottom: 30,
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

  practiceHint: {
    color: "#847B95",
    fontSize: 13,
    marginTop: -5,
    marginBottom: 13,
  },

  practiceLoader: {
    marginTop: 8,
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
    borderColor: "#8F74D2",
  },

  energyText: {
    color: "#A89DBB",
    fontWeight: "600",
  },

  energyTextSelected: {
    color: "#FFFFFF",
  },

  errorBox: {
    backgroundColor: "#2A151E",
    borderWidth: 1,
    borderColor: "#683248",
    borderRadius: 12,
    padding: 12,
    marginTop: 24,
  },

  errorText: {
    color: "#F1A7B9",
    lineHeight: 20,
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