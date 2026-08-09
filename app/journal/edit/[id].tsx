import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  useEffect,
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

import SoulButton from "../../../src/components/SoulButton";
import SoulInput from "../../../src/components/SoulInput";
import FeedbackMessage from "../../../src/components/FeedbackMessage";
import SectionHeading from "../../../src/components/SectionHeading";

import {
  colors,
  fonts,
  radius,
} from "../../../src/theme";

import {
  getJournalEntry,
  updateJournalEntry,
} from "../../../src/services/journalService";

import {
  getEntryPractices,
  getPractices,
  Practice,
  setEntryPractices,
} from "../../../src/services/practiceService";

const moods = [
  "Peaceful",
  "Happy",
  "Reflective",
  "Neutral",
  "Anxious",
  "Sad",
  "Overwhelmed",
];

export default function EditJournalEntryScreen() {
  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");

  const [mood, setMood] =
    useState<string | null>(
      null
    );

  const [
    energyLevel,
    setEnergyLevel,
  ] =
    useState<number | null>(
      null
    );

  const [
    practices,
    setPractices,
  ] = useState<Practice[]>([]);

  const [
    selectedPracticeIds,
    setSelectedPracticeIds,
  ] = useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  useEffect(() => {
    loadEntry();
  }, [id]);

  async function loadEntry() {
    if (!id) {
      return;
    }

    try {
      setLoading(true);

      const [
        entry,
        availablePractices,
        currentPractices,
      ] =
        await Promise.all([
          getJournalEntry(id),
          getPractices(),
          getEntryPractices(id),
        ]);

      setTitle(entry.title);
      setContent(entry.content);
      setMood(entry.mood);
      setEnergyLevel(
        entry.energy_level
      );

      setPractices(
        availablePractices
      );

      setSelectedPracticeIds(
        currentPractices.map(
          (item) =>
            item.practice_id
        )
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to open this reflection."
      );
    } finally {
      setLoading(false);
    }
  }

  function togglePractice(
    practiceId: string
  ) {
    setSelectedPracticeIds(
      (current) =>
        current.includes(
          practiceId
        )
          ? current.filter(
              (id) =>
                id !==
                practiceId
            )
          : [
              ...current,
              practiceId,
            ]
    );
  }

  async function saveChanges() {
    if (!id) {
      return;
    }

    const cleanTitle =
      title.trim();

    const cleanContent =
      content.trim();

    if (!cleanTitle) {
      setErrorMessage(
        "This reflection still needs a title."
      );
      return;
    }

    if (!cleanContent) {
      setErrorMessage(
        "The page can't be completely empty."
      );
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      await updateJournalEntry(
        id,
        {
          title: cleanTitle,
          content: cleanContent,
          mood,
          energy_level:
            energyLevel,
        }
      );

      await setEntryPractices(
        id,
        selectedPracticeIds
      );

      router.replace({
        pathname:
          "/journal/[id]",
        params: {
          id,
        },
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save your changes."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator
          color={colors.lavender}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={styles.back}
          onPress={() =>
            router.back()
          }
        >
          <Text style={styles.backText}>
            ‹ Reflection
          </Text>
        </Pressable>

        <Text style={styles.title}>
          Continue the thought
        </Text>

        <Text style={styles.subtitle}>
          Sometimes the meaning changes when we return
          to what we wrote.
        </Text>

        <View style={styles.form}>
          <SoulInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            maxLength={120}
          />

          <SoulInput
            label="Reflection"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            style={styles.largeInput}
          />
        </View>

        <SectionHeading
          title="How does it feel now?"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {moods.map(
            (item) => {
              const selected =
                mood === item;

              return (
                <Pressable
                  key={item}
                  style={[
                    styles.chip,
                    selected &&
                      styles.selected,
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
                      styles.chipText,
                      selected &&
                        styles.selectedText,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            }
          )}
        </ScrollView>

        <SectionHeading
          title="Energy"
        />

        <View style={styles.energyRow}>
          {[1, 2, 3, 4, 5].map(
            (level) => {
              const selected =
                energyLevel ===
                level;

              return (
                <Pressable
                  key={level}
                  style={[
                    styles.energy,
                    selected &&
                      styles.selected,
                  ]}
                  onPress={() =>
                    setEnergyLevel(
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
                        styles.selectedText,
                    ]}
                  >
                    {level}
                  </Text>
                </Pressable>
              );
            }
          )}
        </View>

        <SectionHeading
          title="Practices"
        />

        <View style={styles.practiceWrap}>
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
                    styles.practice,
                    selected &&
                      styles.practiceSelected,
                  ]}
                  onPress={() =>
                    togglePractice(
                      practice.id
                    )
                  }
                >
                  <Text
                    style={[
                      styles.practiceText,
                      selected &&
                        styles.practiceSelectedText,
                    ]}
                  >
                    ✦ {practice.name}
                  </Text>
                </Pressable>
              );
            }
          )}
        </View>

        {errorMessage ? (
          <FeedbackMessage
            type="error"
            message={errorMessage}
          />
        ) : null}

        <SoulButton
          title="Save what changed"
          loading={saving}
          onPress={saveChanges}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  centered: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
  },

  content: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 65,
  },

  back: {
    alignSelf: "flex-start",
    paddingVertical: 8,
  },

  backText: {
    color: colors.lavender,
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
  },

  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 38,
    marginTop: 22,
  },

  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.displayItalic,
    fontSize: 17,
    lineHeight: 23,
    marginBottom: 27,
  },

  form: {
    gap: 17,
    marginBottom: 30,
  },

  largeInput: {
    minHeight: 180,
  },

  chipRow: {
    gap: 8,
    paddingBottom: 29,
  },

  chip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  selected: {
    backgroundColor: colors.purpleDark,
    borderColor: colors.lavenderStrong,
  },

  chipText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 11,
  },

  selectedText: {
    color: colors.white,
  },

  energyRow: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 30,
  },

  energy: {
    flex: 1,
    minHeight: 47,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
  },

  energyText: {
    color: colors.textMuted,
    fontFamily: fonts.display,
    fontSize: 20,
  },

  practiceWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 29,
  },

  practice: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  practiceSelected: {
    borderColor: colors.lavenderStrong,
    backgroundColor: colors.surfaceRaised,
  },

  practiceText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 10,
  },

  practiceSelectedText: {
    color: colors.lavender,
  },
}); 