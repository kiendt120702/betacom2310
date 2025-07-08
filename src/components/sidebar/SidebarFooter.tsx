import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Sun, Moon, Monitor, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useTheme } from '@/components/ThemeProvider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { SidebarFooter as SidebarFooterBase, useSidebar } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils'; // Added import for cn

export function SidebarFooter() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { data: userProfile } = useUserProfile();
  const { theme, setTheme } = useTheme();
  const { state } = useSidebar();
  const { toast } = useToast();

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

  return (
    <SidebarFooterBase className="border-t border-gray-100 p-4 space-y-4">
      {/* Theme Toggle */}
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "w-full h-10 text-sm border-gray-200 hover:bg-gray-50 rounded-lg",
                state === 'expanded' ? 'justify-start px-4' : 'justify-center px-0'
              )}
            >
              {theme === 'light' && <Sun className="w-4 h-4" />}
              {theme === 'dark' && <Moon className="w-4 h-4" />}
              {theme === 'system' && <Monitor className="w-4 h-4" />}
              {state === 'expanded' && (
                <span className="ml-3 truncate">
                  {theme === 'light' && 'Sáng'}
                  {theme === 'dark' && 'Tối'}
                  {theme === 'system' && 'Hệ thống'}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => setTheme('light')}>
              <Sun className="w-4 h-4 mr-2" />
              Sáng
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              <Moon className="w-4 h-4 mr-2" />
              Tối
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              <Monitor className="w-4 h-4 mr-2" />
              Hệ thống
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* User Profile Card */}
      {userProfile && (
        <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
          {state === 'expanded' ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                {userProfile.full_name?.charAt(0).toUpperCase() || userProfile.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate text-sm">
                  {userProfile.full_name || 'User'}
                </div>
                <div className="text-xs text-gray-500 truncate capitalize">
                  {userProfile.role}
                  {userProfile.teams?.name && (
                    <span className="text-gray-400"> • {userProfile.teams.name}</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">
                {userProfile.full_name?.charAt(0).toUpperCase() || userProfile.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Auth Button */}
      {user ? (
        <Button
          onClick={handleSignOut}
          variant="outline"
          size="sm"
          className={cn(
            "w-full h-10 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 rounded-lg",
            state === 'expanded' ? 'justify-start px-4' : 'justify-center px-0'
          )}
        >
          <LogOut className="w-4 h-4" />
          {state === 'expanded' && <span className="ml-3 truncate">Đăng xuất</span>}
        </Button>
      ) : (
        <Button
          onClick={() => navigate('/auth')}
          variant="outline"
          size="sm"
          className={cn(
            "w-full h-10 text-sm border-gray-200 hover:bg-gray-50 rounded-lg",
            state === 'expanded' ? 'justify-start px-4' : 'justify-center px-0'
          )}
        >
          <User className="w-4 h-4" />
          {state === 'expanded' && <span className="ml-3 truncate">Đăng nhập</span>}
        </Button>
      )}
    </SidebarFooterBase>
  );
}