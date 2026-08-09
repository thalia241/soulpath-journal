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

import { supabase } from "../../src/lib/supabase";

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
  const [exporting, setExporting] =
    useState<ExportType>(null);

  const [deleting, setDeleting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  async function handleExport(
    type: Exclude<ExportType, null>
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
          ? "Your PDF export is ready."
          : type === "text"
            ? "Your text export is ready."
            : "Your JSON export is ready."
      );
    } catch (error) {
      console.error(
        "Export failed:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to export your data."
      );
    } finally {
      setExporting(null);
    }
  }

  function requestDeleteAllData() {
    if (Platform.OS === "web") {
      const confirmed =
        typeof window !== "undefined"
          ? window.confirm(
              "Delete all SoulPath content? This permanently removes your journal entries, spiritual practice history, dreams, and synchronicities. This cannot be undone."
            )
          : false;

      if (confirmed) {
        void deleteAllData();
      }

      return;
    }

    Alert.alert(
      "Delete all SoulPath content?",
      "This permanently removes your journal entries, spiritual practice history, dreams, and synchronicities. This cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete Everything",
          style: "destructive",
          onPress: () => {
            void deleteAllData();
          },
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
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "You must be signed in to delete your data."
        );
      }

      const {
        error: experienceError,
      } = await supabase
        .from("experiences")
        .delete()
        .eq("user_id", user.id);

      if (experienceError) {
        throw experienceError;
      }

      const {
        error: journalError,
      } = await supabase
        .from("journal_entries")
        .delete()
        .eq("user_id", user.id);

      if (journalError) {
        throw journalError;
      }

      setMessage(
        "Your journal entries, practice history, dreams, and synchronicities have been deleted."
      );
    } catch (error) {
      console.error(
        "Unable to delete SoulPath data:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete your data."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>
            ‹ Settings
          </Text>
        </Pressable>

        <Text style={styles.eyebrow}>
          DATA & EXPORT
        </Text>

        <Text style={styles.title}>
          Your data
        </Text>

        <Text style={styles.subtitle}>
          Export a portable copy of your SoulPath
          records or permanently clear the content
          stored for your account.
        </Text>

        <Text style={styles.sectionTitle}>
          Export
        </Text>

        <View style={styles.card}>
          <ExportRow
            title="PDF Journal"
            subtitle="Formatted journal, dreams, and signs"
            loading={exporting === "pdf"}
            disabled={exporting !== null || deleting}
            onPress={() => handleExport("pdf")}
          />

          <View style={styles.divider} />

          <ExportRow
            title="Plain Text"
            subtitle="Human-readable .txt copy"
            loading={exporting === "text"}
            disabled={exporting !== null || deleting}
            onPress={() => handleExport("text")}
          />

          <View style={styles.divider} />

          <ExportRow
            title="JSON Data"
            subtitle="Structured backup and portability"
            loading={exporting === "json"}
            disabled={exporting !== null || deleting}
            onPress={() => handleExport("json")}
          />
        </View>

        {message ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>
              {message}
            </Text>
          </View>
        ) : null}

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {errorMessage}
            </Text>
          </View>
        ) : null}

        <View style={styles.privacyCard}>
          <Text style={styles.privacySymbol}>
            ◌
          </Text>

          <View style={styles.privacyContent}>
            <Text style={styles.privacyTitle}>
              Exports can contain private material
            </Text>

            <Text style={styles.privacyText}>
              A downloaded export may contain journal
              writing, mood information, dreams, and
              other personal reflections. Store it
              somewhere you trust.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Danger zone
        </Text>

        <View style={styles.dangerCard}>
          <Text style={styles.dangerTitle}>
            Delete all SoulPath content
          </Text>

          <Text style={styles.dangerText}>
            Permanently delete journal entries,
            associated spiritual-practice history,
            dreams, and synchronicities.
          </Text>

          <Text style={styles.dangerNote}>
            Your login account and profile are not
            deleted by this action.
          </Text>

          <Pressable
            style={[
              styles.deleteButton,
              deleting && styles.disabledButton,
            ]}
            disabled={
              deleting || exporting !== null
            }
            onPress={requestDeleteAllData}
          >
            {deleting ? (
              <ActivityIndicator color="#F0B6C5" />
            ) : (
              <Text style={styles.deleteButtonText}>
                Delete All Content
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ExportRow({
  title,
  subtitle,
  loading,
  disabled,
  onPress,
}: {
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
        disabled && styles.disabledButton,
      ]}
      disabled={disabled}
      onPress={onPress}
    >
      <View style={styles.exportText}>
        <Text style={styles.exportTitle}>
          {title}
        </Text>

        <Text style={styles.exportSubtitle}>
          {subtitle}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#CDB9FF" />
      ) : (
        <Text style={styles.chevron}>
          ›
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C0A18",
  },

  content: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 60,
  },

  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    marginBottom: 20,
  },

  backText: {
    color: "#A78DE3",
    fontSize: 15,
    fontWeight: "600",
  },

  eyebrow: {
    color: "#8873B8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
  },

  title: {
    color: "#F5F0FF",
    fontSize: 34,
    fontWeight: "700",
    marginTop: 5,
  },

  subtitle: {
    color: "#8D859A",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 9,
    marginBottom: 30,
  },

  sectionTitle: {
    color: "#DED4E9",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#151126",
    borderWidth: 1,
    borderColor: "#29213D",
    borderRadius: 19,
    overflow: "hidden",
    marginBottom: 17,
  },

  exportRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },

  exportText: {
    flex: 1,
    paddingRight: 12,
  },

  exportTitle: {
    color: "#E8DEEF",
    fontSize: 15,
    fontWeight: "600",
  },

  exportSubtitle: {
    color: "#7E7489",
    fontSize: 11,
    marginTop: 4,
  },

  chevron: {
    color: "#917DAE",
    fontSize: 25,
  },

  divider: {
    height: 1,
    backgroundColor: "#29213D",
    marginLeft: 18,
  },

  disabledButton: {
    opacity: 0.55,
  },

  successBox: {
    backgroundColor: "#18241D",
    borderWidth: 1,
    borderColor: "#365141",
    borderRadius: 13,
    padding: 13,
    marginBottom: 15,
  },

  successText: {
    color: "#B7D5C1",
    fontSize: 12,
    lineHeight: 18,
  },

  errorBox: {
    backgroundColor: "#2A151E",
    borderWidth: 1,
    borderColor: "#683248",
    borderRadius: 13,
    padding: 13,
    marginBottom: 15,
  },

  errorText: {
    color: "#F1A7B9",
    fontSize: 12,
  },

  privacyCard: {
    backgroundColor: "#181329",
    borderWidth: 1,
    borderColor: "#34294D",
    borderRadius: 17,
    padding: 17,
    flexDirection: "row",
    marginBottom: 30,
  },

  privacySymbol: {
    color: "#D4B866",
    fontSize: 18,
    marginRight: 11,
  },

  privacyContent: {
    flex: 1,
  },

  privacyTitle: {
    color: "#CEC0DE",
    fontSize: 13,
    fontWeight: "700",
  },

  privacyText: {
    color: "#81778D",
    fontSize: 11,
    lineHeight: 18,
    marginTop: 5,
  },

  dangerCard: {
    backgroundColor: "#211218",
    borderWidth: 1,
    borderColor: "#5D2939",
    borderRadius: 19,
    padding: 20,
  },

  dangerTitle: {
    color: "#F0C0CD",
    fontSize: 17,
    fontWeight: "700",
  },

  dangerText: {
    color: "#B58D99",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
  },

  dangerNote: {
    color: "#80646D",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 8,
  },

  deleteButton: {
    borderWidth: 1,
    borderColor: "#8B4055",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 18,
  },

  deleteButtonText: {
    color: "#F0B6C5",
    fontWeight: "700",
  },
}); 