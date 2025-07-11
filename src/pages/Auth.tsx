import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Sun, Moon } from 'lucide-react'; // Removed Monitor
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/ThemeProvider'; // Import useTheme
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import DropdownMenu components

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, user, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme(); // Use theme hook

  // Redirect if user is already logged in and auth state is settled
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/');
    }
  }, [user, navigate, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        let errorMessage = error.message;
        if (errorMessage.includes('Invalid login credentials')) {
          errorMessage = 'Sai mật khẩu hoặc email không tồn tại.';
        }
        toast({
          title: "Lỗi đăng nhập",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Đăng nhập thành công",
          description: "Bạn đã đăng nhập vào hệ thống.",
        });
        
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (error: any) {
      toast({
        title: "Có lỗi xảy ra",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-card/90 backdrop-blur-sm relative"> {/* Added relative for positioning */}
          <CardHeader className="text-center pb-8">
            {/* Theme Toggle Button */}
            <div className="absolute top-4 right-4">
              <Button variant="outline" size="icon" className="h-9 w-9" onClick={toggleTheme}>
                {theme === 'light' && <Sun className="h-[1.2rem] w-[1.2rem]" />}
                {theme === 'dark' && <Moon className="h-[1.2rem] w-[1.2rem]" />}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>

            <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <img 
                src="/lovable-uploads/f65c492e-4e6f-44d2-a9be-c90a71e944ea.png" 
                alt="Betacom Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            {/* Removed CardTitle with "BETACOM" text */}
            <CardDescription className="text-muted-foreground text-lg">
              Vui lòng đăng nhập để truy cập hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground text-base font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Nhập địa chỉ email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-foreground text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground text-base font-medium">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-12 text-foreground text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;