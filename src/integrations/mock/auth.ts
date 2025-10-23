import { mockDatabase } from "./database";
import { MockSession, MockUser } from "./types";

export type AuthChangeEvent = "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED";

interface AuthError {
  message: string;
}

interface AuthResponse {
  data: {
    user: MockUser | null;
    session: MockSession | null;
  };
  error: AuthError | null;
}

interface AuthSubscription {
  unsubscribe: () => void;
}

type AuthListener = (event: AuthChangeEvent, session: MockSession | null) => void;

export const MOCK_AUTH_STORAGE_KEY = "betacom.auth.session";
const STORAGE_KEY = MOCK_AUTH_STORAGE_KEY;

const listeners = new Set<AuthListener>();

let currentSession: MockSession | null = null;

const isSessionExpired = (session: MockSession | null) => {
  if (!session) return true;
  const now = Math.floor(Date.now() / 1000);
  return session.expires_at <= now;
};

const saveSessionToStorage = (session: MockSession | null) => {
  if (typeof window === "undefined") return;
  if (session) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
};

const loadSessionFromStorage = (): MockSession | null => {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as MockSession;
    if (isSessionExpired(parsed)) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch (error) {
    console.warn("Could not parse stored session:", error);
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

const updateCurrentSession = (session: MockSession | null) => {
  currentSession = session;
  saveSessionToStorage(session);
};

const emit = (event: AuthChangeEvent, session: MockSession | null) => {
  listeners.forEach((listener) => listener(event, session));
};

const ensureSessionLoaded = () => {
  if (!currentSession) {
    currentSession = loadSessionFromStorage();
  }
  if (currentSession && isSessionExpired(currentSession)) {
    updateCurrentSession(null);
  }
};

const createSessionForUser = (user: MockUser): MockSession => {
  const expiresIn = 60 * 60; // 1 hour
  const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
  return {
    access_token: `mock-access-${user.id}`,
    refresh_token: `mock-refresh-${user.id}`,
    token_type: "bearer",
    user,
    expires_in: expiresIn,
    expires_at: expiresAt,
  };
};

export const mockAuth = {
  async signInWithPassword(params: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const authUser = await mockDatabase.findAuthUserByEmail(params.email);
    if (!authUser || authUser.password !== params.password) {
      return {
        data: { user: null, session: null },
        error: { message: "Invalid login credentials" },
      };
    }

    const profile = await mockDatabase.getRawProfile(authUser.profile_id);
    if (!profile) {
      return {
        data: { user: null, session: null },
        error: { message: "User profile not found" },
      };
    }

    const user = mockDatabase.buildMockUser(profile);
    const session = createSessionForUser(user);
    updateCurrentSession(session);
    emit("SIGNED_IN", session);

    return {
      data: { user, session },
      error: null,
    };
  },

  async signOut(): Promise<{ error: AuthError | null }> {
    if (currentSession) {
      updateCurrentSession(null);
      emit("SIGNED_OUT", null);
    }
    return { error: null };
  },

  async getSession(): Promise<{ data: { session: MockSession | null }; error: AuthError | null }> {
    ensureSessionLoaded();
    return {
      data: { session: currentSession ? { ...currentSession } : null },
      error: null,
    };
  },

  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: MockSession | null) => void,
  ): { data: { subscription: AuthSubscription }; error: null } {
    listeners.add(callback);
    ensureSessionLoaded();
    if (currentSession) {
      callback("SIGNED_IN", { ...currentSession });
    }
    return {
      data: {
        subscription: {
          unsubscribe: () => listeners.delete(callback),
        },
      },
      error: null,
    };
  },
};
