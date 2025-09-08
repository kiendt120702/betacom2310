import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Lỗi đăng nhập",
          description: error.message,
          variant: "destructive",
        });
      } else if (data.user) {
        toast({
          title: "Đăng nhập thành công",
          description: "Chào mừng bạn quay trở lại!",
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi đăng nhập",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-background relative overflow-hidden">
        {/* Logo and branding */}
        <div className="flex flex-col items-center justify-center w-full">
          <div className="text-center">
            <img
              src="/lovable-uploads/f65c492e-4e6f-44d2-a9be-c90a71e944ea.png"
              alt="Logo"
              className="w-48 h-48 mx-auto mb-12 object-contain"
            />
            <h1 className="text-6xl font-bold text-red-600 dark:text-red-500 tracking-wide">
              BEATCOM
            </h1>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-background px-8 py-12 relative">
        {/* Theme toggle button */}
        <div className="absolute top-6 right-6">
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        {/* Login form */}
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            {/* Mobile logo */}
            <div className="lg:hidden mb-8">
              <img
                src="/lovable-uploads/f65c492e-4e6f-44d2-a9be-c90a71e944ea.png"
                alt="Logo"
                className="w-24 h-24 mx-auto mb-4 object-contain"
              />
              <h1 className="text-2xl font-bold text-red-600 dark:text-red-500 tracking-wide">
                BEATCOM
              </h1>
            </div>
            
            <h2 className="text-3xl font-bold text-foreground tracking-wide">
              WELCOME
            </h2>
            <p className="text-muted-foreground text-lg">
              Đăng nhập vào tài khoản của bạn
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-base border-2 focus:border-red-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 text-base border-2 focus:border-red-500 transition-colors"
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full h-12 text-base font-bold tracking-wide bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white"
              disabled={loading}
            >
              {loading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}