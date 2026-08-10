import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AppState,
  AppStateStatus,
} from "react-native";

import {
  Session,
} from "@supabase/supabase-js";

import {
  supabase,
} from "../lib/supabase";

type AuthExitReason =
  | "none"
  | "expired";

type AuthContextValue = {
  session: Session | null;

  loading: boolean;

  authExitReason:
    AuthExitReason;

  validateSession:
    () => Promise<boolean>;

  recoverSession:
    () => Promise<boolean>;

  acknowledgeAuthExit:
    () => void;
};

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined
  );

function getErrorMessage(
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

function isTerminalAuthError(
  error: unknown
): boolean {
  const message =
    getErrorMessage(error)
      .toLowerCase();

  return (
    message.includes(
      "invalid refresh token"
    ) ||
    message.includes(
      "refresh token not found"
    ) ||
    message.includes(
      "refresh_token_not_found"
    ) ||
    message.includes(
      "invalid jwt"
    ) ||
    message.includes(
      "jwt expired"
    )
  );
}

function isNetworkError(
  error: unknown
): boolean {
  const message =
    getErrorMessage(error)
      .toLowerCase();

  return (
    message.includes("network") ||
    message.includes(
      "failed to fetch"
    ) ||
    message.includes(
      "network request failed"
    ) ||
    message.includes(
      "load failed"
    )
  );
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    session,
    setSession,
  ] =
    useState<Session | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    authExitReason,
    setAuthExitReason,
  ] =
    useState<AuthExitReason>(
      "none"
    );

  const sessionRef =
    useRef<Session | null>(
      null
    );

  const mountedRef =
    useRef(true);

  const updateSession =
    useCallback(
      (
        nextSession:
          Session | null
      ) => {
        sessionRef.current =
          nextSession;

        if (
          mountedRef.current
        ) {
          setSession(
            nextSession
          );
        }
      },
      []
    );

  const expireSession =
    useCallback(() => {
      sessionRef.current =
        null;

      if (
        mountedRef.current
      ) {
        setAuthExitReason(
          "expired"
        );

        setSession(null);
      }
    }, []);

  /*
   * Lightweight session validation.
   *
   * getSession() can refresh an expired access token
   * when a valid refresh token is available.
   *
   * A network outage does NOT immediately throw the
   * user out of SoulPath.
   */
  const validateSession =
    useCallback(
      async (): Promise<boolean> => {
        try {
          const {
            data,
            error,
          } =
            await supabase.auth.getSession();

          if (error) {
            if (
              isTerminalAuthError(
                error
              )
            ) {
              expireSession();

              return false;
            }

            /*
             * If we're simply offline, preserve the
             * locally known session.
             */
            if (
              isNetworkError(
                error
              )
            ) {
              return Boolean(
                sessionRef.current
              );
            }

            console.warn(
              "Unable to validate SoulPath session:",
              error
            );

            return Boolean(
              sessionRef.current
            );
          }

          if (!data.session) {
            /*
             * If we previously had a session and now
             * Supabase reports none, treat this as an
             * ended session.
             */
            if (
              sessionRef.current
            ) {
              expireSession();
            } else {
              updateSession(
                null
              );
            }

            return false;
          }

          updateSession(
            data.session
          );

          return true;
        } catch (error) {
          if (
            isTerminalAuthError(
              error
            )
          ) {
            expireSession();

            return false;
          }

          console.warn(
            "Unexpected session validation error:",
            error
          );

          return Boolean(
            sessionRef.current
          );
        }
      },
      [
        expireSession,
        updateSession,
      ]
    );

  /*
   * Stronger recovery path.
   *
   * Use this when a real Supabase request reports an
   * authentication problem. It forces an attempt to
   * obtain a fresh session rather than trusting only
   * the currently stored access token.
   */
  const recoverSession =
    useCallback(
      async (): Promise<boolean> => {
        try {
          const {
            data,
            error,
          } =
            await supabase.auth.refreshSession();

          if (error) {
            if (
              isTerminalAuthError(
                error
              )
            ) {
              expireSession();

              return false;
            }

            if (
              isNetworkError(
                error
              )
            ) {
              return Boolean(
                sessionRef.current
              );
            }

            console.warn(
              "Unable to recover SoulPath session:",
              error
            );

            return Boolean(
              sessionRef.current
            );
          }

          if (!data.session) {
            expireSession();

            return false;
          }

          updateSession(
            data.session
          );

          return true;
        } catch (error) {
          if (
            isTerminalAuthError(
              error
            )
          ) {
            expireSession();

            return false;
          }

          console.warn(
            "Unexpected session recovery error:",
            error
          );

          return Boolean(
            sessionRef.current
          );
        }
      },
      [
        expireSession,
        updateSession,
      ]
    );

  const acknowledgeAuthExit =
    useCallback(() => {
      setAuthExitReason(
        "none"
      );
    }, []);

  useEffect(() => {
    mountedRef.current =
      true;

    /*
     * Subscribe first so we don't miss an auth change
     * while the initial session is being read.
     */
    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (
          event,
          nextSession
        ) => {
          if (
            !mountedRef.current
          ) {
            return;
          }

          if (
            event ===
            "SIGNED_OUT"
          ) {
            updateSession(
              null
            );

            setLoading(
              false
            );

            return;
          }

          if (nextSession) {
            updateSession(
              nextSession
            );

            setAuthExitReason(
              "none"
            );
          }

          if (
            event ===
              "INITIAL_SESSION" ||
            event ===
              "SIGNED_IN" ||
            event ===
              "TOKEN_REFRESHED" ||
            event ===
              "USER_UPDATED"
          ) {
            setLoading(
              false
            );
          }
        }
      );

    async function bootstrap() {
      try {
        const {
          data,
          error,
        } =
          await supabase.auth.getSession();

        if (
          !mountedRef.current
        ) {
          return;
        }

        if (error) {
          if (
            isTerminalAuthError(
              error
            )
          ) {
            expireSession();
          } else {
            console.warn(
              "Unable to restore SoulPath session:",
              error
            );
          }

          return;
        }

        updateSession(
          data.session ??
            null
        );
      } catch (error) {
        console.warn(
          "Unexpected SoulPath auth bootstrap error:",
          error
        );
      } finally {
        if (
          mountedRef.current
        ) {
          setLoading(
            false
          );
        }
      }
    }

    void bootstrap();

    return () => {
      mountedRef.current =
        false;

      subscription.unsubscribe();
    };
  }, [
    expireSession,
    updateSession,
  ]);

  /*
   * Recheck auth whenever SoulPath returns to the
   * foreground.
   *
   * This catches cases such as:
   * - app sat suspended for hours
   * - token expired while backgrounded
   * - refresh token was revoked
   */
  useEffect(() => {
    function handleAppState(
      state: AppStateStatus
    ) {
      if (
        state === "active"
      ) {
        void validateSession();
      }
    }

    const subscription =
      AppState.addEventListener(
        "change",
        handleAppState
      );

    return () => {
      subscription.remove();
    };
  }, [
    validateSession,
  ]);

  return (
    <AuthContext.Provider
      value={{
        session,

        loading,

        authExitReason,

        validateSession,

        recoverSession,

        acknowledgeAuthExit,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(
      AuthContext
    );

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
} 