import { supabase } from "../lib/supabase";

export type JournalEntry = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood: string | null;
  energy_level: number | null;
  entry_date: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateJournalEntryInput = {
  title: string;
  content: string;
  mood?: string | null;
  energy_level?: number | null;
  entry_date?: string;
};

export type UpdateJournalEntryInput = {
  title?: string;
  content?: string;
  mood?: string | null;
  energy_level?: number | null;
  entry_date?: string;
  is_favorite?: boolean;
};

export async function getJournalEntries() {
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data as JournalEntry[];
}

export async function getJournalEntry(id: string) {
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data as JournalEntry;
}

export async function createJournalEntry(
  input: CreateJournalEntryInput
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be signed in to create an entry.");
  }

  const { data, error } = await supabase
    .from("journal_entries")
    .insert({
      user_id: user.id,
      title: input.title,
      content: input.content,
      mood: input.mood ?? null,
      energy_level: input.energy_level ?? null,
      entry_date:
        input.entry_date ??
        new Date().toISOString().slice(0, 10),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as JournalEntry;
}

export async function updateJournalEntry(
  id: string,
  input: UpdateJournalEntryInput
) {
  const { data, error } = await supabase
    .from("journal_entries")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as JournalEntry;
}

export async function deleteJournalEntry(id: string) {
  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
} 

export async function getRecentJournalEntries(limit = 3) {
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data as JournalEntry[];
}

export async function getJournalEntryCount() {
  const { count, error } = await supabase
    .from("journal_entries")
    .select("*", {
      count: "exact",
      head: true,
    });

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function getTodayJournalEntry() {
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("entry_date", today)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as JournalEntry | null;
} 

export async function getJournalStreak() {
  const { data, error } = await supabase
    .from("journal_entries")
    .select("entry_date")
    .order("entry_date", { ascending: false });

  if (error) {
    throw error;
  }

  const uniqueDates = [
    ...new Set(data.map((item) => item.entry_date)),
  ];

  if (uniqueDates.length === 0) {
    return 0;
  }

  const dateSet = new Set(uniqueDates);

  const today = new Date();
  const current = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const formatDate = (date: Date) =>
    `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  // If there isn't an entry today, allow the streak to
  // continue from yesterday.
  if (!dateSet.has(formatDate(current))) {
    current.setDate(current.getDate() - 1);
  }

  let streak = 0;

  while (dateSet.has(formatDate(current))) {
    streak += 1;
    current.setDate(current.getDate() - 1);
  }

  return streak;
} 