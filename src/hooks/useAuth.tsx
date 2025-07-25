
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { secureLog } from '@/lib/utils';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Enhanced auth state listener with security checks
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        secureLog('Auth state changed:', { event, userId: session?.user?.id });
        
        // Validate session integrity
        if (session && !isValidSession(session)) {
          secureLog('Invalid session detected, signing out');
          await signOut();
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Initial session check with validation
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        secureLog('Session check error:', { error: error.message });
      }
      
      if (session && !isValidSession(session)) {
        secureLog('Invalid initial session, clearing');
        session = null;
      }
      
      secureLog('Initial session check');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Enhanced session validation
  const isValidSession = (session: Session): boolean => {
    if (!session || !session.user) return false;
    
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at;
    
    // Check if session is expired
    if (expiresAt && expiresAt < now) {
      secureLog('Session expired');
      return false;
    }
    
    // Check if session is about to expire (within 5 minutes)
    if (expiresAt && (expiresAt - now) < 300) {
      secureLog('Session expiring soon, refreshing');
      supabase.auth.refreshSession();
    }
    
    return true;
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Enhanced input validation
      if (!email || !password) {
        throw new Error('Email và mật khẩu không được để trống');
      }
      
      if (!isValidEmail(email)) {
        throw new Error('Email không hợp lệ');
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });
      
      if (error) {
        secureLog('Sign in error:', { error: error.message });
        // Map common auth errors to user-friendly messages
        const errorMessage = mapAuthError(error.message);
        return { error: { message: errorMessage } };
      }
      
      secureLog('Sign in successful');
      return { error: null };
    } catch (error: any) {
      secureLog('Sign in exception:', { error: error.message });
      return { error: { message: error.message } };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      // Enhanced input validation
      if (!email || !password) {
        throw new Error('Email và mật khẩu không được để trống');
      }
      
      if (!isValidEmail(email)) {
        throw new Error('Email không hợp lệ');
      }
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName ? fullName.trim() : '',
          }
        }
      });
      
      if (error) {
        secureLog('Sign up error:', { error: error.message });
        const errorMessage = mapAuthError(error.message);
        return { error: { message: errorMessage } };
      }
      
      secureLog('Sign up successful');
      return { error: null };
    } catch (error: any) {
      secureLog('Sign up exception:', { error: error.message });
      return { error: { message: error.message } };
    }
  };

  const signOut = async () => {
    secureLog('Signing out...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        secureLog('Sign out error:', { error: error.message });
        throw error;
      }
      secureLog('Successfully signed out');
      
      // Enhanced cleanup - clear all auth-related data
      setUser(null);
      setSession(null);
      
      // Clear any cached data that might contain sensitive information
      if (typeof window !== 'undefined') {
        // Clear localStorage items that might contain sensitive data
        const keysToRemove = ['supabase.auth.token', 'user-preferences'];
        keysToRemove.forEach(key => {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            // Ignore localStorage errors
          }
        });
      }
      
    } catch (error) {
      secureLog('Sign out failed:', { error });
      // Force clear local state even on error
      setUser(null);
      setSession(null);
    }
  };

  // Enhanced email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  };

  // Map auth errors to user-friendly messages
  const mapAuthError = (errorMessage: string): string => {
    const errorMap: { [key: string]: string } = {
      'Invalid login credentials': 'Email hoặc mật khẩu không đúng',
      'Email not confirmed': 'Email chưa được xác nhận',
      'Too many requests': 'Quá nhiều lần thử. Vui lòng thử lại sau',
      'User already registered': 'Email đã được đăng ký',
      'Password should be at least 6 characters': 'Mật khẩu phải có ít nhất 6 ký tự',
      'Invalid email': 'Email không hợp lệ',
      'Weak password': 'Mật khẩu quá yếu',
    };
    
    return errorMap[errorMessage] || 'Đã xảy ra lỗi. Vui lòng thử lại';
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
