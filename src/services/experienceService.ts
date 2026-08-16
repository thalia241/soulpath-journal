import {
  supabase,
} from "../lib/supabase";

export type ExperienceType =
  | "dream"
  | "synchronicity";

export type Experience = {
  id: string;

  user_id: string;

  experience_type:
    ExperienceType;

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

export type CreateExperienceInput = {
  experience_type:
    ExperienceType;

  title: string;

  description: string;

  interpretation?:
    | string
    | null;

  significance_level?:
    | number
    | null;

  experienced_at?: string;
};

export type UpdateExperienceInput = {
  experience_type?:
    ExperienceType;

  title?: string;

  description?: string;

  interpretation?:
    | string
    | null;

  significance_level?:
    | number
    | null;

  experienced_at?: string;
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
  fieldName: string,
  maxLength: number
) {
  const cleaned =
    value.trim();

  if (!cleaned) {
    throw new Error(
      `${fieldName} is required.`
    );
  }

  if (
    cleaned.length >
    maxLength
  ) {
    throw new Error(
      `${fieldName} must be ${maxLength} characters or fewer.`
    );
  }

  return cleaned;
}

function validateType(
  type: ExperienceType
) {
  if (
    type !== "dream" &&
    type !==
      "synchronicity"
  ) {
    throw new Error(
      "Experience type is invalid."
    );
  }
}

function validateSignificance(
  value:
    | number
    | null
    | undefined
) {
  if (
    value === null ||
    value === undefined
  ) {
    return;
  }

  if (
    !Number.isInteger(
      value
    ) ||
    value < 1 ||
    value > 5
  ) {
    throw new Error(
      "Significance must be between 1 and 5."
    );
  }
}

function cleanInterpretation(
  value:
    | string
    | null
    | undefined
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const cleaned =
    value.trim();

  if (
    cleaned.length >
    10000
  ) {
    throw new Error(
      "Personal reflection must be 10,000 characters or fewer."
    );
  }

  return cleaned || null;
}

const experienceFields = `
  id,
  user_id,
  experience_type,
  title,
  description,
  interpretation,
  significance_level,
  experienced_at,
  created_at,
  updated_at
`;

export async function getExperiences(): Promise<
  Experience[]
> {
  const user =
    await requireUser();

  const {
    data,
    error,
  } = await supabase
    .from("experiences")
    .select(
      experienceFields
    )
    .eq(
      "user_id",
      user.id
    )
    .order(
      "experienced_at",
      {
        ascending: false,
      }
    );

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to load your dreams and signs."
      )
    );
  }

  return (
    data ?? []
  ) as Experience[];
}

export async function getExperience(
  id: string
): Promise<Experience> {
  if (!id) {
    throw new Error(
      "Experience ID is required."
    );
  }

  const user =
    await requireUser();

  const {
    data,
    error,
  } = await supabase
    .from("experiences")
    .select(
      experienceFields
    )
    .eq("id", id)
    .eq(
      "user_id",
      user.id
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to open this memory."
      )
    );
  }

  if (!data) {
    throw new Error(
      "This memory could not be found."
    );
  }

  return data as Experience;
}

export async function createExperience(
  input: CreateExperienceInput
): Promise<Experience> {
  const user =
    await requireUser();

  validateType(
    input.experience_type
  );

  validateSignificance(
    input.significance_level
  );

  const title =
    cleanRequiredText(
      input.title,
      "Title",
      120
    );

  const description =
    cleanRequiredText(
      input.description,
      "Description",
      20000
    );

  const interpretation =
    cleanInterpretation(
      input.interpretation
    );

  const {
    data,
    error,
  } = await supabase
    .from("experiences")
    .insert({
      user_id:
        user.id,

      experience_type:
        input.experience_type,

      title,

      description,

      interpretation,

      significance_level:
        input.significance_level ??
        null,

      experienced_at:
        input.experienced_at ??
        new Date().toISOString(),
    })
    .select(
      experienceFields
    )
    .single();

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to save this memory."
      )
    );
  }

  return data as Experience;
}

export async function updateExperience(
  id: string,
  input: UpdateExperienceInput
): Promise<Experience> {
  if (!id) {
    throw new Error(
      "Experience ID is required."
    );
  }

  const user =
    await requireUser();

  const updates: Record<
    string,
    unknown
  > = {};

  if (
    input.experience_type !==
    undefined
  ) {
    validateType(
      input.experience_type
    );

    updates.experience_type =
      input.experience_type;
  }

  if (
    input.title !==
    undefined
  ) {
    updates.title =
      cleanRequiredText(
        input.title,
        "Title",
        120
      );
  }

  if (
    input.description !==
    undefined
  ) {
    updates.description =
      cleanRequiredText(
        input.description,
        "Description",
        20000
      );
  }

  if (
    input.interpretation !==
    undefined
  ) {
    updates.interpretation =
      cleanInterpretation(
        input.interpretation
      );
  }

  if (
    input.significance_level !==
    undefined
  ) {
    validateSignificance(
      input.significance_level
    );

    updates.significance_level =
      input.significance_level;
  }

  if (
    input.experienced_at !==
    undefined
  ) {
    updates.experienced_at =
      input.experienced_at;
  }

  if (
    Object.keys(
      updates
    ).length === 0
  ) {
    return getExperience(
      id
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("experiences")
    .update(updates)
    .eq("id", id)
    .eq(
      "user_id",
      user.id
    )
    .select(
      experienceFields
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to update this memory."
      )
    );
  }

  if (!data) {
    throw new Error(
      "This memory could not be found."
    );
  }

  return data as Experience;
}

export async function deleteExperience(
  id: string
): Promise<void> {
  if (!id) {
    throw new Error(
      "Experience ID is required."
    );
  }

  const user =
    await requireUser();

  const {
    error,
  } = await supabase
    .from("experiences")
    .delete()
    .eq("id", id)
    .eq(
      "user_id",
      user.id
    );

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to delete this memory."
      )
    );
  }
}

export async function getDreamCount(): Promise<number> {
  const user =
    await requireUser();

  const {
    count,
    error,
  } = await supabase
    .from("experiences")
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
    )
    .eq(
      "experience_type",
      "dream"
    );

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to count your dreams."
      )
    );
  }

  return count ?? 0;
}

export async function getSynchronicityCount(): Promise<number> {
  const user =
    await requireUser();

  const {
    count,
    error,
  } = await supabase
    .from("experiences")
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
    )
    .eq(
      "experience_type",
      "synchronicity"
    );

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to count your signs."
      )
    );
  }

  return count ?? 0;
} 