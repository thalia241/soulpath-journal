import {
  Platform,
} from "react-native";

import * as Print from "expo-print";

import * as Sharing from "expo-sharing";

import {
  File,
  Paths,
} from "expo-file-system";

import {
  supabase,
} from "../lib/supabase";

import {
  formatDateTime,
  formatLocalDate,
} from "../utils/date";

export type SoulPathExportFormat =
  | "pdf"
  | "txt"
  | "json";

export type SoulPathExportSummary = {
  journalEntries: number;

  experiences: number;

  linkedPractices: number;
};

type ExportProfile = {
  display_name:
    | string
    | null;
};

type ExportJournalEntry = {
  id: string;

  title: string;

  content: string;

  mood:
    | string
    | null;

  energy_level:
    | number
    | null;

  entry_date: string;

  created_at: string;

  updated_at: string;
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

type ExportPractice = {
  id: string;

  name: string;
};

type ExportEntryPractice = {
  entry_id: string;

  practice_id: string;
};

export type ExportJournalRecord = {
  id: string;

  title: string;

  content: string;

  mood:
    | string
    | null;

  energyLevel:
    | number
    | null;

  entryDate: string;

  createdAt: string;

  updatedAt: string;

  practices: string[];
};

export type ExportExperienceRecord = {
  id: string;

  type:
    | "dream"
    | "synchronicity";

  title: string;

  description: string;

  personalReflection:
    | string
    | null;

  significanceLevel:
    | number
    | null;

  experiencedAt: string;

  createdAt: string;

  updatedAt: string;
};

export type SoulPathPortableExport = {
  schema: {
    name:
      "soulpath-journal-export";

    version: 1;
  };

  exportedAt: string;

  account: {
    displayName:
      | string
      | null;

    email:
      | string
      | null;
  };

  summary:
    SoulPathExportSummary;

  journalEntries:
    ExportJournalRecord[];

  experiences:
    ExportExperienceRecord[];
};

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (
    error instanceof Error
  ) {
    return error.message;
  }

  if (
    typeof error ===
      "object" &&
    error !== null &&
    "message" in error
  ) {
    const message =
      (
        error as {
          message?: unknown;
        }
      ).message;

    if (
      typeof message ===
      "string"
    ) {
      return message;
    }
  }

  return fallback;
}

function escapeHtml(
  value:
    | string
    | null
    | undefined
): string {
  if (!value) {
    return "";
  }

  return value
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}

function htmlText(
  value:
    | string
    | null
    | undefined
): string {
  return escapeHtml(
    value
  ).replace(
    /\r?\n/g,
    "<br />"
  );
}

function normalizeFilePart(
  value: string
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    )
    .slice(
      0,
      40
    );
}

function buildTimestampForFilename() {
  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() +
        1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );

  const hours =
    String(
      now.getHours()
    ).padStart(
      2,
      "0"
    );

  const minutes =
    String(
      now.getMinutes()
    ).padStart(
      2,
      "0"
    );

  const seconds =
    String(
      now.getSeconds()
    ).padStart(
      2,
      "0"
    );

  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

function buildFilename(
  extension:
    | "pdf"
    | "txt"
    | "json",
  displayName:
    | string
    | null
): string {
  const person =
    displayName
      ? normalizeFilePart(
          displayName
        )
      : "";

  const suffix =
    buildTimestampForFilename();

  return person
    ? `soulpath-${person}-${suffix}.${extension}`
    : `soulpath-export-${suffix}.${extension}`;
}

async function requireUser() {
  const {
    data: {
      user,
    },
    error,
  } =
    await supabase.auth.getUser();

  if (
    error ||
    !user
  ) {
    throw new Error(
      "Your SoulPath session has ended. Please sign in again."
    );
  }

  return user;
}

