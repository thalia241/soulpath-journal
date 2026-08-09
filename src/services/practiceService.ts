import { supabase } from "../lib/supabase";

export type Practice = {
  id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  created_at: string;
};

export type EntryPractice = {
  id: string;
  entry_id: string;
  user_id: string;
  practice_id: string;
  duration_minutes: number | null;
  notes: string | null;
  created_at: string;
  practice?: Practice;
};

export async function getPractices() {
  const { data, error } = await supabase
    .from("practices")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data as Practice[];
}

export async function getEntryPractices(
  entryId: string
) {
  const { data, error } = await supabase
    .from("entry_practices")
    .select(`
      *,
      practice:practices(*)
    `)
    .eq("entry_id", entryId);

  if (error) {
    throw error;
  }

  return data as EntryPractice[];
}

export async function setEntryPractices(
  entryId: string,
  practiceIds: string[]
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be signed in to update practices."
    );
  }

  const { error: deleteError } = await supabase
    .from("entry_practices")
    .delete()
    .eq("entry_id", entryId);

  if (deleteError) {
    throw deleteError;
  }

  if (practiceIds.length === 0) {
    return;
  }

  const rows = practiceIds.map((practiceId) => ({
    entry_id: entryId,
    user_id: user.id,
    practice_id: practiceId,
  }));

  const { error: insertError } = await supabase
    .from("entry_practices")
    .insert(rows);

  if (insertError) {
    throw insertError;
  }
}

export async function getTodayPractices() {
  const today =
    new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("journal_entries")
    .select(`
      id,
      entry_practices (
        id,
        practice:practices (
          id,
          name,
          description,
          is_default,
          created_at
        )
      )
    `)
    .eq("entry_date", today)
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return [] as Practice[];
  }

  return (
    data.entry_practices
      ?.map((item: any) => item.practice)
      .filter(Boolean) ?? []
  ) as Practice[];
}

export async function getUniquePracticeCount() {
  const { data, error } = await supabase
    .from("entry_practices")
    .select("practice_id");

  if (error) {
    throw error;
  }

  return new Set(
    data.map((item) => item.practice_id)
  ).size;
} 