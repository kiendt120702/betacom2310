import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function SidebarHeader() {
  const navigate = useNavigate();
  const { data: userProfile } = useUserProfile();
  const { state } = useSidebar();

  return (
    <div className="p-3">
      {/* Logo và Brand */}
      <div
        className={cn(
          "flex items-center gap-3 h-12 cursor-pointer",
          state === "collapsed" && "justify-center",
        )}
        onClick={() => navigate("/")}
      >
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
          <img
            src="/lovable-uploads/f65c492e-4e6f-44d2-a9be-c90a71e944ea.png"
            alt="Betacom Logo"
            className="h-7 w-auto"
          />
        </div>
        {state === "expanded" && (
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-primary">Betacom</h2>
            {userProfile && (
              <div className="text-xs text-muted-foreground -mt-1">
                <p className="truncate">{userProfile.full_name || userProfile.email}</p>
                <p className="truncate">{userProfile.role} {userProfile.teams?.name ? `• ${userProfile.teams.name}` : ''}</p>
                {userProfile.manager?.full_name && (
                  <p className="truncate">Leader: {userProfile.manager.full_name}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions - Only show Admin Panel for admin role */}
      {userProfile?.role === "admin" && (
        <div className="space-y-2 mt-4">
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start gap-2 h-9 text-sm",
              state === "collapsed" && "justify-center p-0 h-10 w-10",
            )}
            onClick={() => navigate("/admin")}
          >
            <Settings className="w-4 h-4" />
            {state === "expanded" && <span>Admin Panel</span>}
          </Button>
        </div>
      )}
    </div>
  );
}