export async function buildSoulPathExport(): Promise<SoulPathPortableExport> {
  const user =
    await requireUser();

  const [
    profileResult,
    journalResult,
    experienceResult,
    entryPracticeResult,
    practiceResult,
  ] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(
          "display_name"
        )
        .eq(
          "id",
          user.id
        )
        .maybeSingle(),

      supabase
        .from(
          "journal_entries"
        )
        .select(
          `
          id,
          title,
          content,
          mood,
          energy_level,
          entry_date,
          created_at,
          updated_at
          `
        )
        .eq(
          "user_id",
          user.id
        )
        .order(
          "entry_date",
          {
            ascending:
              false,
          }
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        ),

      supabase
        .from(
          "experiences"
        )
        .select(
          `
          id,
          experience_type,
          title,
          description,
          interpretation,
          significance_level,
          experienced_at,
          created_at,
          updated_at
          `
        )
        .eq(
          "user_id",
          user.id
        )
        .order(
          "experienced_at",
          {
            ascending:
              false,
          }
        ),

      supabase
        .from(
          "entry_practices"
        )
        .select(
          `
          entry_id,
          practice_id
          `
        )
        .eq(
          "user_id",
          user.id
        ),

      supabase
        .from(
          "practices"
        )
        .select(
          `
          id,
          name
          `
        )
        .order(
          "name",
          {
            ascending: true,
          }
        ),
    ]);

  if (
    profileResult.error
  ) {
    throw new Error(
      getErrorMessage(
        profileResult.error,
        "Unable to read your profile for export."
      )
    );
  }

  if (
    journalResult.error
  ) {
    throw new Error(
      getErrorMessage(
        journalResult.error,
        "Unable to prepare your journal entries for export."
      )
    );
  }

  if (
    experienceResult.error
  ) {
    throw new Error(
      getErrorMessage(
        experienceResult.error,
        "Unable to prepare your dreams and signs for export."
      )
    );
  }

  if (
    entryPracticeResult.error
  ) {
    throw new Error(
      getErrorMessage(
        entryPracticeResult.error,
        "Unable to prepare your practice history for export."
      )
    );
  }

  if (
    practiceResult.error
  ) {
    throw new Error(
      getErrorMessage(
        practiceResult.error,
        "Unable to prepare practice names for export."
      )
    );
  }

  const profile =
    profileResult.data as
      | ExportProfile
      | null;

  const journalEntries =
    (
      journalResult.data ??
      []
    ) as ExportJournalEntry[];

  const experiences =
    (
      experienceResult.data ??
      []
    ) as ExportExperience[];

  const entryPractices =
    (
      entryPracticeResult.data ??
      []
    ) as ExportEntryPractice[];

  const practices =
    (
      practiceResult.data ??
      []
    ) as ExportPractice[];

  const practiceNameById =
    new Map<
      string,
      string
    >(
      practices.map(
        (practice) => [
          practice.id,
          practice.name,
        ]
      )
    );

  const practiceNamesByEntryId =
    new Map<
      string,
      string[]
    >();

  for (
    const link of
    entryPractices
  ) {
    const name =
      practiceNameById.get(
        link.practice_id
      );

    if (!name) {
      continue;
    }

    const current =
      practiceNamesByEntryId.get(
        link.entry_id
      ) ?? [];

    current.push(name);

    practiceNamesByEntryId.set(
      link.entry_id,
      current
    );
  }

  for (
    const names of
    practiceNamesByEntryId.values()
  ) {
    names.sort(
      (a, b) =>
        a.localeCompare(b)
    );
  }

  const portableJournal =
    journalEntries.map(
      (
        entry
      ): ExportJournalRecord => ({
        id: entry.id,

        title:
          entry.title,

        content:
          entry.content,

        mood:
          entry.mood,

        energyLevel:
          entry.energy_level,

        entryDate:
          entry.entry_date,

        createdAt:
          entry.created_at,

        updatedAt:
          entry.updated_at,

        practices:
          practiceNamesByEntryId.get(
            entry.id
          ) ?? [],
      })
    );

  const portableExperiences =
    experiences.map(
      (
        experience
      ): ExportExperienceRecord => ({
        id:
          experience.id,

        type:
          experience.experience_type,

        title:
          experience.title,

        description:
          experience.description,

        personalReflection:
          experience.interpretation,

        significanceLevel:
          experience.significance_level,

        experiencedAt:
          experience.experienced_at,

        createdAt:
          experience.created_at,

        updatedAt:
          experience.updated_at,
      })
    );

  return {
    schema: {
      name:
        "soulpath-journal-export",

      version: 1,
    },

    exportedAt:
      new Date().toISOString(),

    account: {
      displayName:
        profile?.display_name ??
        user.user_metadata
          ?.display_name ??
        null,

      email:
        user.email ??
        null,
    },

    summary: {
      journalEntries:
        portableJournal.length,

      experiences:
        portableExperiences.length,

      linkedPractices:
        entryPractices.length,
    },

    journalEntries:
      portableJournal,

    experiences:
      portableExperiences,
  };
}

