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
  ExperienceType,
  getExperience,
  updateExperience,
} from "../../../src/services/experienceService";

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

  const [title, setTitle] =
    useState("");

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

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  useEffect(() => {
    loadExperience();
  }, [id]);

  async function loadExperience() {
    if (!id) {
      return;
    }

    try {
      setLoading(true);

      const experience =
        await getExperience(id);

      setExperienceType(
        experience.experience_type
      );

      setTitle(
        experience.title
      );

      setDescription(
        experience.description
      );

      setInterpretation(
        experience.interpretation ??
          ""
      );

      setSignificance(
        experience.significance_level
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to open this memory."
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveChanges() {
    if (!id) {
      return;
    }

    const cleanTitle =
      title.trim();

    const cleanDescription =
      description.trim();

    if (!cleanTitle) {
      setErrorMessage(
        "This memory still needs a title."
      );
      return;
    }

    if (!cleanDescription) {
      setErrorMessage(
        "Write a little of what happened."
      );
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

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
            interpretation.trim() ||
            null,

          significance_level:
            significance,
        }
      );

      router.replace({
        pathname:
          "/experiences/[id]",
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
      <SafeAreaView
        style={styles.centered}
      >
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
            ‹ Memory
          </Text>
        </Pressable>

        <Text style={styles.title}>
          Return to the memory
        </Text>

        <Text style={styles.subtitle}>
          What we remember — and what it means to us —
          can change with time.
        </Text>

        <SectionHeading
          title="What kind of moment?"
        />

        <View style={styles.typeRow}>
          <TypeButton
            symbol="☾"
            label="Dream"
            selected={
              experienceType ===
              "dream"
            }
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
            onPress={() =>
              setExperienceType(
                "synchronicity"
              )
            }
          />
        </View>

        <View style={styles.form}>
          <SoulInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            maxLength={120}
          />

          <SoulInput
            label="What happened?"
            value={description}
            onChangeText={
              setDescription
            }
            multiline
            textAlignVertical="top"
            style={styles.largeInput}
          />

          <SoulInput
            label="What does it bring up for you?"
            value={interpretation}
            onChangeText={
              setInterpretation
            }
            multiline
            textAlignVertical="top"
            style={styles.reflectionInput}
          />
        </View>

        <SectionHeading
          title="How deeply does it stay with you?"
        />

        <View style={styles.levelRow}>
          {[1, 2, 3, 4, 5].map(
            (level) => {
              const selected =
                significance ===
                level;

              return (
                <Pressable
                  key={level}
                  style={[
                    styles.level,
                    selected &&
                      styles.levelSelected,
                  ]}
                  onPress={() =>
                    setSignificance(
                      selected
                        ? null
                        : level
                    )
                  }
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

function TypeButton({
  symbol,
  label,
  selected,
  onPress,
}: {
  symbol: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.typeButton,
        selected &&
          styles.typeSelected,
      ]}
      onPress={onPress}
    >
      <Text style={styles.typeSymbol}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.background,
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
    lineHeight: 42,
    marginTop: 22,
  },

  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.displayItalic,
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: 17,
    alignItems: "center",
  },

  typeSelected: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.lavenderStrong,
  },

  typeSymbol: {
    color: colors.gold,
    fontSize: 20,
  },

  typeText: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    marginTop: 5,
  },

  typeTextSelected: {
    color: colors.lavender,
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
    marginBottom: 29,
  },

  level: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },

  levelSelected: {
    backgroundColor: colors.purpleDark,
    borderColor: colors.lavenderStrong,
  },

  levelText: {
    color: colors.textMuted,
    fontFamily: fonts.display,
    fontSize: 21,
  },

  levelTextSelected: {
    color: colors.white,
  },
}); 