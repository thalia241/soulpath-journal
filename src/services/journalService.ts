import {
  supabase,
} from "../lib/supabase";

import {
  getConsecutiveDateStreak,
  getLocalToday,
} from "../utils/date";

export type JournalEntry = {
  id: string;

  user_id: string;

  title: string;

  content: string;

  mood:
    | string
    | null;

  energy_level:
    | number
    | null;

  entry_date: string;

  is_favorite: boolean;

  created_at: string;

  updated_at: string;
};

export type CreateJournalEntryInput = {
  title: string;

  content: string;

  mood?:
    | string
    | null;

  energy_level?:
    | number
    | null;

  entry_date?: string;

  is_favorite?: boolean;
};

export type UpdateJournalEntryInput = {
  title?: string;

  content?: string;

  mood?:
    | string
    | null;

  energy_level?:
    | number
    | null;

  entry_date?: string;

  is_favorite?: boolean;
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
      "Your SoulPath session has expired. Please sign in again."
    );
  }

  return user;
}

function cleanRequiredText(
  value: string,
  fieldName: string
): string {
  const cleaned =
    value.trim();

  if (!cleaned) {
    throw new Error(
      `${fieldName} is required.`
    );
  }

  return cleaned;
}

function validateEnergy(
  energy:
    | number
    | null
    | undefined
) {
  if (
    energy === null ||
    energy === undefined
  ) {
    return;
  }

  if (
    !Number.isInteger(
      energy
    ) ||
    energy < 1 ||
    energy > 5
  ) {
    throw new Error(
      "Energy must be between 1 and 5."
    );
  }
}

export async function getJournalEntries(): Promise<
  JournalEntry[]