function createTxtExport(
  data: SoulPathPortableExport
): string {
  const lines: string[] =
    [];

  lines.push(
    "SOULPATH JOURNAL"
  );

  lines.push(
    "A private space for the journey within."
  );

  lines.push("");

  lines.push(
    `Exported: ${formatDateTime(
      data.exportedAt
    )}`
  );

  if (
    data.account.displayName
  ) {
    lines.push(
      `Name: ${data.account.displayName}`
    );
  }

  if (
    data.account.email
  ) {
    lines.push(
      `Email: ${data.account.email}`
    );
  }

  lines.push("");

  lines.push(
    `Reflections: ${data.summary.journalEntries}`
  );

  lines.push(
    `Dreams & signs: ${data.summary.experiences}`
  );

  lines.push("");

  lines.push(
    "========================================"
  );

  lines.push(
    "JOURNAL"
  );

  lines.push(
    "========================================"
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
    lines.push("");

    lines.push(
      entry.title
    );

    lines.push(
      formatLocalDate(
        entry.entryDate
      )
    );

    if (entry.mood) {
      lines.push(
        `Mood: ${entry.mood}`
      );
    }

    if (
      entry.energyLevel !==
      null
    ) {
      lines.push(
        `Energy: ${entry.energyLevel}/5`
      );
    }

    if (
      entry.practices
        .length > 0
    ) {
      lines.push(
        `Practices: ${entry.practices.join(
          ", "
        )}`
      );
    }

    lines.push("");

    lines.push(
      entry.content
    );

    lines.push("");

    lines.push(
      "----------------------------------------"
    );
  }

  lines.push("");

  lines.push(
    "========================================"
  );

  lines.push(
    "DREAMS & SIGNS"
  );

  lines.push(
    "========================================"
  );

  if (
    data.experiences
      .length === 0
  ) {
    lines.push("");

    lines.push(
      "No dreams or signs recorded."
    );
  }

  for (
    const experience of
    data.experiences
  ) {
    lines.push("");

    lines.push(
      experience.title
    );

    lines.push(
      experience.type ===
        "dream"
        ? "Dream"
        : "Synchronicity"
    );

    lines.push(
      formatDateTime(
        experience.experiencedAt
      )
    );

    if (
      experience.significanceLevel !==
      null
    ) {
      lines.push(
        `Significance: ${experience.significanceLevel}/5`
      );
    }

    lines.push("");

    lines.push(
      experience.description
    );

    if (
      experience.personalReflection
    ) {
      lines.push("");

      lines.push(
        "What it brought up for you:"
      );

      lines.push(
        experience.personalReflection
      );
    }

    lines.push("");

    lines.push(
      "----------------------------------------"
    );
  }

  lines.push("");

  lines.push(
    "End of SoulPath export."
  );

  return lines.join(
    "\n"
  );
}

