import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";

import {
  useCallback,
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

import {
  deleteExperience,
  Experience,
  getExperience,
} from "../../src/services/experienceService";

export default function ExperienceDetailScreen() {
  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const [experience, setExperience] =
    useState<Experience | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [deleting, setDeleting] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const loadExperience =
    useCallback(async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const data =
          await getExperience(id);

        setExperience(data);
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
    }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadExperience();
    }, [loadExperience])
  );

  async function handleDelete() {
    if (!experience || deleting) {
      return;
    }

    try {
      setDeleting(true);
      setErrorMessage("");

      await deleteExperience(
        experience.id
      );

      router.replace(
        "/experiences"
      );
    } catch (error) {
      console.error(
        "Unable to delete experience:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete this experience."
      );

      setDeleting(false);
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

  const isDream =
    experience.experience_type ===
    "dream";

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
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
            ‹ Experiences
          </Text>
        </Pressable>

        <View
          style={styles.typeRow}
        >
          <Text
            style={styles.typeSymbol}
          >
            {isDream ? "☾" : "✦"}
          </Text>

          <Text
            style={styles.typeLabel}
          >
            {isDream
              ? "DREAM"
              : "SYNCHRONICITY"}
          </Text>
        </View>

        <Text style={styles.date}>
          {new Date(
            experience.experienced_at
          ).toLocaleString()}
        </Text>

        <Text
          style={styles.title}
        >
          {experience.title}
        </Text>

        {experience.significance_level ? (
          <View
            style={
              styles.significanceWrap
            }
          >
            <Text
              style={
                styles.significanceChip
              }
            >
              Significance{" "}
              {
                experience.significance_level
              }
              /5
            </Text>
          </View>
        ) : null}

        <View
          style={styles.section}
        >
          <Text
            style={styles.sectionLabel}
          >
            {isDream
              ? "WHAT HAPPENED IN THE DREAM"
              : "WHAT HAPPENED"}
          </Text>

          <Text
            style={styles.bodyText}
          >
            {
              experience.description
            }
          </Text>
        </View>

        {experience.interpretation ? (
          <View
            style={styles.section}
          >
            <Text
              style={
                styles.sectionLabel
              }
            >
              PERSONAL REFLECTION
            </Text>

            <View
              style={
                styles.reflectionCard
              }
            >
              <Text
                style={
                  styles.reflectionText
                }
              >
                {
                  experience.interpretation
                }
              </Text>
            </View>
          </View>
        ) : null}

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
          style={styles.editButton}
          onPress={() =>
            router.push({
              pathname:
                "/experiences/edit/[id]",
              params: {
                id: experience.id,
              },
            })
          }
        >
          <Text
            style={styles.editText}
          >
            Edit{" "}
            {isDream
              ? "Dream"
              : "Synchronicity"}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.deleteButton,
            deleting &&
              styles.disabledButton,
          ]}
          onPress={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator
              color="#C27A91"
            />
          ) : (
            <Text
              style={
                styles.deleteText
              }
            >
              Delete{" "}
              {isDream
                ? "Dream"
                : "Synchronicity"}
            </Text>
          )}
        </Pressable>
      </ScrollView>
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
      paddingHorizontal: 26,
      paddingTop: 26,
      paddingBottom: 60,
    },

    backText: {
      color: "#B8A5DC",
      fontSize: 16,
      marginBottom: 30,
    },

    typeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    typeSymbol: {
      color: "#D4B866",
      fontSize: 20,
    },

    typeLabel: {
      color: "#917CB8",
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1.5,
    },

    date: {
      color: "#7D7488",
      fontSize: 13,
      marginTop: 18,
    },

    title: {
      color: "#F5EFFF",
      fontSize: 33,
      fontWeight: "700",
      marginTop: 7,
    },

    significanceWrap: {
      flexDirection: "row",
      marginTop: 16,
    },

    significanceChip: {
      color: "#C7B4E5",
      backgroundColor: "#211A35",
      borderWidth: 1,
      borderColor: "#352A50",
      borderRadius: 13,
      paddingHorizontal: 11,
      paddingVertical: 6,
      fontSize: 12,
    },

    section: {
      marginTop: 32,
    },

    sectionLabel: {
      color: "#9587A8",
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1.3,
      marginBottom: 12,
    },

    bodyText: {
      color: "#D4CCDF",
      fontSize: 17,
      lineHeight: 28,
    },

    reflectionCard: {
      backgroundColor: "#151126",
      borderWidth: 1,
      borderColor: "#29213D",
      borderRadius: 18,
      padding: 20,
    },

    reflectionText: {
      color: "#CFC3DD",
      fontSize: 16,
      lineHeight: 25,
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
      textAlign: "center",
      lineHeight: 20,
    },

    editButton: {
      backgroundColor: "#7357C7",
      borderRadius: 15,
      paddingVertical: 15,
      alignItems: "center",
      marginTop: 42,
    },

    editText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 16,
    },

    deleteButton: {
      alignItems: "center",
      paddingVertical: 15,
      marginTop: 10,
    },

    deleteText: {
      color: "#C27A91",
      fontWeight: "600",
    },

    disabledButton: {
      opacity: 0.6,
    },
  }); 