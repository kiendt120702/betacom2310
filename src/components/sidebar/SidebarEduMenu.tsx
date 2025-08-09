
import React from "react";
import { useLocation } from "react-router-dom";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { GraduationCap, BookOpen, FileText } from "lucide-react";

const SidebarEduMenu = () => {
  const location = useLocation();

  return (
    <div className="space-y-1">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          EDU
        </h2>
      </div>
      
      <SidebarMenuItem 
        href="/training-process" 
        icon={GraduationCap} 
        label="Quy trình đào tạo" 
        isActive={location.pathname === "/training-process"}
      />
      
      <SidebarMenuItem 
        href="/training-content" 
        icon={BookOpen} 
        label="Nội dung đào tạo" 
        isActive={location.pathname === "/training-content"}
      />
      
      <SidebarMenuItem 
        href="/assignment-submission" 
        icon={FileText} 
        label="Nộp bài tập" 
        isActive={location.pathname === "/assignment-submission"}
      />
    </div>
  );
};

export default SidebarEduMenu;