function createPdfHtml(
  data: SoulPathPortableExport
): string {
  const journalHtml =
    data.journalEntries
      .length === 0
      ? `
        <div class="empty">
          No journal reflections recorded.
        </div>
      `
      : data.journalEntries
          .map(
            (entry) => {
              const meta: string[] =
                [];

              if (
                entry.mood
              ) {
                meta.push(
                  `Mood: ${escapeHtml(
                    entry.mood
                  )}`
                );
              }

              if (
                entry.energyLevel !==
                null
              ) {
                meta.push(
                  `Energy: ${entry.energyLevel}/5`
                );
              }

              if (
                entry.practices
                  .length > 0
              ) {
                meta.push(
                  `Practices: ${entry.practices
                    .map(
                      escapeHtml
                    )
                    .join(
                      ", "
                    )}`
                );
              }

              return `
                <section class="entry">
                  <div class="eyebrow">
                    ${escapeHtml(
                      formatLocalDate(
                        entry.entryDate
                      )
                    )}
                  </div>

                  <h2>
                    ${escapeHtml(
                      entry.title
                    )}
                  </h2>

                  ${
                    meta.length
                      ? `
                        <div class="meta">
                          ${meta.join(
                            " · "
                          )}
                        </div>
                      `
                      : ""
                  }

                  <div class="body">
                    ${htmlText(
                      entry.content
                    )}
                  </div>
                </section>
              `;
            }
          )
          .join("");

  const experienceHtml =
    data.experiences
      .length === 0
      ? `
        <div class="empty">
          No dreams or signs recorded.
        </div>
      `
      : data.experiences
          .map(
            (
              experience
            ) => {
              const typeLabel =
                experience.type ===
                "dream"
                  ? "Dream"
                  : "Synchronicity";

              return `
                <section class="entry">
                  <div class="eyebrow">
                    ${escapeHtml(
                      typeLabel
                    )} ·
                    ${escapeHtml(
                      formatDateTime(
                        experience.experiencedAt
                      )
                    )}
                  </div>

                  <h2>
                    ${escapeHtml(
                      experience.title
                    )}
                  </h2>

                  ${
                    experience.significanceLevel !==
                    null
                      ? `
                        <div class="meta">
                          Stayed with you
                          ${experience.significanceLevel}/5
                        </div>
                      `
                      : ""
                  }

                  <div class="body">
                    ${htmlText(
                      experience.description
                    )}
                  </div>

                  ${
                    experience.personalReflection
                      ? `
                        <div class="reflection">
                          <div class="reflection-title">
                            ✦ What it brought up for you
                          </div>

                          <div>
                            ${htmlText(
                              experience.personalReflection
                            )}
                          </div>
                        </div>
                      `
                      : ""
                  }
                </section>
              `;
            }
          )
          .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  />

  <title>SoulPath Journal Export</title>

  <style>
    @page {
      margin: 42px;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #211b2c;
      font-family:
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        Arial,
        sans-serif;
      font-size: 13px;
      line-height: 1.65;
    }

    .page {
      max-width: 720px;
      margin: 0 auto;
    }

    .brand {
      border-bottom: 1px solid #ddd5e8;
      padding-bottom: 24px;
      margin-bottom: 30px;
    }

    .symbol {
      color: #8F72D2;
      font-size: 18px;
      margin-bottom: 5px;
    }

    h1 {
      margin: 0;
      color: #241b33;
      font-family:
        Georgia,
        "Times New Roman",
        serif;
      font-size: 34px;
      font-weight: 500;
    }

    .tagline {
      color: #756d80;
      font-family:
        Georgia,
        "Times New Roman",
        serif;
      font-style: italic;
      font-size: 15px;
      margin-top: 3px;
    }

    .account {
      margin-top: 18px;
      color: #756d80;
      font-size: 10px;
      line-height: 1.6;
    }

    .summary {
      display: flex;
      gap: 12px;
      margin: 24px 0 34px;
    }

    .summary-card {
      flex: 1;
      border: 1px solid #e5deed;
      border-radius: 12px;
      padding: 14px;
    }

    .summary-number {
      color: #5E489D;
      font-size: 22px;
      font-family:
        Georgia,
        "Times New Roman",
        serif;
    }

    .summary-label {
      color: #91879e;
      font-size: 9px;
      margin-top: 2px;
    }

    h3 {
      color: #5E489D;
      font-family:
        Georgia,
        "Times New Roman",
        serif;
      font-size: 21px;
      font-weight: 500;
      margin-top: 34px;
      margin-bottom: 14px;
    }

    .entry {
      border-top: 1px solid #e5deed;
      padding: 22px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .eyebrow {
      color: #91879e;
      font-size: 9px;
      margin-bottom: 4px;
    }

    h2 {
      color: #2d2438;
      font-family:
        Georgia,
        "Times New Roman",
        serif;
      font-size: 22px;
      font-weight: 500;
      margin: 0 0 6px;
    }

    .meta {
      color: #7357c7;
      font-size: 10px;
      margin-bottom: 14px;
    }

    .body {
      color: #38303f;
      white-space: normal;
    }

    .reflection {
      margin-top: 17px;
      padding: 14px;
      border-left: 3px solid #bca6e8;
      background: #f7f3fb;
      color: #51485b;
    }

    .reflection-title {
      color: #7357c7;
      font-family:
        Georgia,
        "Times New Roman",
        serif;
      font-style: italic;
      margin-bottom: 6px;
    }

    .empty {
      color: #91879e;
      border: 1px dashed #ddd5e8;
      border-radius: 12px;
      padding: 18px;
      text-align: center;
    }

    .footer {
      border-top: 1px solid #ddd5e8;
      margin-top: 30px;
      padding-top: 18px;
      color: #91879e;
      text-align: center;
      font-size: 9px;
    }

    @media print {
      body {
        -webkit-print-color-adjust:
          exact;
        print-color-adjust:
          exact;
      }
    }
  </style>
</head>

<body>
  <main class="page">
    <header class="brand">
      <div class="symbol">
        ☾ ✦
      </div>

      <h1>
        SoulPath Journal
      </h1>

      <div class="tagline">
        A private space for the journey within.
      </div>

      <div class="account">
        ${
          data.account.displayName
            ? `Export for ${escapeHtml(
                data.account.displayName
              )}<br />`
            : ""
        }

        Exported
        ${escapeHtml(
          formatDateTime(
            data.exportedAt
          )
        )}
      </div>
    </header>

    <div class="summary">
      <div class="summary-card">
        <div class="summary-number">
          ${
            data.summary
              .journalEntries
          }
        </div>

        <div class="summary-label">
          reflections
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-number">
          ${
            data.summary
              .experiences
          }
        </div>

        <div class="summary-label">
          dreams & signs
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-number">
          ${
            data.summary
              .linkedPractices
          }
        </div>

        <div class="summary-label">
          recorded practice links
        </div>
      </div>
    </div>

    <h3>
      Journal
    </h3>

    ${journalHtml}

    <h3>
      Dreams & Signs
    </h3>

    ${experienceHtml}

    <footer class="footer">
      Generated from SoulPath Journal.
      This export contains only data associated with
      the authenticated account and does not contain
      passwords or authentication tokens.
    </footer>
  </main>
</body>
</html>
  `;
}

function downloadWebFile(
  filename: string,
  content: string,
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
        type: `${mimeType};charset=utf-8`,
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

  anchor.style.display =
    "none";

  document.body.appendChild(
    anchor
  );

  anchor.click();

  anchor.remove();

  setTimeout(
    () => {
      URL.revokeObjectURL(
        url
      );
    },
    1000
  );
}

async function writeNativeFile(
  filename: string,
  content: string
): Promise<File> {
  const file =
    new File(
      Paths.cache,
      filename
    );

  file.create({
    overwrite: true,

    intermediates: true,
  });

  file.write(content);

  return file;
}

async function shareNativeFile(
  fileUri: string,
  options: {
    mimeType: string;

    dialogTitle: string;

    UTI?: string;
  }
) {
  const available =
    await Sharing.isAvailableAsync();

  if (!available) {
    throw new Error(
      "Sharing is not available on this device."
    );
  }

  await Sharing.shareAsync(
    fileUri,
    {
      mimeType:
        options.mimeType,

      dialogTitle:
        options.dialogTitle,

      UTI:
        options.UTI,
    }
  );
}

export async function exportSoulPathJson(): Promise<SoulPathExportSummary> {
  const data =
    await buildSoulPathExport();

  const filename =
    buildFilename(
      "json",
      data.account.displayName
    );

  const json =
    JSON.stringify(
      data,
      null,
      2
    );

  if (
    Platform.OS ===
    "web"
  ) {
    downloadWebFile(
      filename,
      json,
      "application/json"
    );

    return data.summary;
  }

  const file =
    await writeNativeFile(
      filename,
      json
    );

  await shareNativeFile(
    file.uri,
    {
      mimeType:
        "application/json",

      dialogTitle:
        "Export SoulPath data",

      UTI:
        "public.json",
    }
  );

  return data.summary;
}

export async function exportSoulPathText(): Promise<SoulPathExportSummary> {
  const data =
    await buildSoulPathExport();

  const filename =
    buildFilename(
      "txt",
      data.account.displayName
    );

  const text =
    createTxtExport(
      data
    );

  if (
    Platform.OS ===
    "web"
  ) {
    downloadWebFile(
      filename,
      text,
      "text/plain"
    );

    return data.summary;
  }

  const file =
    await writeNativeFile(
      filename,
      text
    );

  await shareNativeFile(
    file.uri,
    {
      mimeType:
        "text/plain",

      dialogTitle:
        "Export SoulPath journal",

      UTI:
        "public.plain-text",
    }
  );

  return data.summary;
}

export async function exportSoulPathPdf(): Promise<SoulPathExportSummary> {
  /*
   * IMPORTANT:
   *
   * Open the browser print window before any awaited
   * Supabase request. This keeps the window creation
   * directly tied to the user's button press and avoids
   * common popup-blocker behavior.
   */
  const webPrintWindow =
    Platform.OS ===
      "web" &&
    typeof window !==
      "undefined"
      ? window.open(
          "",
          "_blank"
        )
      : null;

  try {
    const data =
      await buildSoulPathExport();

    const html =
      createPdfHtml(
        data
      );

    if (
      Platform.OS ===
      "web"
    ) {
      if (!webPrintWindow) {
        throw new Error(
          "Your browser blocked the PDF window. Allow pop-ups for SoulPath and try again."
        );
      }

      webPrintWindow.document.open();

      webPrintWindow.document.write(
        html
      );

      webPrintWindow.document.close();

      webPrintWindow.document.title =
        "SoulPath Journal Export";

      const triggerPrint =
        () => {
          webPrintWindow.focus();

          webPrintWindow.print();
        };

      if (
        webPrintWindow.document.readyState ===
        "complete"
      ) {
        setTimeout(
          triggerPrint,
          250
        );
      } else {
        webPrintWindow.addEventListener(
          "load",
          () => {
            setTimeout(
              triggerPrint,
              250
            );
          },
          {
            once: true,
          }
        );
      }

      return data.summary;
    }

    const result =
      await Print.printToFileAsync(
        {
          html,

          width: 612,

          height: 792,

          base64: false,
        }
      );

    if (!result.uri) {
      throw new Error(
        "SoulPath could not create the PDF file."
      );
    }

    await shareNativeFile(
      result.uri,
      {
        mimeType:
          "application/pdf",

        dialogTitle:
          "Export SoulPath PDF",

        UTI:
          "com.adobe.pdf",
      }
    );

    return data.summary;
  } catch (error) {
    if (
      webPrintWindow &&
      !webPrintWindow.closed
    ) {
      webPrintWindow.close();
    }

    throw error;
  }
} 