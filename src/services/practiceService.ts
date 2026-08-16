import { supabase } from "../lib/supabase";
import { getLocalToday } from "../utils/date";

export type Practice = {
  id: string;
  name: string;
  description:
    | string
    | null;
  is_default: boolean;
  created_at: string;
};

export type EntryPractice = {
  id: string;
  entry_id: string;
  user_id: string;
  practice_id: string;
  duration_minutes:
    | number
    | null;
  notes:
    | string
    | null;
  created_at: string;

  practice:
    | {
        id: string;
        name: string;
      }
    | null;
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
    "message" in error &&
    typeof (
      error as {
        message?: unknown;
      }
    ).message ===
      "string"
  ) {
    return (
      error as {
        message: string;
      }
    ).message;
  }

  return fallback;
}

export async function getPractices(): Promise<
  Practice[]
> {
  const {
    data,
    error,
  } = await supabase
    .from("practices")
    .select(
      `
        id,
        name,
        description,
        is_default,
        created_at
      `
    )
    .order("name", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to load spiritual practices."
      )
    );
  }

  return (
    data ?? []
  ) as Practice[];
}

export async function getEntryPractices(
  entryId: string
): Promise<EntryPractice[]> {
  if (!entryId) {
    throw new Error(
      "Journal entry ID is required."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      "entry_practices"
    )
    .select(
      `
        id,
        entry_id,
        user_id,
        practice_id,
        duration_minutes,
        notes,
        created_at,
        practice:practices (
          id,
          name
        )
      `
    )
    .eq(
      "entry_id",
      entryId
    )
    .order(
      "created_at",
      {
        ascending: true,
      }
    );

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to load practices for this reflection."
      )
    );
  }

  return (
    data ?? []
  ) as unknown as EntryPractice[];
}

export async function setEntryPractices(
  entryId: string,
  practiceIds: string[]
): Promise<void> {
  if (!entryId) {
    throw new Error(
      "Journal entry ID is required."
    );
  }

  const uniquePracticeIds =
    Array.from(
      new Set(
        practiceIds.filter(
          Boolean
        )
      )
    );

  const {
    error,
  } =
    await supabase.rpc(
      "set_entry_practices_atomic",
      {
        p_entry_id:
          entryId,

        p_practice_ids:
          uniquePracticeIds,
      }
    );

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to update spiritual practices."
      )
    );
  }
}

export async function getTodayPractices(): Promise<
  Practice[]
> {
  const {
    data: {
      user,
    },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    return [];
  }

  const today =
    getLocalToday();

  const {
    data: entry,
    error: entryError,
  } = await supabase
    .from(
      "journal_entries"
    )
    .select("id")
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

  if (entryError) {
    throw new Error(
      getErrorMessage(
        entryError,
        "Unable to locate today's reflection."
      )
    );
  }

  if (!entry) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      "entry_practices"
    )
    .select(
      `
        practice:practices (
          id,
          name,
          description,
          is_default,
          created_at
        )
      `
    )
    .eq(
      "entry_id",
      entry.id
    );

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to load today's practices."
      )
    );
  }

  return (
    data ?? []
  )
    .map(
      (item: any) =>
        Array.isArray(
          item.practice
        )
          ? item
              .practice[0]
          : item.practice
    )
    .filter(
      Boolean
    ) as Practice[];
}

export async function getUniquePracticeCount(): Promise<number> {
  const {
    data: {
      user,
    },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    return 0;
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      "entry_practices"
    )
    .select(
      "practice_id"
    )
    .eq(
      "user_id",
      user.id
    );

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to count your practices."
      )
    );
  }

  return new Set(
    (
      data ?? []
    ).map(
      (item) =>
        item.practice_id
    )
  ).size;
} 