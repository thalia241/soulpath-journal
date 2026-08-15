import {
  router,
} from "expo-router";

import {
  useState,
} from "react";

import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import SoulButton from "../../src/components/SoulButton";
import SoulCard from "../../src/components/SoulCard";
import SoulScreen from "../../src/components/SoulScreen";
import FeedbackMessage from "../../src/components/FeedbackMessage";

import {
  colors,
  fonts,
} from "../../src/theme";

import {
  exportSoulPathJson,
  exportSoulPathPdf,
  exportSoulPathText,
  SoulPathExportFormat,
  SoulPathExportSummary,
} from "../../src/services/exportService";

import {
  supabase,
} from "../../src/lib/supabase";

type ExportState =
  | SoulPathExportFormat
  | null;

export default function DataSettingsScreen() {
  const [
    exporting,
    setExporting,
  ] =
    useState<ExportState>(
      null
    );

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  function formatSuccess(
    format:
      SoulPathExportFormat,
    summary:
      SoulPathExportSummary
  ) {
    const formatLabel =
      format.toUpperCase();

    return `${formatLabel} export prepared with ${summary.journalEntries} reflections and ${summary.experiences} dreams/signs.`;
  }

  async function runExport(
    format:
      SoulPathExportFormat
  ) {
    if (
      exporting ||
      deleting
    ) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      setExporting(
        format
      );

      let summary:
        SoulPathExportSummary;

      if (
        format === "pdf"
      ) {
        summary =
          await exportSoulPathPdf();
      } else if (
        format === "txt"
      ) {
        summary =
          await exportSoulPathText();
      } else {
        summary =
          await exportSoulPathJson();
      }

      setSuccessMessage(
        formatSuccess(
          format,
          summary
        )
      );
    } catch (error) {
      console.error(
        `Unable to export SoulPath ${format}:`,
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "SoulPath couldn't prepare your export."
      );
    } finally {
      setExporting(
        null
      );
    }
  }

  function confirmDeleteContent() {
    if (
      exporting ||
      deleting
    ) {
      return;
    }

    const message =
      "This permanently removes your journal reflections, dreams, signs, and journal-practice links. Your login and profile will remain.";

    if (
      Platform.OS ===
      "web"
    ) {
      const confirmed =
        typeof window !==
          "undefined" &&
        window.confirm(
          `Let your recorded path go?\n\n${message}`
        );

      if (confirmed) {
        void deleteAllContent();
      }

      return;
    }

    Alert.alert(
      "Let your recorded path go?",
      message,
      [
        {
          text: "Keep My Data",
          style: "cancel",
        },
        {
          text:
            "Delete My Content",

          style:
            "destructive",

          onPress: () =>
            void deleteAllContent(),
        },
      ]
    );
  }

  async function deleteAllContent() {
    if (
      deleting ||
      exporting
    ) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      setDeleting(true);

      const {
        data: {
          user,
        },
        error:
          userError,
      } =
        await supabase.auth.getUser();

      if (
        userError ||
        !user
      ) {
        throw new Error(
          "Your SoulPath session has ended. Please sign in again."
        );
      }

      /*
       * Delete the child relationship first so the
       * operation works even if cascading deletes are
       * not configured on this database.
       */
      const {
        error:
          entryPracticeError,
      } = await supabase
        .from(
          "entry_practices"
        )
        .delete()
        .eq(
          "user_id",
          user.id
        );

      if (
        entryPracticeError
      ) {
        throw entryPracticeError;
      }

      const {
        error:
          experienceError,
      } = await supabase
        .from(
          "experiences"
        )
        .delete()
        .eq(
          "user_id",
          user.id
        );

      if (
        experienceError
      ) {
        throw experienceError;
      }

      const {
        error:
          journalError,
      } = await supabase
        .from(
          "journal_entries"
        )
        .delete()
        .eq(
          "user_id",
          user.id
        );

      if (
        journalError
      ) {
        throw journalError;
      }

      setSuccessMessage(
        "Your journal, dreams, signs, and recorded practice links have been removed. Your SoulPath account remains active."
      );
    } catch (error) {
      console.error(
        "Unable to delete SoulPath content:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "SoulPath couldn't remove all of your content."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <SoulScreen
      contentStyle={
        styles.content
      }
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to settings"
        style={styles.back}
        disabled={
          Boolean(
            exporting
          ) ||
          deleting
        }
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
        style={styles.symbol}
      >
        ✦
      </Text>

      <Text
        style={styles.title}
      >
        Your data
      </Text>

      <Text
        style={styles.subtitle}
      >
        What you record here should
        never feel trapped here.
      </Text>

      <SoulCard
        style={styles.introCard}
      >
        <Text
          style={
            styles.cardTitle
          }
        >
          Take your SoulPath with
          you
        </Text>

        <Text
          style={
            styles.cardText
          }
        >
          Export your reflections,
          dreams, signs, mood and
          energy records, and linked
          spiritual practices in a
          format that works for what
          you need next.
        </Text>
      </SoulCard>

      <Text
        style={
          styles.sectionTitle
        }
      >
        Choose a format
      </Text>

      <ExportCard
        symbol="◫"
        title="PDF"
        description="A polished, readable copy of your SoulPath for printing, archiving, or keeping as a personal journal."
        note={
          Platform.OS ===
          "web"
            ? "Your browser will open its print dialog. Choose Save as PDF."
            : "Your device will create a PDF and open the share sheet."
        }
      >
        <SoulButton
          title="Export as PDF"
          loading={
            exporting ===
            "pdf"
          }
          disabled={
            exporting !==
              null ||
            deleting
          }
          onPress={() =>
            void runExport(
              "pdf"
            )
          }
        />
      </ExportCard>

      <ExportCard
        symbol="≡"
        title="Plain text"
        description="A simple human-readable copy that can be opened by almost any text editor."
        note="Best when you want a lightweight backup or want to move your writing somewhere else."
      >
        <SoulButton
          title="Export as text"
          variant="secondary"
          loading={
            exporting ===
            "txt"
          }
          disabled={
            exporting !==
              null ||
            deleting
          }
          onPress={() =>
            void runExport(
              "txt"
            )
          }
        />
      </ExportCard>

      <ExportCard
        symbol="{ }"
        title="JSON"
        description="A structured copy of your SoulPath data designed for portability, backup, and future import tools."
        note="Includes export schema version 1. It does not include your password, session token, or Supabase authentication secrets."
      >
        <SoulButton
          title="Export structured data"
          variant="secondary"
          loading={
            exporting ===
            "json"
          }
          disabled={
            exporting !==
              null ||
            deleting
          }
          onPress={() =>
            void runExport(
              "json"
            )
          }
        />
      </ExportCard>

      {errorMessage ? (
        <View
          style={
            styles.feedbackArea
          }
        >
          <FeedbackMessage
            type="error"
            message={
              errorMessage
            }
          />
        </View>
      ) : null}

      {successMessage ? (
        <View
          style={
            styles.feedbackArea
          }
        >
          <FeedbackMessage
            message={
              successMessage
            }
          />
        </View>
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
          ☾
        </Text>

        <Text
          style={
            styles.privacyTitle
          }
        >
          What's included?
        </Text>

        <Text
          style={
            styles.cardText
          }
        >
          Your export includes your
          display name and email,
          journal entries, mood and
          energy values, associated
          practices, dreams,
          synchronicities, personal
          reflections, and recorded
          significance levels.
        </Text>

        <Text
          style={
            styles.privacyNote
          }
        >
          Passwords, refresh tokens,
          access tokens, database
          credentials, and application
          secrets are never included.
        </Text>
      </SoulCard>

      <View
        style={styles.divider}
      />

      <Text
        style={
          styles.dangerEyebrow
        }
      >
        LETTING GO
      </Text>

      <Text
        style={
          styles.dangerTitle
        }
      >
        Delete your recorded content
      </Text>

      <Text
        style={
          styles.dangerText
        }
      >
        This removes your journal
        reflections, dreams, signs,
        and journal-practice links
        while keeping your SoulPath
        login and profile.
      </Text>

      <View
        style={
          styles.dangerAction
        }
      >
        <SoulButton
          title="Delete all of my content"
          variant="danger"
          loading={deleting}
          disabled={
            deleting ||
            exporting !==
              null
          }
          onPress={
            confirmDeleteContent
          }
        />
      </View>

      <Text
        style={
          styles.deleteNote
        }
      >
        This action cannot be undone.
        Export a backup first if you
        may want these records later.
      </Text>
    </SoulScreen>
  );
}

function ExportCard({
  symbol,
  title,
  description,
  note,
  children,
}: {
  symbol: string;

  title: string;

  description: string;

  note: string;

  children:
    React.ReactNode;
}) {
  return (
    <SoulCard
      style={
        styles.exportCard
      }
    >
      <View
        style={
          styles.exportHeader
        }
      >
        <Text
          style={
            styles.exportSymbol
          }
        >
          {symbol}
        </Text>

        <View
          style={
            styles.exportHeaderText
          }
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
              styles.exportDescription
            }
          >
            {description}
          </Text>
        </View>
      </View>

      <Text
        style={
          styles.exportNote
        }
      >
        {note}
      </Text>

      <View
        style={
          styles.exportAction
        }
      >
        {children}
      </View>
    </SoulCard>
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

    symbol: {
      color:
        colors.gold,

      fontSize: 22,

      marginTop: 20,
    },

    title: {
      color:
        colors.text,

      fontFamily:
        fonts.display,

      fontSize: 39,

      lineHeight: 43,

      marginTop: 7,
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

    introCard: {
      backgroundColor:
        colors.surfaceRaised,

      borderColor:
        colors.borderStrong,

      marginBottom: 30,
    },

    cardTitle: {
      color:
        colors.text,

      fontFamily:
        fonts.display,

      fontSize: 23,

      lineHeight: 27,
    },

    cardText: {
      color:
        colors.textMuted,

      fontFamily:
        fonts.body,

      fontSize: 12,

      lineHeight: 19,

      marginTop: 7,
    },

    sectionTitle: {
      color:
        colors.textSoft,

      fontFamily:
        fonts.display,

      fontSize: 22,

      marginBottom: 12,
    },

    exportCard: {
      marginBottom: 12,
    },

    exportHeader: {
      flexDirection:
        "row",

      gap: 13,
    },

    exportSymbol: {
      width: 32,

      color:
        colors.gold,

      fontFamily:
        fonts.display,

      fontSize: 23,
    },

    exportHeaderText: {
      flex: 1,
    },

    exportTitle: {
      color:
        colors.text,

      fontFamily:
        fonts.display,

      fontSize: 22,
    },

    exportDescription: {
      color:
        colors.textMuted,

      fontFamily:
        fonts.body,

      fontSize: 11,

      lineHeight: 18,

      marginTop: 4,
    },

    exportNote: {
      color:
        colors.textDim,

      fontFamily:
        fonts.body,

      fontSize: 10,

      lineHeight: 16,

      marginTop: 13,
    },

    exportAction: {
      marginTop: 17,
    },

    feedbackArea: {
      marginTop: 4,

      marginBottom: 12,
    },

    privacyCard: {
      marginTop: 16,

      backgroundColor:
        "#18122B",

      borderColor:
        colors.borderStrong,
    },

    privacySymbol: {
      color:
        colors.gold,

      fontSize: 18,
    },

    privacyTitle: {
      color:
        colors.text,

      fontFamily:
        fonts.display,

      fontSize: 22,

      marginTop: 6,
    },

    privacyNote: {
      color:
        colors.goldSoft,

      fontFamily:
        fonts.body,

      fontSize: 10,

      lineHeight: 16,

      marginTop: 13,
    },

    divider: {
      height: 1,

      backgroundColor:
        colors.border,

      marginVertical: 34,
    },

    dangerEyebrow: {
      color:
        colors.danger,

      fontFamily:
        fonts.bodyBold,

      fontSize: 9,

      letterSpacing: 1.2,
    },

    dangerTitle: {
      color:
        colors.text,

      fontFamily:
        fonts.display,

      fontSize: 24,

      marginTop: 6,
    },

    dangerText: {
      color:
        colors.textMuted,

      fontFamily:
        fonts.body,

      fontSize: 12,

      lineHeight: 19,

      marginTop: 7,
    },

    dangerAction: {
      marginTop: 18,
    },

    deleteNote: {
      color:
        colors.textDim,

      fontFamily:
        fonts.body,

      fontSize: 9,

      lineHeight: 15,

      textAlign:
        "center",

      marginTop: 10,
    },
  }); 