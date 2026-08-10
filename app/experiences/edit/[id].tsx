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
  ExperienceType,
  getExperience,
  updateExperience,
} from "../../../src/services/experienceService";

import {
  useUnsavedChangesGuard,
} from "../../../src/hooks/useUnsavedChangesGuard";

import {
  validateExperienceDescription,
  validateExperienceTitle,
  validateOptionalReflection,
  validateSignificanceLevel,
} from "../../../src/utils/validation";

type Snapshot = {
  experienceType:
    ExperienceType;

  title: string;

  description: string;

  interpretation: string;

  significance:
    | number
    | null;
};

type FormErrors = {
  title?: string;
  description?: string;
  interpretation?: string;
  significance?: string;
};

export default function EditExperienceScreen() {
  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

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
        experienceType !==
          original.experienceType ||
        title !==
          original.title ||
        description !==
          original.description ||
        interpretation !==
          original.interpretation ||
        significance !==
          original.significance
      );
    }, [
      experienceType,
      title,
      description,
      interpretation,
      significance,
      original,
    ]);

  useUnsavedChangesGuard(
    dirty && !saving,
    {
      title:
        "Leave this memory?",
      message:
        "The changes you made haven't been saved.",
    }
  );

  useEffect(() => {
    void loadExperience();
  }, [id]);

  async function loadExperience() {
    if (!id) {
      setFormError(
        "This memory could not be found."
      );

      setLoading(false);

      return;
    }

    try {
      setLoading(true);
      setFormError("");

      const experience =
        await getExperience(
          id
        );

      const initial:
        Snapshot = {
        experienceType:
          experience.experience_type,

        title:
          experience.title,

        description:
          experience.description,

        interpretation:
          experience.interpretation ??
          "",

        significance:
          experience.significance_level,
      };

      setExperienceType(
        initial.experienceType
      );

      setTitle(
        initial.title
      );

      setDescription(
        initial.description
      );

      setInterpretation(
        initial.interpretation
      );

      setSignificance(
        initial.significance
      );

      setOriginal(initial);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to open this memory."
      );
    } finally {
      setLoading(false);
    }
  }

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

    const interpretationResult =
      validateOptionalReflection(
        interpretation
      );

    if (
      !interpretationResult.valid
    ) {
      nextErrors.interpretation =
        interpretationResult.message;
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

      const cleanDescription =
        description.trim();

      const cleanInterpretation =
        interpretation.trim();

      await updateExperience(
        id,
        {
          experience_type:
            experienceType,

          title:
            cleanTitle,

          description:
            cleanDescription,

          interpretation:
            cleanInterpretation ||
            null,

          significance_level:
            significance,
        }
      );

      setOriginal({
        experienceType,

        title:
          cleanTitle,

        description:
          cleanDescription,

        interpretation:
          cleanInterpretation,

        significance,
      });

      router.replace({
        pathname:
          "/experiences/[id]",

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
            ‹ Memory
          </Text>
        </Pressable>

        <Text
          style={styles.title}
        >
          Return to the memory
        </Text>

        <Text
          style={styles.subtitle}
        >
          What we remember — and
          what it means to us — can
          change with time.
        </Text>

        <SectionHeading
          title="What kind of moment?"
        />

        <View
          style={styles.typeRow}
        >
          <TypeButton
            symbol="☾"
            label="Dream"
            selected={
              experienceType ===
              "dream"
            }
            disabled={saving}
            onPress={() =>
              setExperienceType(
                "dream"
              )
            }
          />

          <TypeButton
            symbol="✦"
            label="Sign"
            selected={
              experienceType ===
              "synchronicity"
            }
            disabled={saving}
            onPress={() =>
              setExperienceType(
                "synchronicity"
              )
            }
          />
        </View>

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
            label="What happened?"
            value={description}
            onChangeText={(
              value
            ) => {
              setDescription(
                value
              );

              setErrors(
                (current) => ({
                  ...current,
                  description:
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
              errors.description
            }
          />

          <SoulInput
            label="What does it bring up for you?"
            value={
              interpretation
            }
            onChangeText={(
              value
            ) => {
              setInterpretation(
                value
              );

              setErrors(
                (current) => ({
                  ...current,
                  interpretation:
                    undefined,
                })
              );
            }}
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
          title="How deeply does it stay with you?"
        />

        <View
          style={styles.levelRow}
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

function TypeButton({
  symbol,
  label,
  selected,
  disabled,
  onPress,
}: {
  symbol: string;
  label: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      style={[
        styles.typeButton,

        selected &&
          styles.typeSelected,

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
        style={[
          styles.typeText,

          selected &&
            styles.typeTextSelected,
        ]}
      >
        {label}
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

    centered: {
      flex: 1,
      justifyContent:
        "center",
      alignItems: "center",
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
      marginBottom: 30,
    },

    typeRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 30,
    },

    typeButton: {
      flex: 1,
      backgroundColor:
        colors.surface,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.lg,
      paddingVertical: 17,
      alignItems: "center",
    },

    typeSelected: {
      backgroundColor:
        colors.surfaceRaised,
      borderColor:
        colors.lavenderStrong,
    },

    typeSymbol: {
      color: colors.gold,
      fontSize: 20,
    },

    typeText: {
      color:
        colors.textMuted,
      fontFamily:
        fonts.bodySemiBold,
      fontSize: 11,
      marginTop: 5,
    },

    typeTextSelected: {
      color:
        colors.lavender,
    },

    form: {
      gap: 17,
      marginBottom: 30,
    },

    largeInput: {
      minHeight: 150,
    },

    reflectionInput: {
      minHeight: 120,
    },

    levelRow: {
      flexDirection: "row",
      gap: 8,
    },

    level: {
      flex: 1,
      minHeight: 48,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.md,
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
      marginBottom: 24,
    },

    disabled: {
      opacity: 0.55,
    },
  }); 