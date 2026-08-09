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
  Experience,
  ExperienceType,
  getExperience,
  updateExperience,
} from "../../../src/services/experienceService";

const significanceLevels = [
  1,
  2,
  3,
  4,
  5,
];

export default function EditExperienceScreen() {
  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const [
    experience,
    setExperience,
  ] =
    useState<Experience | null>(
      null
    );

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

  const isDream =
    experienceType === "dream";

  useEffect(() => {
    if (!id) {
      return;
    }

    async function loadExperience() {
      try {
        setLoading(true);

        const data =
          await getExperience(id);

        setExperience(data);

        setExperienceType(
          data.experience_type
        );

        setTitle(data.title);

        setDescription(
          data.description
        );

        setInterpretation(
          data.interpretation ?? ""
        );

        setSignificance(
          data.significance_level
        );
      } catch (error) {
        console.error(
          "Unable to load experience:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load this experience."
        );
      } finally {
        setLoading(false);
      }
    }

    loadExperience();
  }, [id]);

  async function handleSave() {
    if (!experience) {
      return;
    }

    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage(
        isDream
          ? "Give your dream a title."
          : "Give this synchronicity a title."
      );

      return;
    }

    if (!description.trim()) {
      setErrorMessage(
        isDream
          ? "Describe what you remember from the dream."
          : "Describe what happened."
      );

      return;
    }

    try {
      setSaving(true);

      await updateExperience(
        experience.id,
        {
          experience_type:
            experienceType,

          title: title.trim(),

          description:
            description.trim(),

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
          id: experience.id,
        },
      });
    } catch (error) {
      console.error(
        "Unable to update experience:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update this experience."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color="#CDB9FF"
        />

        <Text
          style={styles.loadingText}
        >
          Opening your experience...
        </Text>
      </SafeAreaView>
    );
  }

  if (!experience) {
    return (
      <SafeAreaView
        style={
          styles.loadingContainer
        }
      >
        <Text
          style={styles.errorText}
        >
          {errorMessage ||
            "Experience not found."}
        </Text>

        <Pressable
          onPress={() =>
            router.replace(
              "/experiences"
            )
          }
        >
          <Text
            style={styles.backText}
          >
            Return to Experiences
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
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
          showsVerticalScrollIndicator={
            false
          }
        >
          <Pressable
            onPress={() =>
              router.back()
            }
          >
            <Text
              style={styles.backText}
            >
              ‹ Back
            </Text>
          </Pressable>

          <Text
            style={styles.eyebrow}
          >
            EDIT EXPERIENCE
          </Text>

          <Text
            style={styles.heading}
          >
            Refine what you remember
          </Text>

          <Text
            style={styles.subheading}
          >
            You can revisit the details
            and your interpretation at
            any time.
          </Text>

          <Text
            style={
              styles.sectionTitle
            }
          >
            Experience type
          </Text>

          <View
            style={styles.typeRow}
          >
            <Pressable
              style={[
                styles.typeCard,

                isDream &&
                  styles.typeCardSelected,
              ]}
              onPress={() =>
                setExperienceType(
                  "dream"
                )
              }
            >
              <Text
                style={styles.typeIcon}
              >
                ☾
              </Text>

              <Text
                style={[
                  styles.typeTitle,

                  isDream &&
                    styles.typeTextSelected,
                ]}
              >
                Dream
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.typeCard,

                !isDream &&
                  styles.typeCardSelected,
              ]}
              onPress={() =>
                setExperienceType(
                  "synchronicity"
                )
              }
            >
              <Text
                style={styles.typeIcon}
              >
                ✦
              </Text>

              <Text
                style={[
                  styles.typeTitle,

                  !isDream &&
                    styles.typeTextSelected,
                ]}
              >
                Synchronicity
              </Text>
            </Pressable>
          </View>

          <Text style={styles.label}>
            Title
          </Text>

          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Experience title"
            placeholderTextColor="#70677F"
          />

          <Text style={styles.label}>
            {isDream
              ? "What happened in the dream?"
              : "What happened?"}
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.largeInput,
            ]}
            value={description}
            onChangeText={
              setDescription
            }
            placeholder={
              isDream
                ? "Write everything you remember..."
                : "Describe the coincidence, pattern, or moment..."
            }
            placeholderTextColor="#70677F"
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.label}>
            Personal reflection
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.interpretationInput,
            ]}
            value={interpretation}
            onChangeText={
              setInterpretation
            }
            placeholder={
              isDream
                ? "What might this dream mean to you?"
                : "Why did this feel meaningful to you?"
            }
            placeholderTextColor="#70677F"
            multiline
            textAlignVertical="top"
          />

          <Text
            style={
              styles.sectionTitle
            }
          >
            Significance
          </Text>

          <Text
            style={
              styles.significanceHint
            }
          >
            How meaningful does this feel
            to you now?
          </Text>

          <View
            style={styles.levelRow}
          >
            {significanceLevels.map(
              (level) => {
                const selected =
                  significance ===
                  level;

                return (
                  <Pressable
                    key={level}
                    style={[
                      styles.levelButton,

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

          <View
            style={
              styles.significanceLabels
            }
          >
            <Text
              style={
                styles.significanceLabel
              }
            >
              Subtle
            </Text>

            <Text
              style={
                styles.significanceLabel
              }
            >
              Profound
            </Text>
          </View>

          {errorMessage ? (
            <View
              style={styles.errorBox}
            >
              <Text
                style={
                  styles.errorText
                }
              >
                {errorMessage}
              </Text>
            </View>
          ) : null}

          <Pressable
            style={[
              styles.saveButton,

              saving &&
                styles.disabledButton,
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text
                style={
                  styles.saveButtonText
                }
              >
                Save Changes
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
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
      lineHeight: 22,
      marginTop: 8,
      marginBottom: 24,
    },

    sectionTitle: {
      color: "#E5DCF4",
      fontSize: 17,
      fontWeight: "600",
      marginTop: 24,
      marginBottom: 12,
    },

    typeRow: {
      flexDirection: "row",
      gap: 12,
    },

    typeCard: {
      flex: 1,
      backgroundColor: "#151126",
      borderWidth: 1,
      borderColor: "#302847",
      borderRadius: 18,
      padding: 17,
      minHeight: 100,
    },

    typeCardSelected: {
      backgroundColor: "#21183A",
      borderColor: "#7459BC",
    },

    typeIcon: {
      color: "#D4B866",
      fontSize: 24,
      marginBottom: 9,
    },

    typeTitle: {
      color: "#BEB4CE",
      fontSize: 16,
      fontWeight: "700",
    },

    typeTextSelected: {
      color: "#F3EAFF",
    },

    label: {
      color: "#D8C9F1",
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 9,
      marginTop: 23,
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

    largeInput: {
      minHeight: 190,
      lineHeight: 24,
    },

    interpretationInput: {
      minHeight: 130,
      lineHeight: 22,
    },

    significanceHint: {
      color: "#847B95",
      fontSize: 13,
      marginTop: -5,
      marginBottom: 13,
    },

    levelRow: {
      flexDirection: "row",
      gap: 10,
    },

    levelButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#151126",
      borderWidth: 1,
      borderColor: "#312847",
      justifyContent: "center",
      alignItems: "center",
    },

    levelSelected: {
      backgroundColor: "#7357C7",
      borderColor: "#8F74D2",
    },

    levelText: {
      color: "#A89DBB",
      fontWeight: "700",
    },

    levelTextSelected: {
      color: "#FFFFFF",
    },

    significanceLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      maxWidth: 280,
      marginTop: 8,
    },

    significanceLabel: {
      color: "#6F677C",
      fontSize: 11,
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
      textAlign: "center",
    },

    saveButton: {
      backgroundColor: "#7357C7",
      borderRadius: 16,
      paddingVertical: 17,
      alignItems: "center",
      marginTop: 34,
    },

    saveButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
    },

    disabledButton: {
      opacity: 0.6,
    },
  }); 