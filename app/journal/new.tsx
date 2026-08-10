import {
  router,
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

import SoulButton from "../../src/components/SoulButton";
import SoulInput from "../../src/components/SoulInput";
import FeedbackMessage from "../../src/components/FeedbackMessage";
import SectionHeading from "../../src/components/SectionHeading";

import {
  colors,
  fonts,
  radius,
} from "../../src/theme";

import {
  createJournalEntry,
} from "../../src/services/journalService";

import {
  getPractices,
  Practice,
  setEntryPractices,
} from "../../src/services/practiceService";

import {
  useUnsavedChangesGuard,
} from "../../src/hooks/useUnsavedChangesGuard";

import {
  validateEnergyLevel,
  validateJournalContent,
  validateJournalTitle,
} from "../../src/utils/validation";

const moods = [
  "Peaceful",
  "Happy",
  "Reflective",
  "Neutral",
  "Anxious",
  "Sad",
  "Overwhelmed",
];

type FormErrors = {
  title?: string;
  content?: string;
  energy?: string;
};

export default function NewJournalEntryScreen() {
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
    loadingPractices,
    setLoadingPractices,
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

  const [
    dirty,
    setDirty,
  ] = useState(false);

  useUnsavedChangesGuard(
    dirty && !saving,
    {
      title:
        "Leave this reflection?",
      message:
        "Your words haven't been saved yet.",
    }
  );

  useEffect(() => {
    void loadPractices();
  }, []);

  async function loadPractices() {
    try {
      setLoadingPractices(
        true
      );

      const data =
        await getPractices();

      setPractices(data);
    } catch (error) {
      console.error(
        "Unable to load practices:",
        error
      );

      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to load spiritual practices."
      );
    } finally {
      setLoadingPractices(
        false
      );
    }
  }

  function togglePractice(
    id: string
  ) {
    if (saving) {
      return;
    }

    setDirty(true);

    setSelectedPracticeIds(
      (current) =>
        current.includes(id)
          ? current.filter(
              (item) =>
                item !== id
            )
          : [
              ...current,
              id,
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

  async function saveEntry() {
    if (saving) {
      return;
    }

    setFormError("");

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const entry =
        await createJournalEntry(
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
        entry.id,
        selectedPracticeIds
      );

      setDirty(false);

      router.replace({
        pathname:
          "/journal/[id]",

        params: {
          id: entry.id,
        },
      });
    } catch (error) {
      console.error(
        "Unable to save reflection:",
        error
      );

      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to save your reflection."
      );
    } finally {
      setSaving(false);
    }
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
            ‹ Journal
          </Text>
        </Pressable>

        <Text
          style={styles.symbol}
        >
          ☾
        </Text>

        <Text
          style={styles.title}
        >
          A new reflection
        </Text>

        <Text
          style={styles.subtitle}
        >
          You don't have to make
          sense of it. Let the page
          hold it first.
        </Text>

        <View
          style={styles.form}
        >
          <SoulInput
            label="A few words to remember this by"
            value={title}
            onChangeText={(
              value
            ) => {
              setTitle(value);
              setDirty(true);

              setErrors(
                (current) => ({
                  ...current,
                  title: undefined,
                })
              );
            }}
            placeholder="Title"
            maxLength={120}
            editable={!saving}
            error={errors.title}
          />

          <SoulInput
            label="What's here?"
            value={content}
            onChangeText={(
              value
            ) => {
              setContent(value);
              setDirty(true);

              setErrors(
                (current) => ({
                  ...current,
                  content:
                    undefined,
                })
              );
            }}
            placeholder="Write freely..."
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
          title="How does today feel?"
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
                      styles.chipSelected,
                  ]}
                  onPress={() => {
                    setMood(
                      selected
                        ? null
                        : item
                    );

                    setDirty(true);
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,

                      selected &&
                        styles.chipTextSelected,
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
          title="Where is your energy?"
          subtitle="1 is very low, 5 is very full."
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
                    styles.energyButton,

                    selected &&
                      styles.energySelected,
                  ]}
                  onPress={() => {
                    setEnergyLevel(
                      selected
                        ? null
                        : level
                    );

                    setDirty(true);

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
                        styles.energyTextSelected,
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
          title="What supported you?"
          subtitle="Choose any practices that were part of your day."
        />

        {loadingPractices ? (
          <ActivityIndicator
            color={
              colors.lavender
            }
          />
        ) : (
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
                    disabled={
                      saving
                    }
                    style={[
                      styles.practiceChip,

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
                          styles.practiceTextSelected,
                      ]}
                    >
                      ✦{" "}
                      {
                        practice.name
                      }
                    </Text>
                  </Pressable>
                );
              }
            )}
          </View>
        )}

        {formError ? (
          <FeedbackMessage
            type="error"
            message={formError}
          />
        ) : null}

        <SoulButton
          title="Keep this reflection"
          loading={saving}
          disabled={saving}
          onPress={saveEntry}
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

    symbol: {
      color: colors.gold,
      fontSize: 20,
      marginTop: 20,
    },

    title: {
      color: colors.text,
      fontFamily:
        fonts.display,
      fontSize: 39,
      marginTop: 6,
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

    form: {
      gap: 17,
      marginBottom: 30,
    },

    largeInput: {
      minHeight: 180,
      paddingTop: 15,
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

    chipSelected: {
      backgroundColor:
        colors.purpleDark,
      borderColor:
        colors.lavenderStrong,
    },

    chipText: {
      color:
        colors.textMuted,
      fontFamily:
        fonts.bodyMedium,
      fontSize: 11,
    },

    chipTextSelected: {
      color: colors.white,
    },

    energyRow: {
      flexDirection: "row",
      gap: 9,
    },

    energyButton: {
      flex: 1,
      minHeight: 48,
      backgroundColor:
        colors.surface,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.md,
      justifyContent:
        "center",
      alignItems: "center",
    },

    energySelected: {
      backgroundColor:
        colors.purpleDark,
      borderColor:
        colors.lavenderStrong,
    },

    energyText: {
      color:
        colors.textMuted,
      fontFamily:
        fonts.display,
      fontSize: 21,
    },

    energyTextSelected: {
      color: colors.white,
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
      marginBottom: 28,
    },

    practiceChip: {
      backgroundColor:
        colors.surface,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.pill,
      paddingHorizontal: 13,
      paddingVertical: 9,
    },

    practiceSelected: {
      backgroundColor:
        colors.surfaceRaised,
      borderColor:
        colors.lavenderStrong,
    },

    practiceText: {
      color:
        colors.textMuted,
      fontFamily: fonts.body,
      fontSize: 11,
    },

    practiceTextSelected: {
      color:
        colors.lavender,
    },
  }); 