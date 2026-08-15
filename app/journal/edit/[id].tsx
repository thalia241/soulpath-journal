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
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import SoulButton from "../../../src/components/SoulButton";
import SoulInput from "../../../src/components/SoulInput";
import SoulScreen from "../../../src/components/SoulScreen";
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

  mood:
    | string
    | null;

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

function normalized(
  ids: string[]
) {
  return [...ids].sort();
}

function sameIds(
  first: string[],
  second: string[]
) {
  const a =
    normalized(first);

  const b =
    normalized(second);

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
    useState<FormErrors>(
      {}
    );

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
          getJournalEntry(id),

          getPractices(),

          getEntryPractices(id),
        ]);

      const practiceIds =
        currentPractices.map(
          (item) =>
            item.practice_id
        );

      setTitle(entry.title);

      setContent(
        entry.content
      );

      setMood(entry.mood);

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

  function validateForm() {
    const nextErrors:
      FormErrors = {};

    const titleResult =
      validateJournalTitle(
        title
      );

    const contentResult =
      validateJournalContent(
        content
      );

    const energyResult =
      validateEnergyLevel(
        energyLevel
      );

    if (!titleResult.valid) {
      nextErrors.title =
        titleResult.message;
    }

    if (!contentResult.valid) {
      nextErrors.content =
        contentResult.message;
    }

    if (!energyResult.valid) {
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

      const cleanTitle =
        title.trim();

      const cleanContent =
        content.trim();

      await updateJournalEntry(
        id,
        {
          title:
            cleanTitle,

          content:
            cleanContent,

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
          cleanTitle,

        content:
          cleanContent,

        mood,

        energyLevel,

        practiceIds:
          [...selectedPracticeIds],
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

  return (
    <SoulScreen
      keyboard
      contentStyle={
        styles.content
      }
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to reflection"
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

      {loading ? (
        <View
          style={styles.loading}
        >
          <ActivityIndicator
            color={
              colors.lavender
            }
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Returning to your
            reflection...
          </Text>
        </View>
      ) : (
        <>
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

                    title:
                      undefined,
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
                    accessibilityRole="button"
                    accessibilityState={{
                      selected,
                    }}
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
            style={
              styles.energyRow
            }
          >
            {[1, 2, 3, 4, 5].map(
              (level) => {
                const selected =
                  energyLevel ===
                  level;

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Energy ${level} out of 5`}
                    accessibilityState={{
                      selected,
                    }}
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
              accessibilityRole="alert"
              style={
                styles.fieldError
              }
            >
              {errors.energy}
            </Text>
          ) : (
            <View
              style={
                styles.energySpacing
              }
            />
          )}

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
                    accessibilityRole="button"
                    accessibilityState={{
                      selected,
                    }}
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
              message={
                formError
              }
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
        </>
      )}
    </SoulScreen>
  );
}

const styles =
  StyleSheet.create({
    content: {
      maxWidth: 680,
    },

    back: {
      alignSelf:
        "flex-start",

      paddingVertical: 10,
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

      lineHeight: 42,

      marginTop: 22,
    },

    subtitle: {
      color:
        colors.textMuted,

      fontFamily:
        fonts.displayItalic,

      fontSize: 17,

      lineHeight: 23,

      marginTop: 3,

      marginBottom: 27,
    },

    loading: {
      alignItems: "center",

      paddingVertical: 50,

      gap: 12,
    },

    loadingText: {
      color:
        colors.textDim,

      fontFamily:
        fonts.body,

      fontSize: 11,
    },

    form: {
      gap: 17,

      marginBottom: 30,
    },

    largeInput: {
      minHeight: 190,
    },

    chipRow: {
      gap: 8,

      paddingBottom: 29,
    },

    chip: {
      minHeight: 42,

      justifyContent:
        "center",

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

      fontFamily:
        fonts.body,

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

      minHeight: 50,

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

      fontFamily:
        fonts.body,

      fontSize: 11,

      marginTop: 7,

      marginBottom: 24,
    },

    energySpacing: {
      height: 30,
    },

    practiceWrap: {
      flexDirection: "row",

      flexWrap: "wrap",

      gap: 8,

      marginBottom: 29,
    },

    practice: {
      minHeight: 40,

      justifyContent:
        "center",

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

      fontFamily:
        fonts.body,

      fontSize: 10,
    },

    practiceSelectedText: {
      color:
        colors.lavender,
    },
  }); 