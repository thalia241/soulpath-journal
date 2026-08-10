import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  useEffect,
  useMemo,
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

import {
  useUnsavedChangesGuard,
} from "../../../src/hooks/useUnsavedChangesGuard";

import {
  validateEnergyLevel,
  validateJournalContent,
  validateJournalTitle,
} from "../../../src/utils/validation";

const moods = [
  "Peaceful",
  "Happy",
  "Reflective",
  "Neutral",
  "Anxious",
  "Sad",
  "Overwhelmed",
];

type Snapshot = {
  title: string;
  content: string;
  mood: string | null;
  energyLevel:
    | number
    | null;
  practiceIds: string[];
};

type FormErrors = {
  title?: string;
  content?: string;
  energy?: string;
};

function normalizeIds(
  ids: string[]
) {
  return [...ids].sort();
}

function sameIds(
  first: string[],
  second: string[]
) {
  const a =
    normalizeIds(first);

  const b =
    normalizeIds(second);

  return (
    a.length === b.length &&
    a.every(
      (value, index) =>
        value === b[index]
    )
  );
}

export default function EditJournalEntryScreen() {
  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    content,
    setContent,
  ] = useState("");

  const [
    mood,
    setMood,
  ] =
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
  ] =
    useState<Practice[]>([]);

  const [
    selectedPracticeIds,
    setSelectedPracticeIds,
  ] =
    useState<string[]>([]);

  const [
    original,
    setOriginal,
  ] =
    useState<Snapshot | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    errors,
    setErrors,
  ] =
    useState<FormErrors>({});

  const [
    formError,
    setFormError,
  ] = useState("");

  const dirty =
    useMemo(() => {
      if (!original) {
        return false;
      }

      return (
        title !==
          original.title ||
        content !==
          original.content ||
        mood !==
          original.mood ||
        energyLevel !==
          original.energyLevel ||
        !sameIds(
          selectedPracticeIds,
          original.practiceIds
        )
      );
    }, [
      title,
      content,
      mood,
      energyLevel,
      selectedPracticeIds,
      original,
    ]);

  useUnsavedChangesGuard(
    dirty && !saving,
    {
      title:
        "Leave this reflection?",
      message:
        "The changes you made haven't been saved.",
    }
  );

  useEffect(() => {
    void loadEntry();
  }, [id]);

  async function loadEntry() {
    if (!id) {
      setFormError(
        "This reflection could not be found."
      );

      setLoading(false);

      return;
    }

    try {
      setLoading(true);
      setFormError("");

      const [
        entry,
        availablePractices,
        currentPractices,
      ] =
        await Promise.all([
          getJournalEntry(
            id
          ),

          getPractices(),

          getEntryPractices(
            id
          ),
        ]);

      const practiceIds =
        currentPractices.map(
          (item) =>
            item.practice_id
        );

      setTitle(
        entry.title
      );

      setContent(
        entry.content
      );

      setMood(
        entry.mood
      );

      setEnergyLevel(
        entry.energy_level
      );

      setPractices(
        availablePractices
      );

      setSelectedPracticeIds(
        practiceIds
      );

      setOriginal({
        title:
          entry.title,

        content:
          entry.content,

        mood:
          entry.mood,

        energyLevel:
          entry.energy_level,

        practiceIds,
      });
    } catch (error) {
      setFormError(
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
    if (saving) {
      return;
    }

    setSelectedPracticeIds(
      (current) =>
        current.includes(
          practiceId
        )
          ? current.filter(
              (currentId) =>
                currentId !==
                practiceId
            )
          : [
              ...current,
              practiceId,
            ]
    );
  }

  function validateForm(): boolean {
    const nextErrors:
      FormErrors = {};

    const titleResult =
      validateJournalTitle(
        title
      );

    if (!titleResult.valid) {
      nextErrors.title =
        titleResult.message;
    }

    const contentResult =
      validateJournalContent(
        content
      );

    if (
      !contentResult.valid
    ) {
      nextErrors.content =
        contentResult.message;
    }

    const energyResult =
      validateEnergyLevel(
        energyLevel
      );

    if (
      !energyResult.valid
    ) {
      nextErrors.energy =
        energyResult.message;
    }

    setErrors(nextErrors);

    return (
      Object.keys(
        nextErrors
      ).length === 0
    );
  }

  async function saveChanges() {
    if (
      !id ||
      saving ||
      !dirty
    ) {
      return;
    }

    setFormError("");

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      await updateJournalEntry(
        id,
        {
          title:
            title.trim(),

          content:
            content.trim(),

          mood,

          energy_level:
            energyLevel,
        }
      );

      await setEntryPractices(
        id,
        selectedPracticeIds
      );

      setOriginal({
        title:
          title.trim(),

        content:
          content.trim(),

        mood,

        energyLevel,

        practiceIds:
          selectedPracticeIds,
      });

      router.replace({
        pathname:
          "/journal/[id]",

        params: {
          id,
        },
      });
    } catch (error) {
      setFormError(
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
      <SafeAreaView
        style={styles.centered}
      >
        <ActivityIndicator
          color={
            colors.lavender
          }
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        <Pressable
          style={styles.back}
          disabled={saving}
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={styles.backText}
          >
            ‹ Reflection
          </Text>
        </Pressable>

        <Text
          style={styles.title}
        >
          Continue the thought
        </Text>

        <Text
          style={styles.subtitle}
        >
          Sometimes the meaning
          changes when we return to
          what we wrote.
        </Text>

        <View
          style={styles.form}
        >
          <SoulInput
            label="Title"
            value={title}
            onChangeText={(
              value
            ) => {
              setTitle(value);

              setErrors(
                (current) => ({
                  ...current,
                  title: undefined,
                })
              );
            }}
            maxLength={120}
            editable={!saving}
            error={errors.title}
          />

          <SoulInput
            label="Reflection"
            value={content}
            onChangeText={(
              value
            ) => {
              setContent(value);

              setErrors(
                (current) => ({
                  ...current,
                  content:
                    undefined,
                })
              );
            }}
            multiline
            textAlignVertical="top"
            editable={!saving}
            style={
              styles.largeInput
            }
            error={
              errors.content
            }
          />
        </View>

        <SectionHeading
          title="How does it feel now?"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.chipRow
          }
        >
          {moods.map(
            (item) => {
              const selected =
                mood === item;

              return (
                <Pressable
                  key={item}
                  disabled={saving}
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

        <View
          style={styles.energyRow}
        >
          {[1, 2, 3, 4, 5].map(
            (level) => {
              const selected =
                energyLevel ===
                level;

              return (
                <Pressable
                  key={level}
                  disabled={saving}
                  style={[
                    styles.energy,

                    selected &&
                      styles.selected,
                  ]}
                  onPress={() => {
                    setEnergyLevel(
                      selected
                        ? null
                        : level
                    );

                    setErrors(
                      (current) => ({
                        ...current,
                        energy:
                          undefined,
                      })
                    );
                  }}
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

        {errors.energy ? (
          <Text
            style={
              styles.fieldError
            }
          >
            {errors.energy}
          </Text>
        ) : null}

        <SectionHeading
          title="Practices"
        />

        <View
          style={
            styles.practiceWrap
          }
        >
          {practices.map(
            (practice) => {
              const selected =
                selectedPracticeIds.includes(
                  practice.id
                );

              return (
                <Pressable
                  key={
                    practice.id
                  }
                  disabled={saving}
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
                    ✦{" "}
                    {practice.name}
                  </Text>
                </Pressable>
              );
            }
          )}
        </View>

        {formError ? (
          <FeedbackMessage
            type="error"
            message={formError}
          />
        ) : null}

        <SoulButton
          title={
            dirty
              ? "Save what changed"
              : "Nothing to save"
          }
          loading={saving}
          disabled={
            saving ||
            !dirty
          }
          onPress={
            saveChanges
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        colors.background,
    },

    centered: {
      flex: 1,
      backgroundColor:
        colors.background,
      justifyContent:
        "center",
      alignItems: "center",
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
      alignSelf:
        "flex-start",
      paddingVertical: 8,
    },

    backText: {
      color:
        colors.lavender,
      fontFamily:
        fonts.bodySemiBold,
      fontSize: 12,
    },

    title: {
      color: colors.text,
      fontFamily:
        fonts.display,
      fontSize: 38,
      marginTop: 22,
    },

    subtitle: {
      color:
        colors.textMuted,
      fontFamily:
        fonts.displayItalic,
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
      backgroundColor:
        colors.surface,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.pill,
      paddingHorizontal: 14,
      paddingVertical: 9,
    },

    selected: {
      backgroundColor:
        colors.purpleDark,
      borderColor:
        colors.lavenderStrong,
    },

    chipText: {
      color:
        colors.textMuted,
      fontFamily: fonts.body,
      fontSize: 11,
    },

    selectedText: {
      color: colors.white,
    },

    energyRow: {
      flexDirection: "row",
      gap: 9,
    },

    energy: {
      flex: 1,
      minHeight: 47,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.md,
      justifyContent:
        "center",
      alignItems: "center",
      backgroundColor:
        colors.surface,
    },

    energyText: {
      color:
        colors.textMuted,
      fontFamily:
        fonts.display,
      fontSize: 20,
    },

    fieldError: {
      color:
        colors.errorText,
      fontFamily: fonts.body,
      fontSize: 11,
      marginTop: 7,
      marginBottom: 24,
    },

    practiceWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 29,
    },

    practice: {
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.surface,
      borderRadius:
        radius.pill,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },

    practiceSelected: {
      borderColor:
        colors.lavenderStrong,
      backgroundColor:
        colors.surfaceRaised,
    },

    practiceText: {
      color:
        colors.textMuted,
      fontFamily: fonts.body,
      fontSize: 10,
    },

    practiceSelectedText: {
      color:
        colors.lavender,
    },
  }); 