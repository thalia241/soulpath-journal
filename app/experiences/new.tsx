import {
  router,
} from "expo-router";

import {
  useState,
} from "react";

import {
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
  createExperience,
  ExperienceType,
} from "../../src/services/experienceService";

import {
  useUnsavedChangesGuard,
} from "../../src/hooks/useUnsavedChangesGuard";

import {
  validateExperienceDescription,
  validateExperienceTitle,
  validateOptionalReflection,
  validateSignificanceLevel,
} from "../../src/utils/validation";

type FormErrors = {
  title?: string;
  description?: string;
  interpretation?: string;
  significance?: string;
};

export default function NewExperienceScreen() {
  const [
    experienceType,
    setExperienceType,
  ] =
    useState<ExperienceType>(
      "dream"
    );

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    interpretation,
    setInterpretation,
  ] = useState("");

  const [
    significance,
    setSignificance,
  ] =
    useState<number | null>(
      null
    );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    dirty,
    setDirty,
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

  useUnsavedChangesGuard(
    dirty && !saving,
    {
      title:
        "Leave this memory?",
      message:
        "What you've written hasn't been saved yet.",
    }
  );

  function validateForm(): boolean {
    const nextErrors:
      FormErrors = {};

    const titleResult =
      validateExperienceTitle(
        title
      );

    if (!titleResult.valid) {
      nextErrors.title =
        titleResult.message;
    }

    const descriptionResult =
      validateExperienceDescription(
        description
      );

    if (
      !descriptionResult.valid
    ) {
      nextErrors.description =
        descriptionResult.message;
    }

    const reflectionResult =
      validateOptionalReflection(
        interpretation
      );

    if (
      !reflectionResult.valid
    ) {
      nextErrors.interpretation =
        reflectionResult.message;
    }

    const significanceResult =
      validateSignificanceLevel(
        significance
      );

    if (
      !significanceResult.valid
    ) {
      nextErrors.significance =
        significanceResult.message;
    }

    setErrors(nextErrors);

    return (
      Object.keys(
        nextErrors
      ).length === 0
    );
  }

  async function saveExperience() {
    if (saving) {
      return;
    }

    setFormError("");

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const experience =
        await createExperience(
          {
            experience_type:
              experienceType,

            title:
              title.trim(),

            description:
              description.trim(),

            interpretation:
              interpretation.trim() ||
              null,

            significance_level:
              significance,
          }
        );

      setDirty(false);

      router.replace({
        pathname:
          "/experiences/[id]",

        params: {
          id:
            experience.id,
        },
      });
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to save this experience."
      );
    } finally {
      setSaving(false);
    }
  }

  const dream =
    experienceType ===
    "dream";

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
            ‹ Dreams & Signs
          </Text>
        </Pressable>

        <Text
          style={styles.symbol}
        >
          {dream ? "☾" : "✦"}
        </Text>

        <Text
          style={styles.title}
        >
          {dream
            ? "Remember a dream"
            : "Notice a sign"}
        </Text>

        <Text
          style={styles.subtitle}
        >
          {dream
            ? "Write what remains before the edges begin to fade."
            : "Keep the moment as you experienced it, without needing to decide what it means."}
        </Text>

        <SectionHeading
          title="What kind of moment?"
        />

        <View
          style={styles.typeRow}
        >
          <TypeCard
            symbol="☾"
            title="Dream"
            subtitle="Something remembered from sleep"
            selected={
              experienceType ===
              "dream"
            }
            disabled={saving}
            onPress={() => {
              setExperienceType(
                "dream"
              );

              setDirty(true);
            }}
          />

          <TypeCard
            symbol="✦"
            title="Sign"
            subtitle="A synchronicity or meaningful coincidence"
            selected={
              experienceType ===
              "synchronicity"
            }
            disabled={saving}
            onPress={() => {
              setExperienceType(
                "synchronicity"
              );

              setDirty(true);
            }}
          />
        </View>

        <View
          style={styles.form}
        >
          <SoulInput
            label="A name for this memory"
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
            placeholder={
              dream
                ? "The house by the ocean..."
                : "11:11 after thinking of..."
            }
            maxLength={120}
            editable={!saving}
            error={errors.title}
          />

          <SoulInput
            label={
              dream
                ? "What happened in the dream?"
                : "What happened?"
            }
            value={description}
            onChangeText={(
              value
            ) => {
              setDescription(
                value
              );

              setDirty(true);

              setErrors(
                (current) => ({
                  ...current,
                  description:
                    undefined,
                })
              );
            }}
            placeholder="Write what you remember..."
            multiline
            textAlignVertical="top"
            editable={!saving}
            style={
              styles.largeInput
            }
            error={
              errors.description
            }
          />

          <SoulInput
            label="What does it bring up for you?"
            hint="Optional. This is your own reflection, not an interpretation generated by SoulPath."
            value={
              interpretation
            }
            onChangeText={(
              value
            ) => {
              setInterpretation(
                value
              );

              setDirty(true);

              setErrors(
                (current) => ({
                  ...current,
                  interpretation:
                    undefined,
                })
              );
            }}
            placeholder="Thoughts, symbols, feelings..."
            multiline
            textAlignVertical="top"
            editable={!saving}
            style={
              styles.reflectionInput
            }
            error={
              errors.interpretation
            }
          />
        </View>

        <SectionHeading
          title="How deeply did it stay with you?"
          subtitle="Optional — from subtle to profound."
        />

        <View
          style={
            styles.significanceRow
          }
        >
          {[1, 2, 3, 4, 5].map(
            (level) => {
              const selected =
                significance ===
                level;

              return (
                <Pressable
                  key={level}
                  disabled={saving}
                  style={[
                    styles.level,

                    selected &&
                      styles.levelSelected,
                  ]}
                  onPress={() => {
                    setSignificance(
                      selected
                        ? null
                        : level
                    );

                    setDirty(true);

                    setErrors(
                      (current) => ({
                        ...current,
                        significance:
                          undefined,
                      })
                    );
                  }}
                >
                  <Text
                    style={[
                      styles.levelText,

                      selected &&
                        styles.levelTextSelected,
                    ]}
                  >
                    {level}
                  </Text>
                </Pressable>
              );
            }
          )}
        </View>

        {errors.significance ? (
          <Text
            style={
              styles.fieldError
            }
          >
            {
              errors.significance
            }
          </Text>
        ) : null}

        <View
          style={
            styles.scaleLabels
          }
        >
          <Text
            style={
              styles.scaleText
            }
          >
            subtle
          </Text>

          <Text
            style={
              styles.scaleText
            }
          >
            profound
          </Text>
        </View>

        {formError ? (
          <FeedbackMessage
            type="error"
            message={formError}
          />
        ) : null}

        <SoulButton
          title={
            dream
              ? "Keep this dream"
              : "Keep this sign"
          }
          loading={saving}
          disabled={saving}
          onPress={
            saveExperience
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function TypeCard({
  symbol,
  title,
  subtitle,
  selected,
  disabled,
  onPress,
}: {
  symbol: string;
  title: string;
  subtitle: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      style={[
        styles.typeCard,

        selected &&
          styles.typeCardSelected,

        disabled &&
          styles.disabled,
      ]}
      onPress={onPress}
    >
      <Text
        style={styles.typeSymbol}
      >
        {symbol}
      </Text>

      <Text
        style={styles.typeTitle}
      >
        {title}
      </Text>

      <Text
        style={
          styles.typeSubtitle
        }
      >
        {subtitle}
      </Text>
    </Pressable>
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
      fontSize: 24,
      marginTop: 21,
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
      marginBottom: 30,
    },

    typeRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 30,
    },

    typeCard: {
      flex: 1,
      minHeight: 135,
      backgroundColor:
        colors.surface,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.lg,
      padding: 17,
    },

    typeCardSelected: {
      borderColor:
        colors.lavenderStrong,
      backgroundColor:
        colors.surfaceRaised,
    },

    typeSymbol: {
      color: colors.gold,
      fontSize: 22,
    },

    typeTitle: {
      color: colors.text,
      fontFamily:
        fonts.display,
      fontSize: 22,
      marginTop: 6,
    },

    typeSubtitle: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 9,
      lineHeight: 14,
      marginTop: 3,
    },

    form: {
      gap: 17,
      marginBottom: 30,
    },

    largeInput: {
      minHeight: 155,
    },

    reflectionInput: {
      minHeight: 120,
    },

    significanceRow: {
      flexDirection: "row",
      gap: 8,
    },

    level: {
      flex: 1,
      minHeight: 48,
      borderRadius:
        radius.md,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.surface,
      justifyContent:
        "center",
      alignItems: "center",
    },

    levelSelected: {
      backgroundColor:
        colors.purpleDark,
      borderColor:
        colors.lavenderStrong,
    },

    levelText: {
      color:
        colors.textMuted,
      fontFamily:
        fonts.display,
      fontSize: 21,
    },

    levelTextSelected: {
      color: colors.white,
    },

    fieldError: {
      color:
        colors.errorText,
      fontFamily: fonts.body,
      fontSize: 11,
      marginTop: 7,
    },

    scaleLabels: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      marginTop: 6,
      marginBottom: 28,
    },

    scaleText: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 9,
    },

    disabled: {
      opacity: 0.55,
    },
  }); 