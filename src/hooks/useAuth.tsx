
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      } else {
        setUser(session?.user ?? null);
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (event === 'SIGNED_OUT') {
        toast({
          title: "Đã đăng xuất",
          description: "Bạn đã đăng xuất khỏi hệ thống.",
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        toast({
          title: "Lỗi đăng nhập",
          description: error.message === 'Invalid login credentials' 
            ? "Email hoặc mật khẩu không chính xác" 
            : error.message,
          variant: "destructive",
        });
        setLoading(false);
        return { data: null, error };
      }

      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn quay trở lại!",
      });

      setLoading(false);
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      toast({
        title: "Lỗi đăng nhập",
        description: "Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.",
        variant: "destructive",
      });
      setLoading(false);
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        toast({
          title: "Lỗi đăng ký",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
        return { data: null, error };
      }

      toast({
        title: "Đăng ký thành công",
        description: "Vui lòng kiểm tra email để xác thực tài khoản.",
      });

      setLoading(false);
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      toast({
        title: "Lỗi đăng ký",
        description: "Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.",
        variant: "destructive",
      });
      setLoading(false);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: "Lỗi đăng xuất",
          description: error.message,
          variant: "destructive",
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      toast({
        title: "Lỗi đăng xuất",
        description: "Có lỗi xảy ra khi đăng xuất.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Reset password error:', error);
        toast({
          title: "Lỗi đặt lại mật khẩu",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Đã gửi email",
        description: "Vui lòng kiểm tra email để đặt lại mật khẩu.",
      });

      return { error: null };
    } catch (error) {
      console.error('Unexpected reset password error:', error);
      toast({
        title: "Lỗi đặt lại mật khẩu",
        description: "Có lỗi xảy ra. Vui lòng thử lại.",
        variant: "destructive",
      });
      return { error };
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
}
