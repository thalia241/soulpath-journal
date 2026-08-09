import { File, Paths } from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { Platform } from "react-native";

import { supabase } from "../lib/supabase";

type ExportJournalEntry = {
  id: string;
  title: string;
  content: string;
  mood: string | null;
  energy_level: number | null;
  entry_date: string;
  created_at: string;
  updated_at: string;

  entry_practices:
    | {
        practice:
          | {
              id: string;
              name: string;
            }
          | {
              id: string;
              name: string;
            }[]
          | null;
      }[]
    | null;
};

type ExportExperience = {
  id: string;

  experience_type:
    | "dream"
    | "synchronicity";

  title: string;

  description: string;

  interpretation:
    | string
    | null;

  significance_level:
    | number
    | null;

  experienced_at: string;

  created_at: string;

  updated_at: string;
};

export type SoulPathExportData = {
  exportedAt: string;

  profile: {
    displayName:
      | string
      | null;

    email:
      | string
      | null;
  };

  journalEntries:
    ExportJournalEntry[];

  dreams:
    ExportExperience[];

  synchronicities:
    ExportExperience[];
};

function escapeHtml(
  value: string
) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(
  value: string
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
}

function getPracticeNames(
  entry: ExportJournalEntry
) {
  if (
    !entry.entry_practices
  ) {
    return [];
  }

  return entry.entry_practices
    .map((item) => {
      const relation =
        item.practice;

      if (
        Array.isArray(
          relation
        )
      ) {
        return relation[0]
          ?.name;
      }

      return relation?.name;
    })
    .filter(
      (
        name
      ): name is string =>
        Boolean(name)
    );
}