> {
  const user =
    await requireUser();

  const {
    data,
    error,
  } = await supabase
    .from(
      "journal_entries"
    )
    .select(
      `
        id,
        user_id,
        title,
        content,
        mood,
        energy_level,
        entry_date,
        is_favorite,
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
        ascending: false,
      }
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    );

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to load your journal."
      )
    );
  }

  return (
    data ?? []
  ) as JournalEntry[];
}

export async function getJournalEntry(
  id: string
): Promise<JournalEntry> {
  if (!id) {
    throw new Error(
      "Journal entry ID is required."
    );
  }

  const user =
    await requireUser();

  const {
    data,
    error,
  } = await supabase
    .from(
      "journal_entries"
    )
    .select(
      `
        id,
        user_id,
        title,
        content,
        mood,
        energy_level,
        entry_date,
        is_favorite,
        created_at,
        updated_at
      `
    )
    .eq(
      "id",
      id
    )
    .eq(
      "user_id",
      user.id
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to open this reflection."
      )
    );
  }

  if (!data) {
    throw new Error(
      "This reflection could not be found."
    );
  }

  return data as JournalEntry;
}

export async function createJournalEntry(
  input: CreateJournalEntryInput
): Promise<JournalEntry> {
  const user =
    await requireUser();

  const title =
    cleanRequiredText(
      input.title,
      "Reflection title"
    );

  const content =
    cleanRequiredText(
      input.content,
      "Reflection"
    );

  if (
    title.length > 120
  ) {
    throw new Error(
      "Reflection title must be 120 characters or fewer."
    );
  }

  if (
    content.length > 20000
  ) {
    throw new Error(
      "Reflection must be 20,000 characters or fewer."
    );
  }

  validateEnergy(
    input.energy_level
  );

  const mood =
    input.mood?.trim() ||
    null;

  /*
   * Important:
   *
   * We explicitly provide the client's local calendar
   * date rather than relying on the database's
   * CURRENT_DATE timezone.
   */
  const entryDate =
    input.entry_date ??
    getLocalToday();

  const {
    data,
    error,
  } = await supabase
    .from(
      "journal_entries"
    )
    .insert({
      user_id:
        user.id,

      title,

      content,

      mood,

      energy_level:
        input.energy_level ??
        null,

      entry_date:
        entryDate,

      is_favorite:
        input.is_favorite ??
        false,
    })
    .select(
      `
        id,
        user_id,
        title,
        content,
        mood,
        energy_level,
        entry_date,
        is_favorite,
        created_at,
        updated_at
      `
    )
    .single();

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to save your reflection."
      )
    );
  }

  return data as JournalEntry;
}

export async function updateJournalEntry(
  id: string,
  input: UpdateJournalEntryInput
): Promise<JournalEntry> {
  if (!id) {
    throw new Error(
      "Journal entry ID is required."
    );
  }

  const user =
    await requireUser();

  const updates: Record<
    string,
    unknown
  > = {};

  if (
    input.title !==
    undefined
  ) {
    const title =
      cleanRequiredText(
        input.title,
        "Reflection title"
      );

    if (
      title.length > 120
    ) {
      throw new Error(
        "Reflection title must be 120 characters or fewer."
      );
    }

    updates.title =
      title;
  }

  if (
    input.content !==
    undefined
  ) {
    const content =
      cleanRequiredText(
        input.content,
        "Reflection"
      );

    if (
      content.length >
      20000
    ) {
      throw new Error(
        "Reflection must be 20,000 characters or fewer."
      );
    }

    updates.content =
      content;
  }

  if (
    input.mood !==
    undefined
  ) {
    updates.mood =
      input.mood?.trim() ||
      null;
  }

  if (
    input.energy_level !==
    undefined
  ) {
    validateEnergy(
      input.energy_level
    );

    updates.energy_level =
      input.energy_level;
  }

  if (
    input.entry_date !==
    undefined
  ) {
    updates.entry_date =
      input.entry_date;
  }

  if (
    input.is_favorite !==
    undefined
  ) {
    updates.is_favorite =
      input.is_favorite;
  }

  if (
    Object.keys(
      updates
    ).length === 0
  ) {
    return getJournalEntry(
      id
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      "journal_entries"
    )
    .update(updates)
    .eq(
      "id",
      id
    )
    .eq(
      "user_id",
      user.id
    )
    .select(
      `
        id,
        user_id,
        title,
        content,
        mood,
        energy_level,
        entry_date,
        is_favorite,
        created_at,
        updated_at
      `
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to update this reflection."
      )
    );
  }

  if (!data) {
    throw new Error(
      "This reflection could not be found."
    );
  }

  return data as JournalEntry;
}

export async function deleteJournalEntry(
  id: string
): Promise<void> {
  if (!id) {
    throw new Error(
      "Journal entry ID is required."
    );
  }

  const user =
    await requireUser();

  const {
    error,
  } = await supabase
    .from(
      "journal_entries"
    )
    .delete()
    .eq(
      "id",
      id
    )
    .eq(
      "user_id",
      user.id
    );

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to delete this reflection."
      )
    );
  }
}

export async function getRecentJournalEntries(
  limit = 3
): Promise<JournalEntry[]> {
  const user =
    await requireUser();

  const safeLimit =
    Math.max(
      1,
      Math.min(
        Math.floor(
          limit
        ),
        50
      )
    );

  const {
    data,
    error,
  } = await supabase
    .from(
      "journal_entries"
    )
    .select(
      `
        id,
        user_id,
        title,
        content,
        mood,
        energy_level,
        entry_date,
        is_favorite,
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
        ascending: false,
      }
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    )
    .limit(
      safeLimit
    );

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to load recent reflections."
      )
    );
  }

  return (
    data ?? []
  ) as JournalEntry[];
}

export async function getTodayJournalEntry(): Promise<
  JournalEntry | null
> {
  const user =
    await requireUser();

  const today =
    getLocalToday();

  const {
    data,
    error,
  } = await supabase
    .from(
      "journal_entries"
    )
    .select(
      `
        id,
        user_id,
        title,
        content,
        mood,
        energy_level,
        entry_date,
        is_favorite,
        created_at,
        updated_at
      `
    )
    .eq(
      "user_id",
      user.id
    )
    .eq(
      "entry_date",
      today
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to load today's reflection."
      )
    );
  }

  return (
    data as JournalEntry | null
  );
}

export async function getJournalEntryCount(): Promise<number> {
  const user =
    await requireUser();

  const {
    count,
    error,
  } = await supabase
    .from(
      "journal_entries"
    )
    .select(
      "id",
      {
        count: "exact",
        head: true,
      }
    )
    .eq(
      "user_id",
      user.id
    );

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to count your reflections."
      )
    );
  }

  return count ?? 0;
}

export async function getJournalStreak(): Promise<number> {
  const user =
    await requireUser();

  const {
    data,
    error,
  } = await supabase
    .from(
      "journal_entries"
    )
    .select(
      "entry_date"
    )
    .eq(
      "user_id",
      user.id
    )
    .order(
      "entry_date",
      {
        ascending: false,
      }
    );

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to calculate your reflection streak."
      )
    );
  }

  const dates =
    (
      data ?? []
    ).map(
      (entry) =>
        entry.entry_date
    );

  return getConsecutiveDateStreak(
    dates
  );
} 