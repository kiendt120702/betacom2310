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
      {/* Logo và Brand - Made more compact */}
      <div
        className={cn(
          "flex items-center gap-2 h-10 mb-3 cursor-pointer",
          state === "collapsed" && "justify-center",
        )}
        onClick={() => navigate("/")}
      >
        <img
          src="/lovable-uploads/f65c492e-4e6f-44d2-a9be-c90a71e944ea.png"
          alt="Betacom Logo"
          className="h-7 w-auto"
        />
        {state === "expanded" && (
          <h2 className="text-base font-bold text-foreground">Betacom</h2>
        )}
      </div>

      {/* Quick Actions - Only show Admin Panel for admin role */}
      {userProfile?.role === "admin" && (
        <div className="space-y-2">
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start gap-2 h-9 text-sm",
              state === "collapsed" && "justify-center",
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