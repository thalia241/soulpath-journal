export type SoulPathErrorKind =
  | "network"
  | "auth"
  | "not_found"
  | "permission"
  | "validation"
  | "unknown";

export type SoulPathErrorInfo = {
  kind: SoulPathErrorKind;
  message: string;
  retryable: boolean;
};

function getRawMessage(
  error: unknown
): string {
  if (
    error instanceof Error
  ) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (
      error as {
        message?: unknown;
      }
    ).message === "string"
  ) {
    return (
      error as {
        message: string;
      }
    ).message;
  }

  return "";
}

export function classifySoulPathError(
  error: unknown
): SoulPathErrorInfo {
  const raw =
    getRawMessage(error);

  const message =
    raw.toLowerCase();

  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes(
      "failed to fetch"
    ) ||
    message.includes(
      "load failed"
    ) ||
    message.includes(
      "network request failed"
    )
  ) {
    return {
      kind: "network",
      message:
        "SoulPath couldn't reach the server. Check your connection and try again.",
      retryable: true,
    };
  }

  if (
    message.includes(
      "session has expired"
    ) ||
    message.includes(
      "authentication required"
    ) ||
    message.includes(
      "not authenticated"
    ) ||
    message.includes(
      "invalid refresh token"
    ) ||
    message.includes(
      "refresh token"
    ) ||
    message.includes(
      "jwt"
    )
  ) {
    return {
      kind: "auth",
      message:
        "Your SoulPath session has ended. Please sign in again.",
      retryable: false,
    };
  }

  if (
    message.includes(
      "could not be found"
    ) ||
    message.includes(
      "not found"
    ) ||
    message.includes(
      "journal entry not found"
    )
  ) {
    return {
      kind: "not_found",
      message:
        "This record is no longer available. It may have been deleted.",
      retryable: false,
    };
  }

  if (
    message.includes(
      "permission"
    ) ||
    message.includes(
      "row-level security"
    ) ||
    message.includes("rls") ||
    message.includes(
      "not authorized"
    )
  ) {
    return {
      kind: "permission",
      message:
        "SoulPath couldn't access this record with your current account.",
      retryable: false,
    };
  }

  if (
    message.includes(
      "required"
    ) ||
    message.includes(
      "must be"
    ) ||
    message.includes(
      "characters"
    )
  ) {
    return {
      kind: "validation",
      message:
        raw ||
        "Some of the information needs attention.",
      retryable: false,
    };
  }

  return {
    kind: "unknown",
    message:
      raw ||
      "Something unexpected happened. Please try again.",
    retryable: true,
  };
} 