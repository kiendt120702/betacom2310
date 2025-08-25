import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  GraduationCap,
  BookOpen,
  FileText,
  Crown,
  User,
  Library,
  ShoppingBag,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/useUserProfile";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

export const SidebarEduMenu = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: userProfile } = useUserProfile();
  const { state } = useSidebar();

  const handleNavigation = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate],
  );

  const eduShopeeItems = [
    {
      id: "training-content",
      label: "Bắt đầu học",
      icon: GraduationCap,
      path: "/training-content",
    },
    {
      id: "assignment-submission",
      label: "Nộp bài tập",
      icon: FileText,
      path: "/assignment-submission",
    },
  ];

  const otherEduItems = [
    {
      id: "leader-training",
      label: "Leader",
      icon: Crown,
      path: "/leader-training",
    },
    {
      id: "specialist-training",
      label: "Chuyên viên",
      icon: User,
      path: "/specialist-training",
    },
    {
      id: "general-training",
      label: "Chung",
      icon: Library,
      path: "/general-training",
    },
  ];

  const isEduShopeeActive = eduShopeeItems.some((item) =>
    location.pathname.startsWith(item.path),
  );
  const [isShopeeEduOpen, setIsShopeeEduOpen] = useState(isEduShopeeActive);

  useEffect(() => {
    if (isEduShopeeActive) {
      setIsShopeeEduOpen(true);
    }
  }, [isEduShopeeActive]);

  if (!userProfile) return null;

  return (
    <div className="space-y-1">
      {state === "expanded" && (
        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          EDU
        </h3>
      )}

      <Button
        variant={isEduShopeeActive ? "default" : "ghost"}
        className={cn(
          "w-full gap-3 h-10",
          state === "expanded" ? "justify-start" : "justify-center",
          isEduShopeeActive && "bg-primary text-primary-foreground shadow-sm",
        )}
        onClick={() =>
          state === "expanded"
            ? setIsShopeeEduOpen(!isShopeeEduOpen)
            : handleNavigation(eduShopeeItems[0].path)
        }
      >
        <ShoppingBag className="w-4 h-4" />
        {state === "expanded" && <span className="font-medium">Edu Shopee</span>}
        {state === "expanded" && (
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-200 ml-auto",
              isShopeeEduOpen && "rotate-180",
            )}
          />
        )}
      </Button>

      {isShopeeEduOpen && state === "expanded" && (
        <div className="pl-4 space-y-1">
          {eduShopeeItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className="w-full gap-3 h-9 justify-start"
                onClick={() => handleNavigation(item.path)}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium text-xs">{item.label}</span>
              </Button>
            );
          })}
        </div>
      )}

      {otherEduItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <Button
            key={item.id}
            variant={isActive ? "default" : "ghost"}
            className={cn(
              "w-full gap-3 h-10",
              state === "expanded" ? "justify-start" : "justify-center",
              isActive && "bg-primary text-primary-foreground shadow-sm",
            )}
            onClick={() => handleNavigation(item.path)}
          >
            <Icon className="w-4 h-4" />
            {state === "expanded" && (
              <span className="font-medium">{item.label}</span>
            )}
          </Button>
        );
      })}
    </div>
  );
});

SidebarEduMenu.displayName = "SidebarEduMenu";