function downloadTextOnWeb(
  content: string,
  filename: string,
  mimeType: string
) {
  if (
    typeof document ===
      "undefined" ||
    typeof URL ===
      "undefined"
  ) {
    throw new Error(
      "Browser downloads are not available in this environment."
    );
  }

  const blob =
    new Blob(
      [content],
      {
        type: mimeType,
      }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  const anchor =
    document.createElement(
      "a"
    );

  anchor.href = url;

  anchor.download =
    filename;

  document.body.appendChild(
    anchor
  );

  anchor.click();

  document.body.removeChild(
    anchor
  );

  URL.revokeObjectURL(
    url
  );
}

async function shareFile(
  uri: string,
  mimeType: string
) {
  const sharingAvailable =
    await Sharing.isAvailableAsync();

  if (!sharingAvailable) {
    throw new Error(
      "File sharing is not available on this device."
    );
  }

  await Sharing.shareAsync(
    uri,
    {
      mimeType,
      dialogTitle:
        "Export SoulPath Data",
    }
  );
}

export async function getSoulPathExportData(): Promise<SoulPathExportData> {
  const {
    data: { user },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    throw new Error(
      "You must be signed in to export your SoulPath data."
    );
  }

  const [
    journalResponse,
    experienceResponse,
  ] =
    await Promise.all([
      supabase
        .from(
          "journal_entries"
        )
        .select(`
          id,
          title,
          content,
          mood,
          energy_level,
          entry_date,
          created_at,
          updated_at,
          entry_practices (
            practice:practices (
              id,
              name
            )
          )
        `)
        .order(
          "entry_date",
          {
            ascending: false,
          }
        ),

      supabase
        .from(
          "experiences"
        )
        .select(`
          id,
          experience_type,
          title,
          description,
          interpretation,
          significance_level,
          experienced_at,
          created_at,
          updated_at
        `)
        .order(
          "experienced_at",
          {
            ascending: false,
          }
        ),
    ]);

  if (
    journalResponse.error
  ) {
    throw journalResponse.error;
  }

  if (
    experienceResponse.error
  ) {
    throw experienceResponse.error;
  }

  const journalEntries =
    (journalResponse.data ??
      []) as unknown as ExportJournalEntry[];

  const experiences =
    (experienceResponse.data ??
      []) as ExportExperience[];

  return {
    exportedAt:
      new Date().toISOString(),

    profile: {
      displayName:
        user.user_metadata
          ?.display_name ??
        null,

      email:
        user.email ??
        null,
    },

    journalEntries,

    dreams:
      experiences.filter(
        (item) =>
          item.experience_type ===
          "dream"
      ),

    synchronicities:
      experiences.filter(
        (item) =>
          item.experience_type ===
          "synchronicity"
      ),
  };
}

export async function exportSoulPathJson() {
  const data =
    await getSoulPathExportData();

  const json =
    JSON.stringify(
      data,
      null,
      2
    );

  const filename =
    `soulpath-export-${Date.now()}.json`;

  if (
    Platform.OS === "web"
  ) {
    downloadTextOnWeb(
      json,
      filename,
      "application/json"
    );

    return;
  }

  const file =
    new File(
      Paths.cache,
      filename
    );

  file.create();

  file.write(json);

  await shareFile(
    file.uri,
    "application/json"
  );
}

export async function exportSoulPathText() {
  const data =
    await getSoulPathExportData();

  const lines:
    string[] = [];

  lines.push(
    "SOULPATH JOURNAL EXPORT"
  );

  lines.push(
    "======================="
  );

  lines.push("");

  lines.push(
    `Exported: ${formatDate(
      data.exportedAt
    )}`
  );

  if (
    data.profile
      .displayName
  ) {
    lines.push(
      `Name: ${data.profile.displayName}`
    );
  }

  if (
    data.profile.email
  ) {
    lines.push(
      `Email: ${data.profile.email}`
    );
  }

  lines.push("");
  lines.push("");

  lines.push(
    "JOURNAL REFLECTIONS"
  );

  lines.push(
    "==================="
  );

  if (
    data.journalEntries
      .length === 0
  ) {
    lines.push("");

    lines.push(
      "No journal reflections recorded."
    );
  }

  for (
    const entry of
    data.journalEntries
  ) {
    const practices =
      getPracticeNames(
        entry
      );

    lines.push("");

    lines.push(
      entry.title
    );

    lines.push(
      "-".repeat(
        Math.min(
          Math.max(
            entry.title
              .length,
            8
          ),
          60
        )
      )
    );

    lines.push(
      `Date: ${formatDate(
        entry.entry_date
      )}`
    );

    if (entry.mood) {
      lines.push(
        `Mood: ${entry.mood}`
      );
    }

    if (
      entry.energy_level !==
      null
    ) {
      lines.push(
        `Energy: ${entry.energy_level}/5`
      );
    }

    if (
      practices.length >
      0
    ) {
      lines.push(
        `Practices: ${practices.join(
          ", "
        )}`
      );
    }

    lines.push("");

    lines.push(
      entry.content
    );

    lines.push("");
  }

  lines.push("");
  lines.push(
    "DREAMS"
  );

  lines.push(
    "======"
  );

  if (
    data.dreams
      .length === 0
  ) {
    lines.push("");

    lines.push(
      "No dreams recorded."
    );
  }

  for (
    const dream of
    data.dreams
  ) {
    lines.push("");

    lines.push(
      dream.title
    );

    lines.push(
      `Date: ${formatDate(
        dream.experienced_at
      )}`
    );

    if (
      dream.significance_level !==
      null
    ) {
      lines.push(
        `Significance: ${dream.significance_level}/5`
      );
    }

    lines.push("");

    lines.push(
      dream.description
    );

    if (
      dream.interpretation
    ) {
      lines.push("");

      lines.push(
        "Personal reflection:"
      );

      lines.push(
        dream.interpretation
      );
    }

    lines.push("");
  }

  lines.push("");
  lines.push(
    "SYNCHRONICITIES"
  );

  lines.push(
    "==============="
  );

  if (
    data.synchronicities
      .length === 0
  ) {
    lines.push("");

    lines.push(
      "No synchronicities recorded."
    );
  }

  for (
    const sign of
    data.synchronicities
  ) {
    lines.push("");

    lines.push(
      sign.title
    );

    lines.push(
      `Date: ${formatDate(
        sign.experienced_at
      )}`
    );

    if (
      sign.significance_level !==
      null
    ) {
      lines.push(
        `Significance: ${sign.significance_level}/5`
      );
    }

    lines.push("");

    lines.push(
      sign.description
    );

    if (
      sign.interpretation
    ) {
      lines.push("");

      lines.push(
        "Personal reflection:"
      );

      lines.push(
        sign.interpretation
      );
    }

    lines.push("");
  }

  const text =
    lines.join("\n");

  const filename =
    `soulpath-export-${Date.now()}.txt`;

  if (
    Platform.OS === "web"
  ) {
    downloadTextOnWeb(
      text,
      filename,
      "text/plain"
    );

    return;
  }

  const file =
    new File(
      Paths.cache,
      filename
    );

  file.create();

  file.write(text);

  await shareFile(
    file.uri,
    "text/plain"
  );
}

export async function exportSoulPathPdf() {
  const data =
    await getSoulPathExportData();

  const journalHtml =
    data.journalEntries
      .map(
        (entry) => {
          const practices =
            getPracticeNames(
              entry
            );

          return `
            <section class="entry">
              <div class="entry-type">
                DAILY REFLECTION
              </div>

              <h2>
                ${escapeHtml(
                  entry.title
                )}
              </h2>

              <div class="meta">
                ${escapeHtml(
                  formatDate(
                    entry.entry_date
                  )
                )}
              </div>

              <div class="chips">
                ${
                  entry.mood
                    ? `
                      <span class="chip">
                        ${escapeHtml(
                          entry.mood
                        )}
                      </span>
                    `
                    : ""
                }

                ${
                  entry.energy_level !==
                  null
                    ? `
                      <span class="chip">
                        Energy ${entry.energy_level}/5
                      </span>
                    `
                    : ""
                }

                ${practices
                  .map(
                    (
                      practice
                    ) => `
                      <span class="chip">
                        ${escapeHtml(
                          practice
                        )}
                      </span>
                    `
                  )
                  .join("")}
              </div>

              <p>
                ${escapeHtml(
                  entry.content
                ).replaceAll(
                  "\n",
                  "<br />"
                )}
              </p>
            </section>
          `;
        }
      )
      .join("");

  const dreamHtml =
    data.dreams
      .map(
        (dream) => `
          <section class="entry">
            <div class="entry-type">
              DREAM
            </div>

            <h2>
              ${escapeHtml(
                dream.title
              )}
            </h2>

            <div class="meta">
              ${escapeHtml(
                formatDate(
                  dream.experienced_at
                )
              )}
            </div>

            ${
              dream.significance_level !==
              null
                ? `
                  <div class="chips">
                    <span class="chip">
                      Significance ${dream.significance_level}/5
                    </span>
                  </div>
                `
                : ""
            }

            <p>
              ${escapeHtml(
                dream.description
              ).replaceAll(
                "\n",
                "<br />"
              )}
            </p>

            ${
              dream.interpretation
                ? `
                  <div class="reflection">
                    <strong>
                      Personal Reflection
                    </strong>

                    <p>
                      ${escapeHtml(
                        dream.interpretation
                      ).replaceAll(
                        "\n",
                        "<br />"
                      )}
                    </p>
                  </div>
                `
                : ""
            }
          </section>
        `
      )
      .join("");

  const synchronicityHtml =
    data.synchronicities
      .map(
        (sign) => `
          <section class="entry">
            <div class="entry-type">
              SYNCHRONICITY
            </div>

            <h2>
              ${escapeHtml(
                sign.title
              )}
            </h2>

            <div class="meta">
              ${escapeHtml(
                formatDate(
                  sign.experienced_at
                )
              )}
            </div>

            ${
              sign.significance_level !==
              null
                ? `
                  <div class="chips">
                    <span class="chip">
                      Significance ${sign.significance_level}/5
                    </span>
                  </div>
                `
                : ""
            }

            <p>
              ${escapeHtml(
                sign.description
              ).replaceAll(
                "\n",
                "<br />"
              )}
            </p>

            ${
              sign.interpretation
                ? `
                  <div class="reflection">
                    <strong>
                      Personal Reflection
                    </strong>

                    <p>
                      ${escapeHtml(
                        sign.interpretation
                      ).replaceAll(
                        "\n",
                        "<br />"
                      )}
                    </p>
                  </div>
                `
                : ""
            }
          </section>
        `
      )
      .join("");

  const html = `
    <!DOCTYPE html>

    <html>
      <head>
        <meta charset="utf-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>
          SoulPath Journal Export
        </title>

        <style>
          @page {
            margin: 42px;
          }

          * {
            box-sizing: border-box;
          }

          body {
            font-family:
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;

            color: #241f2d;

            background: #ffffff;

            font-size: 13px;

            line-height: 1.65;

            margin: 0;

            padding: 0;
          }

          .cover {
            padding-top: 80px;

            padding-bottom: 80px;

            text-align: center;
          }

          .symbol {
            font-size: 34px;

            color: #7961a7;
          }

          h1 {
            font-size: 34px;

            margin-bottom: 6px;

            color: #221b2d;
          }

          .subtitle {
            color: #786d82;

            font-size: 15px;
          }

          .export-date {
            margin-top: 30px;

            color: #938a9a;

            font-size: 11px;
          }

          .section-title {
            margin-top: 40px;

            border-bottom:
              1px solid #ddd6e8;

            padding-bottom: 8px;

            font-size: 23px;

            color: #352847;
          }

          .entry {
            margin-top: 28px;

            page-break-inside:
              avoid;
          }

          .entry-type {
            color: #8066a8;

            font-size: 9px;

            font-weight: 700;

            letter-spacing:
              1.6px;
          }

          h2 {
            font-size: 20px;

            margin-top: 5px;

            margin-bottom: 4px;

            color: #28202f;
          }

          .meta {
            color: #8a8190;

            font-size: 10px;

            margin-bottom: 10px;
          }

          .chips {
            margin-top: 8px;

            margin-bottom: 12px;
          }

          .chip {
            display:
              inline-block;

            background:
              #eee8f7;

            color: #65537f;

            border-radius: 12px;

            padding: 4px 8px;

            margin-right: 5px;

            margin-bottom: 5px;

            font-size: 9px;
          }

          .reflection {
            background:
              #f5f1f8;

            border-left:
              3px solid #8b70b4;

            padding: 12px 15px;

            margin-top: 14px;
          }

          .empty {
            color: #8d8493;

            font-style:
              italic;

            margin-top: 14px;
          }

          .footer {
            margin-top: 50px;

            border-top:
              1px solid #e3ddea;

            padding-top: 12px;

            color: #99909f;

            font-size: 9px;

            text-align: center;
          }
        </style>
      </head>

      <body>
        <section class="cover">
          <div class="symbol">
            ☾ ✦
          </div>

          <h1>
            SoulPath Journal
          </h1>

          <div class="subtitle">
            A private record of your journey within.
          </div>

          ${
            data.profile
              .displayName
              ? `
                <div class="export-date">
                  Prepared for
                  ${escapeHtml(
                    data.profile
                      .displayName
                  )}
                </div>
              `
              : ""
          }

          <div class="export-date">
            Exported
            ${escapeHtml(
              formatDate(
                data.exportedAt
              )
            )}
          </div>
        </section>

        <h1 class="section-title">
          Journal Reflections
        </h1>

        ${
          journalHtml ||
          `
            <p class="empty">
              No journal reflections recorded.
            </p>
          `
        }

        <h1 class="section-title">
          Dreams
        </h1>

        ${
          dreamHtml ||
          `
            <p class="empty">
              No dreams recorded.
            </p>
          `
        }

        <h1 class="section-title">
          Synchronicities
        </h1>

        ${
          synchronicityHtml ||
          `
            <p class="empty">
              No synchronicities recorded.
            </p>
          `
        }

        <div class="footer">
          Generated by SoulPath Journal.
          This export contains personal reflection data.
        </div>
      </body>
    </html>
  `;

  if (
    Platform.OS === "web"
  ) {
    if (
      typeof window ===
      "undefined"
    ) {
      throw new Error(
        "PDF printing is not available in this environment."
      );
    }

    const printWindow =
      window.open(
        "",
        "_blank"
      );

    if (!printWindow) {
      throw new Error(
        "Unable to open the print window. Please allow pop-ups and try again."
      );
    }

    printWindow.document.open();

    printWindow.document.write(
      html
    );

    printWindow.document.close();

    const triggerPrint =
      () => {
        printWindow.focus();

        printWindow.print();
      };

    if (
      printWindow.document
        .readyState ===
      "complete"
    ) {
      window.setTimeout(
        triggerPrint,
        250
      );
    } else {
      printWindow.onload =
        triggerPrint;
    }

    return;
  }

  const result =
    await Print.printToFileAsync(
      {
        html,
      }
    );

  if (
    !result ||
    !result.uri
  ) {
    throw new Error(
      "Unable to create the PDF export."
    );
  }

  await shareFile(
    result.uri,
    "application/pdf"
  );
} 