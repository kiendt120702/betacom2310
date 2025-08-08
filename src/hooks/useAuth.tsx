import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { secureLog } from "@/lib/utils";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    fullName?: string,
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to convert any error to AuthError
const createAuthError = (err: unknown, defaultMessage: string = "An unexpected error occurred"): AuthError => {
  if (err instanceof AuthError) {
    return err;
  }
  if (err instanceof Error) {
    // Use the message from the standard Error, provide default status/code
    return new AuthError(err.message, 500, 'UNKNOWN_ERROR');
  }
  // Fallback for non-Error objects
  return new AuthError(String(err) || defaultMessage, 500, 'UNKNOWN_ERROR');
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      secureLog("Auth state changed:", { event, userId: session?.user?.id });

      if (session && !isValidSession(session)) {
        secureLog("Invalid session detected, signing out");
        await signOut();
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        secureLog("Initial session check error:", { error: error.message });
      }

      if (session && !isValidSession(session)) {
        secureLog("Invalid initial session, clearing");
        session = null;
      }

      secureLog("Initial session check completed");
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auto logout on inactivity
  useEffect(() => {
    if (!user) return;

    let inactivityTimer: NodeJS.Timeout;
    
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        secureLog("Auto logout due to inactivity");
        signOut();
      }, 30 * 60 * 1000); // 30 minutes
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    resetTimer(); // Initialize timer

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [user]);

  const isValidSession = (session: Session): boolean => {
    if (!session || !session.user) return false;

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at;

    if (expiresAt && expiresAt < now) {
      secureLog("Session expired");
      return false;
    }

    if (expiresAt && expiresAt - now < 300) {
      secureLog("Session expiring soon, refreshing");
      supabase.auth.refreshSession();
    }

    return true;
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      if (!email || !password) {
        throw new Error("Email và mật khẩu không được để trống");
      }
      if (!isValidEmail(email)) {
        throw new Error("Email không hợp lệ");
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
        options: {
          // Nếu không remember me, session sẽ expire khi đóng browser
          persistSession: rememberMe
        }
      });

      if (error) {
        secureLog("Sign in error from Supabase:", { error: error.message });
        const errorMessage = mapAuthError(error.message);
        // Return the original AuthError if it exists, otherwise create a new one
        return { error: createAuthError(error, errorMessage) };
      }

      secureLog("Sign in successful");
      return { error: null };
    } catch (error: unknown) {
      const authError = createAuthError(error, "Đăng nhập thất bại. Vui lòng thử lại.");
      secureLog("Sign in exception caught:", { error: authError.message });
      return { error: authError };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      if (!email || !password) {
        throw new Error("Email và mật khẩu không được để trống");
      }
      if (!isValidEmail(email)) {
        throw new Error("Email không hợp lệ");
      }

      const redirectUrl = `${window.location.origin}/`;

      const { error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName ? fullName.trim() : "",
          },
        },
      });

      if (error) {
        secureLog("Sign up error from Supabase:", { error: error.message });
        const errorMessage = mapAuthError(error.message);
        // Return the original AuthError if it exists, otherwise create a new one
        return { error: createAuthError(error, errorMessage) };
      }

      secureLog("Sign up successful");
      return { error: null };
    } catch (error: unknown) {
      const authError = createAuthError(error, "Đăng ký thất bại. Vui lòng thử lại.");
      secureLog("Sign up exception caught:", { error: authError.message });
      return { error: authError };
    }
  };

  const signOut = async () => {
    secureLog("Signing out...");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        secureLog("Sign out error:", { error: error.message });
        throw error;
      }
      secureLog("Successfully signed out");

      setUser(null);
      setSession(null);

      if (typeof window !== "undefined") {
        const keysToRemove = ["supabase.auth.token", "user-preferences"];
        keysToRemove.forEach((key) => {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            // Ignore localStorage errors
          }
        });
      }
    } catch (error) {
      secureLog("Sign out failed:", { error });
      setUser(null);
      setSession(null);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  };

  const mapAuthError = (errorMessage: string): string => {
    const errorMap: { [key: string]: string } = {
      "Invalid login credentials": "Email hoặc mật khẩu không đúng",
      "Email not confirmed": "Email chưa được xác nhận",
      "Too many requests": "Quá nhiều lần thử. Vui lòng thử lại sau",
      "User already registered": "Email đã được đăng ký",
      "Password should be at least 6 characters":
        "Mật khẩu phải có ít nhất 6 ký tự",
      "Invalid email": "Email không hợp lệ",
      "Weak password": "Mật khẩu quá yếu",
    };

    return errorMap[errorMessage] || "Đã xảy ra lỗi. Vui lòng thử lại";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};