import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export function SidebarHeader() {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      {/* Logo và Brand */}
      <div
        className="flex items-center gap-3 h-12 mb-4 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <img
          src="/lovable-uploads/f65c492e-4e6f-44d2-a9be-c90a71e944ea.png"
          alt="Betacom Logo"
          className="h-8 w-auto"
        />
        <h2 className="text-lg font-bold text-foreground">Betacom</h2>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-10"
          onClick={() => navigate("/admin")}
        >
          <Settings className="w-4 h-4" />
          Admin Panel
        </Button>
      </div>
    </div>
  );
}