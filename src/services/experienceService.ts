import { supabase } from "../lib/supabase";

export type ExperienceType =
  | "dream"
  | "synchronicity";

export type Experience = {
  id: string;
  user_id: string;
  experience_type: ExperienceType;
  title: string;
  description: string;
  interpretation: string | null;
  significance_level: number | null;
  experienced_at: string;
  created_at: string;
  updated_at: string;
};

export type CreateExperienceInput = {
  experience_type: ExperienceType;
  title: string;
  description: string;
  interpretation?: string | null;
  significance_level?: number | null;
  experienced_at?: string;
};

export type UpdateExperienceInput = {
  experience_type?: ExperienceType;
  title?: string;
  description?: string;
  interpretation?: string | null;
  significance_level?: number | null;
  experienced_at?: string;
};

export async function getExperiences(
  type?: ExperienceType
) {
  let query = supabase
    .from("experiences")
    .select("*")
    .order("experienced_at", {
      ascending: false,
    });

  if (type) {
    query = query.eq(
      "experience_type",
      type
    );
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as Experience[];
}

export async function getExperience(
  id: string
) {
  const { data, error } = await supabase
    .from("experiences")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data as Experience;
}

export async function createExperience(
  input: CreateExperienceInput
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be signed in to record an experience."
    );
  }

  const { data, error } = await supabase
    .from("experiences")
    .insert({
      user_id: user.id,
      experience_type:
        input.experience_type,
      title: input.title,
      description: input.description,
      interpretation:
        input.interpretation ?? null,
      significance_level:
        input.significance_level ?? null,
      experienced_at:
        input.experienced_at ??
        new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Experience;
}

export async function updateExperience(
  id: string,
  input: UpdateExperienceInput
) {
  const { data, error } = await supabase
    .from("experiences")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Experience;
}

export async function deleteExperience(
  id: string
) {
  const { error } = await supabase
    .from("experiences")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function getExperienceCount() {
  const { count, error } = await supabase
    .from("experiences")
    .select("*", {
      count: "exact",
      head: true,
    });

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function getDreamCount() {
  const { count, error } = await supabase
    .from("experiences")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("experience_type", "dream");

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function getSynchronicityCount() {
  const { count, error } = await supabase
    .from("experiences")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq(
      "experience_type",
      "synchronicity"
    );

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function getRecentExperiences(
  limit = 3
) {
  const { data, error } = await supabase
    .from("experiences")
    .select("*")
    .order("experienced_at", {
      ascending: false,
    })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []) as Experience[];
} 