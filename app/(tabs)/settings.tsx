import { router } from "expo-router";

import {
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
  useAuth,
} from "../../src/context/AuthContext";

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

export default function SettingsScreen() {
  const { session } =
    useAuth();

  const displayName =
    session?.user
      .user_metadata
      ?.display_name ||
    "Traveler";

  const email =
    session?.user.email ||
    "";

  const [
    exporting,
    setExporting,
  ] =
    useState<ExportType>(
      null
    );

  const [
    exportMessage,
    setExportMessage,
  ] = useState("");

  const [
    exportError,
    setExportError,
  ] = useState("");

  async function handleExport(
    type: Exclude<
      ExportType,
      null
    >
  ) {
    try {
      setExportError("");

      setExportMessage("");

      setExporting(type);

      if (
        type === "pdf"
      ) {
        await exportSoulPathPdf();
      }

      if (
        type === "text"
      ) {
        await exportSoulPathText();
      }

      if (
        type === "json"
      ) {
        await exportSoulPathJson();
      }

      if (
        type === "pdf"
      ) {
        setExportMessage(
          "Your PDF export has been opened."
        );
      }

      if (
        type === "text"
      ) {
        setExportMessage(
          "Your text export is ready."
        );
      }

      if (
        type === "json"
      ) {
        setExportMessage(
          "Your JSON export is ready."
        );
      }
    } catch (error) {
      console.error(
        "Unable to export SoulPath data:",
        error
      );

      setExportError(
        error instanceof Error
          ? error.message
          : "Unable to export your SoulPath data."
      );
    } finally {
      setExporting(null);
    }
  }

  async function handleLogout() {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "Unable to sign out:",
        error
      );

      return;
    }

    router.replace("/");
  }

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
        <Text
          style={styles.eyebrow}
        >
          YOUR SPACE
        </Text>

        <Text
          style={styles.title}
        >
          Settings
        </Text>

        <View
          style={styles.profileCard}
        >
          <View
            style={styles.avatar}
          >
            <Text
              style={
                styles.avatarText
              }
            >
              ☾
            </Text>
          </View>

          <View
            style={
              styles.profileInfo
            }
          >
            <Text
              style={styles.name}
            >
              {displayName}
            </Text>

            <Text
              style={styles.email}
            >
              {email}
            </Text>
          </View>
        </View>

        <Text
          style={
            styles.sectionTitle
          }
        >
          Account
        </Text>

        <View
          style={
            styles.settingsGroup
          }
        >
          <View
            style={
              styles.settingsRow
            }
          >
            <View
              style={
                styles.rowContent
              }
            >
              <Text
                style={
                  styles.rowTitle
                }
              >
                Profile
              </Text>

              <Text
                style={
                  styles.rowSubtitle
                }
              >
                Name and account information
              </Text>
            </View>

            <Text
              style={
                styles.chevron
              }
            >
              ›
            </Text>
          </View>

          <View
            style={styles.divider}
          />

          <View
            style={
              styles.settingsRow
            }
          >
            <View
              style={
                styles.rowContent
              }
            >
              <Text
                style={
                  styles.rowTitle
                }
              >
                Privacy
              </Text>

              <Text
                style={
                  styles.rowSubtitle
                }
              >
                Your reflections are connected to your authenticated account
              </Text>
            </View>

            <Text
              style={
                styles.chevron
              }
            >
              ›
            </Text>
          </View>
        </View>

        <Text
          style={
            styles.sectionTitle
          }
        >
          Your data
        </Text>

        <View
          style={
            styles.exportCard
          }
        >
          <View
            style={
              styles.exportHeader
            }
          >
            <View
              style={
                styles.exportIcon
              }
            >
              <Text
                style={
                  styles.exportIconText
                }
              >
                ⇩
              </Text>
            </View>

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
                Export SoulPath
              </Text>

              <Text
                style={
                  styles.exportDescription
                }
              >
                Take a copy of your reflections, dreams, synchronicities, moods, energy, and practices.
              </Text>
            </View>
          </View>

          <Pressable
            style={[
              styles.exportButton,

              exporting !==
                null &&
                styles.disabledButton,
            ]}
            disabled={
              exporting !== null
            }
            onPress={() =>
              handleExport(
                "pdf"
              )
            }
          >
            <View
              style={
                styles.exportButtonContent
              }
            >
              <Text
                style={
                  styles.exportButtonTitle
                }
              >
                PDF Journal
              </Text>

              <Text
                style={
                  styles.exportButtonSubtitle
                }
              >
                A polished, human-readable SoulPath document
              </Text>
            </View>

            {exporting ===
            "pdf" ? (
              <ActivityIndicator
                color="#CDB9FF"
              />
            ) : (
              <Text
                style={
                  styles.exportArrow
                }
              >
                ›
              </Text>
            )}
          </Pressable>

          <View
            style={
              styles.exportDivider
            }
          />

          <Pressable
            style={[
              styles.exportButton,

              exporting !==
                null &&
                styles.disabledButton,
            ]}
            disabled={
              exporting !== null
            }
            onPress={() =>
              handleExport(
                "text"
              )
            }
          >
            <View
              style={
                styles.exportButtonContent
              }
            >
              <Text
                style={
                  styles.exportButtonTitle
                }
              >
                Plain Text
              </Text>

              <Text
                style={
                  styles.exportButtonSubtitle
                }
              >
                Easy to read or open in almost any editor
              </Text>
            </View>

            {exporting ===
            "text" ? (
              <ActivityIndicator
                color="#CDB9FF"
              />
            ) : (
              <Text
                style={
                  styles.exportArrow
                }
              >
                ›
              </Text>
            )}
          </Pressable>

          <View
            style={
              styles.exportDivider
            }
          />

          <Pressable
            style={[
              styles.exportButton,

              exporting !==
                null &&
                styles.disabledButton,
            ]}
            disabled={
              exporting !== null
            }
            onPress={() =>
              handleExport(
                "json"
              )
            }
          >
            <View
              style={
                styles.exportButtonContent
              }
            >
              <Text
                style={
                  styles.exportButtonTitle
                }
              >
                JSON Data
              </Text>

              <Text
                style={
                  styles.exportButtonSubtitle
                }
              >
                Structured data for backup or portability
              </Text>
            </View>

            {exporting ===
            "json" ? (
              <ActivityIndicator
                color="#CDB9FF"
              />
            ) : (
              <Text
                style={
                  styles.exportArrow
                }
              >
                ›
              </Text>
            )}
          </Pressable>
        </View>

        {exportError ? (
          <View
            style={
              styles.errorBox
            }
          >
            <Text
              style={
                styles.errorText
              }
            >
              {exportError}
            </Text>
          </View>
        ) : null}

        {exportMessage ? (
          <View
            style={
              styles.successBox
            }
          >
            <Text
              style={
                styles.successText
              }
            >
              {exportMessage}
            </Text>
          </View>
        ) : null}

        <View
          style={
            styles.platformNote
          }
        >
          <Text
            style={
              styles.platformNoteSymbol
            }
          >
            ✦
          </Text>

          <View
            style={{ flex: 1 }}
          >
            <Text
              style={
                styles.platformNoteTitle
              }
            >
              Export behavior
            </Text>

            <Text
              style={
                styles.platformNoteText
              }
            >
              On mobile, SoulPath can open your device's share and save options. In the browser, PDF uses the browser print window so you can choose Save as PDF, while text and JSON files download directly.
            </Text>
          </View>
        </View>

        <View
          style={
            styles.privacyNotice
          }
        >
          <Text
            style={
              styles.privacySymbol
            }
          >
            ◌
          </Text>

          <View
            style={
              styles.privacyContent
            }
          >
            <Text
              style={
                styles.privacyTitle
              }
            >
              Your export may contain sensitive personal reflections
            </Text>

            <Text
              style={
                styles.privacyText
              }
            >
              Store exported files somewhere you trust. Anyone with access to an exported file may be able to read its contents.
            </Text>
          </View>
        </View>

        <Text
          style={
            styles.sectionTitle
          }
        >
          SoulPath
        </Text>

        <View
          style={
            styles.settingsGroup
          }
        >
          <View
            style={
              styles.settingsRow
            }
          >
            <View
              style={
                styles.rowContent
              }
            >
              <Text
                style={
                  styles.rowTitle
                }
              >
                About SoulPath
              </Text>

              <Text
                style={
                  styles.rowSubtitle
                }
              >
                App information and disclaimer
              </Text>
            </View>

            <Text
              style={
                styles.chevron
              }
            >
              ›
            </Text>
          </View>
        </View>

        <View
          style={
            styles.disclaimerCard
          }
        >
          <Text
            style={
              styles.disclaimerTitle
            }
          >
            Personal reflection
          </Text>

          <Text
            style={
              styles.disclaimerText
            }
          >
            SoulPath is designed for private personal reflection and wellness tracking. It does not provide medical, psychological, divinatory, or other professional advice.
          </Text>
        </View>

        <Pressable
          style={
            styles.signOutButton
          }
          onPress={
            handleLogout
          }
        >
          <Text
            style={
              styles.signOutText
            }
          >
            Sign Out
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#0C0A18",
    },

    content: {
      width: "100%",
      maxWidth: 720,
      alignSelf: "center",
      paddingHorizontal: 24,
      paddingTop: 32,
      paddingBottom: 110,
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
      marginBottom: 26,
    },

    profileCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#151126",
      borderWidth: 1,
      borderColor:
        "#29213D",
      borderRadius: 20,
      padding: 20,
      marginBottom: 30,
    },

    avatar: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor:
        "#211A35",
      justifyContent:
        "center",
      alignItems: "center",
    },

    avatarText: {
      color: "#D9C6FF",
      fontSize: 26,
    },

    profileInfo: {
      marginLeft: 15,
      flex: 1,
    },

    name: {
      color: "#EEE7F8",
      fontSize: 18,
      fontWeight: "700",
    },

    email: {
      color: "#847B91",
      fontSize: 13,
      marginTop: 4,
    },

    sectionTitle: {
      color: "#DCD2EA",
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 10,
    },

    settingsGroup: {
      backgroundColor:
        "#151126",
      borderWidth: 1,
      borderColor:
        "#29213D",
      borderRadius: 18,
      overflow: "hidden",
      marginBottom: 28,
    },

    settingsRow: {
      minHeight: 74,
      paddingHorizontal: 18,
      paddingVertical: 15,
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    rowContent: {
      flex: 1,
      paddingRight: 16,
    },

    rowTitle: {
      color: "#EAE2F5",
      fontSize: 15,
      fontWeight: "600",
    },

    rowSubtitle: {
      color: "#81788E",
      fontSize: 12,
      lineHeight: 18,
      marginTop: 4,
    },

    chevron: {
      color: "#81719B",
      fontSize: 24,
    },

    divider: {
      height: 1,
      backgroundColor:
        "#29213D",
      marginLeft: 18,
    },

    exportCard: {
      backgroundColor:
        "#151126",
      borderWidth: 1,
      borderColor:
        "#33294B",
      borderRadius: 20,
      overflow: "hidden",
      marginBottom: 16,
    },

    exportHeader: {
      flexDirection: "row",
      padding: 19,
      alignItems:
        "flex-start",
    },

    exportIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor:
        "#241B3B",
      justifyContent:
        "center",
      alignItems: "center",
    },

    exportIconText: {
      color: "#D4B866",
      fontSize: 21,
    },

    exportHeaderText: {
      flex: 1,
      marginLeft: 13,
    },

    exportTitle: {
      color: "#EEE5FA",
      fontSize: 17,
      fontWeight: "700",
    },

    exportDescription: {
      color: "#847A91",
      fontSize: 12,
      lineHeight: 18,
      marginTop: 5,
    },

    exportButton: {
      minHeight: 72,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      paddingHorizontal: 19,
      paddingVertical: 13,
    },

    exportButtonContent: {
      flex: 1,
      paddingRight: 14,
    },

    exportButtonTitle: {
      color: "#DDD2EB",
      fontSize: 14,
      fontWeight: "600",
    },

    exportButtonSubtitle: {
      color: "#756B80",
      fontSize: 11,
      lineHeight: 17,
      marginTop: 4,
    },

    exportArrow: {
      color: "#937EB5",
      fontSize: 24,
    },

    exportDivider: {
      height: 1,
      backgroundColor:
        "#29213D",
      marginLeft: 19,
    },

    disabledButton: {
      opacity: 0.55,
    },

    errorBox: {
      backgroundColor:
        "#2A151E",
      borderWidth: 1,
      borderColor:
        "#683248",
      borderRadius: 13,
      padding: 13,
      marginBottom: 15,
    },

    errorText: {
      color: "#F1A7B9",
      fontSize: 12,
      lineHeight: 18,
    },

    successBox: {
      backgroundColor:
        "#18241D",
      borderWidth: 1,
      borderColor:
        "#365141",
      borderRadius: 13,
      padding: 13,
      marginBottom: 15,
    },

    successText: {
      color: "#B7D5C1",
      fontSize: 12,
    },

    platformNote: {
      backgroundColor:
        "#151126",
      borderWidth: 1,
      borderColor:
        "#302745",
      borderRadius: 17,
      padding: 17,
      flexDirection: "row",
      marginBottom: 16,
    },

    platformNoteSymbol: {
      color: "#D4B866",
      fontSize: 18,
      marginRight: 11,
    },

    platformNoteTitle: {
      color: "#D2C4E2",
      fontSize: 13,
      fontWeight: "700",
    },

    platformNoteText: {
      color: "#81778D",
      fontSize: 11,
      lineHeight: 18,
      marginTop: 5,
    },

    privacyNotice: {
      backgroundColor:
        "#181329",
      borderWidth: 1,
      borderColor:
        "#34294D",
      borderRadius: 17,
      padding: 17,
      flexDirection: "row",
      marginBottom: 28,
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
      color: "#CFC1DF",
      fontSize: 13,
      fontWeight: "700",
    },

    privacyText: {
      color: "#81778D",
      fontSize: 11,
      lineHeight: 18,
      marginTop: 5,
    },

    disclaimerCard: {
      backgroundColor:
        "#181329",
      borderWidth: 1,
      borderColor:
        "#34294D",
      borderRadius: 17,
      padding: 18,
    },

    disclaimerTitle: {
      color: "#CABAE1",
      fontSize: 14,
      fontWeight: "700",
    },

    disclaimerText: {
      color: "#81788E",
      fontSize: 12,
      lineHeight: 19,
      marginTop: 7,
    },

    signOutButton: {
      borderWidth: 1,
      borderColor:
        "#553041",
      borderRadius: 15,
      paddingVertical: 15,
      alignItems: "center",
      marginTop: 28,
    },

    signOutText: {
      color: "#D68DA3",
      fontSize: 15,
      fontWeight: "700",
    },
  }); 