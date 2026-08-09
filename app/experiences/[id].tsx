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
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import SoulButton from "../../src/components/SoulButton";
import SoulCard from "../../src/components/SoulCard";
import FeedbackMessage from "../../src/components/FeedbackMessage";

import {
  colors,
  fonts,
  radius,
} from "../../src/theme";

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

  const [
    experience,
    setExperience,
  ] =
    useState<Experience | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

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

        const data =
          await getExperience(id);

        setExperience(data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to open this memory."
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

  function requestDelete() {
    const warning =
      "This memory will be permanently removed.";

    if (
      Platform.OS === "web"
    ) {
      if (
        typeof window !==
          "undefined" &&
        window.confirm(
          `Let this memory go?\n\n${warning}`
        )
      ) {
        void removeExperience();
      }

      return;
    }

    Alert.alert(
      "Let this memory go?",
      warning,
      [
        {
          text: "Keep It",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            void removeExperience(),
        },
      ]
    );
  }

  async function removeExperience() {
    if (!id) {
      return;
    }

    try {
      setDeleting(true);

      await deleteExperience(id);

      router.replace(
        "/experiences"
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete this memory."
      );
    } finally {
      setDeleting(false);
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

        <Text
          style={styles.loadingText}
        >
          Returning to this memory...
        </Text>
      </SafeAreaView>
    );
  }

  if (!experience) {
    return (
      <SafeAreaView
        style={styles.centered}
      >
        <Text
          style={styles.missingTitle}
        >
          This memory couldn't be found.
        </Text>

        {errorMessage ? (
          <FeedbackMessage
            type="error"
            message={errorMessage}
          />
        ) : null}
      </SafeAreaView>
    );
  }

  const dream =
    experience.experience_type ===
    "dream";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={styles.back}
          onPress={() =>
            router.back()
          }
        >
          <Text style={styles.backText}>
            ‹ Dreams & Signs
          </Text>
        </Pressable>

        <Text style={styles.symbol}>
          {dream ? "☾" : "✦"}
        </Text>

        <Text style={styles.type}>
          {dream
            ? "A dream remembered"
            : "A synchronicity noticed"}
        </Text>

        <Text style={styles.title}>
          {experience.title}
        </Text>

        <Text style={styles.date}>
          {new Date(
            experience.experienced_at
          ).toLocaleString()}
        </Text>

        {experience.significance_level ? (
          <View style={styles.significance}>
            <Text
              style={styles.significanceText}
            >
              ✦ Stayed with you{" "}
              {experience.significance_level}/5
            </Text>
          </View>
        ) : null}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>
          What happened
        </Text>

        <Text style={styles.body}>
          {experience.description}
        </Text>

        {experience.interpretation ? (
          <SoulCard
            style={styles.reflectionCard}
          >
            <Text
              style={styles.reflectionSymbol}
            >
              ✦
            </Text>

            <Text
              style={styles.reflectionTitle}
            >
              What it brought up for you
            </Text>

            <Text
              style={styles.reflectionText}
            >
              {experience.interpretation}
            </Text>
          </SoulCard>
        ) : null}

        {errorMessage ? (
          <FeedbackMessage
            type="error"
            message={errorMessage}
          />
        ) : null}

        <View style={styles.actions}>
          <SoulButton
            title="Return to this memory"
            onPress={() =>
              router.push({
                pathname:
                  "/experiences/edit/[id]",
                params: {
                  id: experience.id,
                },
              })
            }
          />

          <SoulButton
            title="Let this memory go"
            variant="danger"
            loading={deleting}
            onPress={requestDelete}
          />
        </View>
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
    alignItems: "center",
    gap: 15,
    padding: 28,
  },

  content: {
    width: "100%",
    maxWidth: 690,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 65,
  },

  back: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    marginBottom: 26,
  },

  backText: {
    color: colors.lavender,
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
  },

  symbol: {
    color: colors.gold,
    fontSize: 25,
  },

  type: {
    color: colors.lavender,
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    marginTop: 8,
  },

  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 41,
    lineHeight: 45,
    marginTop: 5,
  },

  date: {
    color: colors.textDim,
    fontFamily: fonts.body,
    fontSize: 10,
    marginTop: 7,
  },

  significance: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 6,
    marginTop: 14,
  },

  significanceText: {
    color: colors.goldSoft,
    fontFamily: fonts.body,
    fontSize: 10,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 29,
  },

  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 23,
  },

  body: {
    color: colors.textSoft,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 24,
    marginTop: 8,
  },

  reflectionCard: {
    backgroundColor: "#18122B",
    borderColor: colors.borderStrong,
    marginTop: 30,
  },

  reflectionSymbol: {
    color: colors.gold,
    fontSize: 16,
  },

  reflectionTitle: {
    color: colors.text,
    fontFamily: fonts.displayItalic,
    fontSize: 22,
    marginTop: 7,
  },

  reflectionText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 20,
    marginTop: 8,
  },

  actions: {
    gap: 10,
    marginTop: 28,
  },

  loadingText: {
    color: colors.textDim,
    fontFamily: fonts.body,
    fontSize: 11,
  },

  missingTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 27,
    textAlign: "center",
  },
}); 