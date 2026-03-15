"use client";

import { Theme, ThemeProvider } from "@/context/ThemeContext";
import { useEffect } from "react";

export function Providers({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: Theme;
}) {
  useEffect(() => {
    // Применяем тему к документу при загрузке на клиенте
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return <ThemeProvider initialTheme={theme}>{children}</ThemeProvider>;
}
