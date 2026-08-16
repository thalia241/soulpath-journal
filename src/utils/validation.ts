export type ValidationResult = {
  valid: boolean;
  message: string;
};

export function validateRequiredText(
  value: string,
  fieldName: string,
  options?: {
    minLength?: number;
    maxLength?: number;
  }
): ValidationResult {
  const cleaned =
    value.trim();

  if (!cleaned) {
    return {
      valid: false,
      message:
        `${fieldName} is required.`,
    };
  }

  if (
    options?.minLength &&
    cleaned.length <
      options.minLength
  ) {
    return {
      valid: false,
      message:
        `${fieldName} must be at least ${options.minLength} characters.`,
    };
  }

  if (
    options?.maxLength &&
    cleaned.length >
      options.maxLength
  ) {
    return {
      valid: false,
      message:
        `${fieldName} must be ${options.maxLength} characters or fewer.`,
    };
  }

  return {
    valid: true,
    message: "",
  };
}

export function validateEmail(
  email: string
): ValidationResult {
  const cleaned =
    email
      .trim()
      .toLowerCase();

  if (!cleaned) {
    return {
      valid: false,
      message:
        "Email is required.",
    };
  }

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    !emailPattern.test(
      cleaned
    )
  ) {
    return {
      valid: false,
      message:
        "Enter a valid email address.",
    };
  }

  return {
    valid: true,
    message: "",
  };
}

export function validatePassword(
  password: string
): ValidationResult {
  if (!password) {
    return {
      valid: false,
      message:
        "Password is required.",
    };
  }

  if (
    password.length < 8
  ) {
    return {
      valid: false,
      message:
        "Password must contain at least 8 characters.",
    };
  }

  if (
    password.length >
    128
  ) {
    return {
      valid: false,
      message:
        "Password is too long.",
    };
  }

  return {
    valid: true,
    message: "",
  };
}

export function validateMatchingPasswords(
  password: string,
  confirmation: string
): ValidationResult {
  if (
    password !==
    confirmation
  ) {
    return {
      valid: false,
      message:
        "The passwords do not match.",
    };
  }

  return {
    valid: true,
    message: "",
  };
}

export function validateDisplayName(
  name: string
): ValidationResult {
  const cleaned =
    name.trim();

  if (!cleaned) {
    return {
      valid: false,
      message:
        "Choose a name for SoulPath to call you.",
    };
  }

  if (
    cleaned.length > 60
  ) {
    return {
      valid: false,
      message:
        "Display name must be 60 characters or fewer.",
    };
  }

  return {
    valid: true,
    message: "",
  };
}

export function validateJournalTitle(
  title: string
): ValidationResult {
  return validateRequiredText(
    title,
    "Reflection title",
    {
      maxLength: 120,
    }
  );
}

export function validateJournalContent(
  content: string
): ValidationResult {
  return validateRequiredText(
    content,
    "Reflection",
    {
      maxLength: 20000,
    }
  );
}

export function validateExperienceTitle(
  title: string
): ValidationResult {
  return validateRequiredText(
    title,
    "Title",
    {
      maxLength: 120,
    }
  );
}

export function validateExperienceDescription(
  description: string
): ValidationResult {
  return validateRequiredText(
    description,
    "Description",
    {
      maxLength: 20000,
    }
  );
}

export function validateOptionalReflection(
  reflection: string
): ValidationResult {
  if (
    reflection.trim()
      .length >
    10000
  ) {
    return {
      valid: false,
      message:
        "Personal reflection must be 10,000 characters or fewer.",
    };
  }

  return {
    valid: true,
    message: "",
  };
}

export function validateEnergyLevel(
  value: number | null
): ValidationResult {
  if (
    value === null
  ) {
    return {
      valid: true,
      message: "",
    };
  }

  if (
    value < 1 ||
    value > 5
  ) {
    return {
      valid: false,
      message:
        "Energy must be between 1 and 5.",
    };
  }

  return {
    valid: true,
    message: "",
  };
}

export function validateSignificanceLevel(
  value: number | null
): ValidationResult {
  if (
    value === null
  ) {
    return {
      valid: true,
      message: "",
    };
  }

  if (
    value < 1 ||
    value > 5
  ) {
    return {
      valid: false,
      message:
        "Significance must be between 1 and 5.",
    };
  }

  return {
    valid: true,
    message: "",
  };
} 