"use client";

import { useEffect } from "react";
import { THEMES, ThemeId } from "@/lib/themes";

export function ThemeProvider({
  themeId,
  children,
}: {
  themeId: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const id =
      (themeId as ThemeId) in THEMES ? (themeId as ThemeId) : "confetti";
    const vars = THEMES[id].cssVars;
    const root = document.documentElement;
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    return () => {
      Object.keys(vars).forEach((key) => root.style.removeProperty(key));
    };
  }, [themeId]);

  return <>{children}</>;
}
