"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ThemeSwitchProps {
  theme: string | undefined;
  setTheme: (theme: string) => void;
}

export function ThemeSwitch({ theme, setTheme }: ThemeSwitchProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
