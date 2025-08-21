"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type SidebarState = "expanded" | "collapsed";

interface SidebarContextType {
  state: SidebarState;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<SidebarState>("expanded");

  const toggle = useCallback(() => {
    setState((prevState) =>
      prevState === "expanded" ? "collapsed" : "expanded",
    );
  }, []);

  return (
    <SidebarContext.Provider value={{ state, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};