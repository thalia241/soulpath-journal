import { router } from "expo-router";

import {
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

import SoulCard from "../../src/components/SoulCard";
import FeedbackMessage from "../../src/components/FeedbackMessage";

import {
  colors,
  fonts,
  radius,
} from "../../src/theme";

import {
  supabase,
} from "../../src/lib/supabase";

import {
  exportSoulPathJson,
  exportSoulPathPdf,
  exportSoulPathText,
} from "../../src/services/exportService";

type ExportType =
  | "pdf"
  | "text"
  | "json"
  | null;

export default function DataSettingsScreen() {
  const [
    exporting,
    setExporting,
  ] = useState<ExportType>(
    null
  );

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  async function handleExport(
    type: Exclude<
      ExportType,
      null
    >
  ) {
    try {
      setExporting(type);
      setMessage("");
      setErrorMessage("");

      if (type === "pdf") {
        await exportSoulPathPdf();
      }

      if (type === "text") {
        await exportSoulPathText();
      }

      if (type === "json") {
        await exportSoulPathJson();
      }

      setMessage(
        type === "pdf"
          ? "Your PDF is ready."
          : type === "text"
            ? "Your text copy is ready."
            : "Your JSON copy is ready."
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to export your data."
      );
    } finally {
      setExporting(null);
    }
  }

  function requestDelete() {
    const message =
      "This permanently removes your reflections, practice history, dreams, and synchronicities. This cannot be undone.";

    if (
      Platform.OS === "web"
    ) {
      const confirmed =
        typeof window !==
          "undefined" &&
        window.confirm(
          `Delete all SoulPath content?\n\n${message}`
        );

      if (confirmed) {
        void deleteAllData();
      }

      return;
    }

    Alert.alert(
      "Delete all SoulPath content?",
      message,
      [
        {
          text: "Keep My Data",
          style: "cancel",
        },
        {
          text: "Delete Everything",
          style: "destructive",
          onPress: () =>
            void deleteAllData(),
        },
      ]
    );
  }

  async function deleteAllData() {
    try {
      setDeleting(true);
      setMessage("");
      setErrorMessage("");

      const {
        data: { user },
        error,
      } =
        await supabase.auth.getUser();

      if (error || !user) {
        throw new Error(
          "Your session could not be found."
        );
      }

      const {
        error: experienceError,
      } = await supabase
        .from("experiences")
        .delete()
        .eq(
          "user_id",
          user.id
        );

      if (experienceError) {
        throw experienceError;
      }

      const {
        error: journalError,
      } = await supabase
        .from("journal_entries")
        .delete()
        .eq(
          "user_id",
          user.id
        );

      if (journalError) {
        throw journalError;
      }

      setMessage(
        "Your SoulPath content has been cleared."
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to clear your data."
      );
    } finally {
      setDeleting(false);
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
      >
        <Pressable
          style={styles.back}
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={styles.backText}
          >
            ‹ Settings
          </Text>
        </Pressable>

        <Text
          style={styles.title}
        >
          Your Data
        </Text>

        <Text
          style={styles.subtitle}
        >
          What you write here should
          never feel trapped here.
        </Text>

        <Text
          style={
            styles.sectionTitle
          }
        >
          Take your path with you
        </Text>

        <SoulCard
          style={{ padding: 0 }}
        >
          <ExportRow
            symbol="☾"
            title="PDF Journal"
            subtitle="A beautifully formatted copy for reading"
            loading={
              exporting === "pdf"
            }
            disabled={
              exporting !== null ||
              deleting
            }
            onPress={() =>
              handleExport("pdf")
            }
          />

          <View
            style={styles.divider}
          />

          <ExportRow
            symbol="✎"
            title="Plain Text"
            subtitle="Simple and readable anywhere"
            loading={
              exporting === "text"
            }
            disabled={
              exporting !== null ||
              deleting
            }
            onPress={() =>
              handleExport("text")
            }
          />

          <View
            style={styles.divider}
          />

          <ExportRow
            symbol="✦"
            title="JSON Data"
            subtitle="A structured portable copy"
            loading={
              exporting === "json"
            }
            disabled={
              exporting !== null ||
              deleting
            }
            onPress={() =>
              handleExport("json")
            }
          />
        </SoulCard>

        {message ? (
          <FeedbackMessage
            message={message}
          />
        ) : null}

        {errorMessage ? (
          <FeedbackMessage
            type="error"
            message={
              errorMessage
            }
          />
        ) : null}

        <SoulCard
          style={
            styles.privacyCard
          }
        >
          <Text
            style={
              styles.privacySymbol
            }
          >
            ◌
          </Text>

          <Text
            style={
              styles.privacyTitle
            }
          >
            Keep exported pages
            somewhere safe.
          </Text>

          <Text
            style={
              styles.privacyText
            }
          >
            An export can contain
            thoughts, moods, dreams,
            spiritual practices, and
            personal reflections that
            you may not want others to
            read.
          </Text>
        </SoulCard>

        <Text
          style={
            styles.sectionTitle
          }
        >
          Letting go
        </Text>

        <View
          style={styles.dangerCard}
        >
          <Text
            style={
              styles.dangerSymbol
            }
          >
            ☾
          </Text>

          <Text
            style={
              styles.dangerTitle
            }
          >
            Clear your SoulPath
            content
          </Text>

          <Text
            style={
              styles.dangerText
            }
          >
            This permanently removes
            journal entries, associated
            practice history, dreams,
            and synchronicities.
          </Text>

          <Text
            style={
              styles.dangerNote
            }
          >
            Your login and profile will
            remain.
          </Text>

          <Pressable
            style={[
              styles.deleteButton,
              deleting &&
                styles.disabled,
            ]}
            disabled={
              deleting ||
              exporting !== null
            }
            onPress={
              requestDelete
            }
          >
            {deleting ? (
              <ActivityIndicator
                color={
                  colors.errorText
                }
              />
            ) : (
              <Text
                style={
                  styles.deleteText
                }
              >
                Delete all content
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ExportRow({
  symbol,
  title,
  subtitle,
  loading,
  disabled,
  onPress,
}: {
  symbol: string;
  title: string;
  subtitle: string;
  loading: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.exportRow,
        disabled &&
          styles.disabled,
      ]}
      disabled={disabled}
      onPress={onPress}
    >
      <Text
        style={
          styles.exportSymbol
        }
      >
        {symbol}
      </Text>

      <View
        style={{ flex: 1 }}
      >
        <Text
          style={
            styles.exportTitle
          }
        >
          {title}
        </Text>

        <Text
          style={
            styles.exportSubtitle
          }
        >
          {subtitle}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          color={
            colors.lavender
          }
        />
      ) : (
        <Text
          style={styles.chevron}
        >
          ›
        </Text>
      )}
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
      maxWidth: 650,
      alignSelf: "center",
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 60,
      gap: 15,
    },

    back: {
      alignSelf: "flex-start",
      paddingVertical: 8,
    },

    backText: {
      color: colors.lavender,
      fontFamily:
        fonts.bodySemiBold,
      fontSize: 12,
    },

    title: {
      color: colors.text,
      fontFamily: fonts.display,
      fontSize: 39,
      marginTop: 5,
    },

    subtitle: {
      color:
        colors.textMuted,
      fontFamily:
        fonts.displayItalic,
      fontSize: 17,
      lineHeight: 23,
      marginBottom: 12,
    },

    sectionTitle: {
      color: colors.textSoft,
      fontFamily: fonts.display,
      fontSize: 21,
      marginTop: 10,
    },

    exportRow: {
      minHeight: 76,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 18,
      paddingVertical: 14,
    },

    exportSymbol: {
      color: colors.gold,
      width: 30,
      fontSize: 16,
    },

    exportTitle: {
      color: colors.textSoft,
      fontFamily:
        fonts.bodySemiBold,
      fontSize: 13,
    },

    exportSubtitle: {
      color: colors.textDim,
      fontFamily: fonts.body,
      fontSize: 10,
      marginTop: 3,
    },

    chevron: {
      color: colors.lavender,
      fontSize: 23,
    },

    divider: {
      height: 1,
      backgroundColor:
        colors.border,
      marginLeft: 48,
    },

    disabled: {
      opacity: 0.5,
    },

    privacyCard: {
      marginTop: 3,
    },

    privacySymbol: {
      color: colors.gold,
      fontSize: 17,
    },

    privacyTitle: {
      color: colors.text,
      fontFamily:
        fonts.displayItalic,
      fontSize: 21,
      marginTop: 6,
    },

    privacyText: {
      color:
        colors.textMuted,
      fontFamily: fonts.body,
      fontSize: 11,
      lineHeight: 18,
      marginTop: 6,
    },

    dangerCard: {
      backgroundColor:
        colors.errorBackground,
      borderWidth: 1,
      borderColor:
        colors.errorBorder,
      borderRadius:
        radius.xl,
      padding: 21,
    },

    dangerSymbol: {
      color: colors.danger,
      fontSize: 18,
    },

    dangerTitle: {
      color:
        colors.errorText,
      fontFamily: fonts.display,
      fontSize: 24,
      marginTop: 7,
    },

    dangerText: {
      color: "#B58D99",
      fontFamily: fonts.body,
      fontSize: 11,
      lineHeight: 18,
      marginTop: 6,
    },

    dangerNote: {
      color: "#80646D",
      fontFamily: fonts.body,
      fontSize: 10,
      marginTop: 7,
    },

    deleteButton: {
      borderWidth: 1,
      borderColor:
        colors.errorBorder,
      borderRadius:
        radius.md,
      paddingVertical: 13,
      alignItems: "center",
      marginTop: 18,
    },

    deleteText: {
      color:
        colors.errorText,
      fontFamily:
        fonts.bodySemiBold,
      fontSize: 12,
    },
  }); 