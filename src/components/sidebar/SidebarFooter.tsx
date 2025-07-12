import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, User, Sun, Moon, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/components/ThemeProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

export function SidebarFooter() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data: userProfile, isLoading } = useUserProfile();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { state } = useSidebar();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Đăng xuất thành công",
        description: "Bạn đã đăng xuất khỏi hệ thống.",
      });
      navigate('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Lỗi đăng xuất",
        description: "Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại.",
        variant: "destructive",
      });
      navigate('/auth');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Collapsed state
  if (state === 'collapsed') {
    return (
      <div className="flex flex-col items-center gap-2 p-2 border-t border-border mt-auto">
        {isLoading ? (
          <Skeleton className="h-9 w-9 rounded-full" />
        ) : userProfile ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <div className="w-full h-full bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                    {userProfile.full_name?.charAt(0).toUpperCase() || userProfile.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="bg-popover border-border z-50 min-w-[200px]">
                <DropdownMenuItem onClick={() => navigate('/management#my-profile')} className="text-popover-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  <User className="mr-2 h-4 w-4" />
                  Hồ sơ của tôi
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/management')} className="text-popover-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  <Settings className="mr-2 h-4 w-4" />
                  Cài đặt
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-foreground" onClick={toggleTheme}>
              {theme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Đăng xuất</span>
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-foreground" onClick={toggleTheme}>
              {theme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/auth')}>
              <LogOut className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>
    );
  }

  // Expanded state
  return (
    <div className="p-3 border-t border-border mt-auto space-y-2">
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ) : userProfile ? (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full flex items-center justify-start gap-2 px-2 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground h-auto">
                <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                  {userProfile.full_name?.charAt(0).toUpperCase() || userProfile.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 truncate text-left">
                  <p className="font-semibold truncate">{userProfile.full_name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{userProfile.role}</p> {/* Hiển thị chức vụ */}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="bg-popover border-border z-50 min-w-[220px] w-[calc(var(--sidebar-width)_-_1.5rem)] ml-3 mb-2">
              <DropdownMenuItem onClick={() => navigate('/management#my-profile')} className="text-popover-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                <User className="mr-2 h-4 w-4" />
                Hồ sơ của tôi
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/management')} className="text-popover-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                <Settings className="mr-2 h-4 w-4" />
                Cài đặt
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" className="w-full justify-between items-center" onClick={toggleTheme}>
            <span className="text-sm text-muted-foreground">Giao diện</span>
            <div className="flex items-center">
              {theme === 'light' ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
            </div>
          </Button>
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </Button>
        </>
      ) : (
        <>
          <Button variant="ghost" className="w-full justify-between items-center" onClick={toggleTheme}>
            <span className="text-sm text-muted-foreground">Giao diện</span>
            <div className="flex items-center">
              {theme === 'light' ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
            </div>
          </Button>
          <Button
            onClick={() => navigate('/auth')}
            variant="outline"
            className="w-full"
          >
            Đăng nhập
          </Button>
        </>
      )}
    </div>
  );
}