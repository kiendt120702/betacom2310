import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import { secureLog } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";
import { useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

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
      navigate("/auth");
    } catch (error) {
      secureLog("Sign out error:", error);
      toast({
        title: "Lỗi đăng xuất",
        description: "Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại.",
        variant: "destructive",
      });
      navigate("/auth");
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const getRoleDisplayName = (roleValue: string | undefined): string => {
    if (!roleValue) return '';
    switch (roleValue.toLowerCase()) {
      case 'admin': return 'Super Admin';
      case 'leader': return 'Team Leader';
      case 'chuyên viên': return 'Chuyên Viên';
      case 'học việc/thử việc': return 'Học Việc/Thử Việc';
      case 'trưởng phòng': return 'Trưởng Phòng';
      default: return roleValue;
    }
  };

  // Collapsed state
  if (state === "collapsed") {
    return (
      <div className="flex flex-col items-center gap-2 p-2 border-t border-border mt-auto">
        {isLoading ? (
          <Skeleton className="h-9 w-9 rounded-full" />
        ) : userProfile ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-foreground"
              onClick={toggleTheme}
            >
              {theme === "light" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
            <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
              {userProfile.full_name?.charAt(0).toUpperCase() ||
                userProfile.email?.charAt(0).toUpperCase() ||
                "U"}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Đăng xuất</span>
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-foreground"
              onClick={toggleTheme}
            >
              {theme === "light" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/auth")}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>
    );
  }

  // Expanded state
  return (
    <div className="p-3 space-y-2">
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
          <Button
            variant="ghost"
            className="w-full justify-between items-center"
            onClick={toggleTheme}
          >
            <span className="text-sm text-muted-foreground">Giao diện</span>
            <div className="flex items-center">
              {theme === "light" ? (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
              ) : (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
              )}
            </div>
          </Button>
          
          <div className="w-full flex items-center justify-start gap-2 px-2 py-2 rounded-md text-sm font-medium text-foreground">
            <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
              {userProfile.full_name?.charAt(0).toUpperCase() ||
                userProfile.email?.charAt(0).toUpperCase() ||
                "U"}
            </div>
            <div className="flex-1 truncate text-left">
              <p className="font-semibold truncate">
                {userProfile.full_name || userProfile.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {getRoleDisplayName(userProfile.role)}
              </p>
              {userProfile.teams?.name && (
                <p className="text-xs text-muted-foreground truncate">{userProfile.teams.name}</p>
              )}
              {userProfile.manager?.full_name && (
                <p className="text-xs text-muted-foreground truncate">Leader: {userProfile.manager.full_name}</p>
              )}
            </div>
          </div>
          
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
          <Button
            variant="ghost"
            className="w-full justify-between items-center"
            onClick={toggleTheme}
          >
            <span className="text-sm text-muted-foreground">Giao diện</span>
            <div className="flex items-center">
              {theme === "light" ? (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
              ) : (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
              )}
            </div>
          </Button>
          <Button
            onClick={() => navigate("/auth")}
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