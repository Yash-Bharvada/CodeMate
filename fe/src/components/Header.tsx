import React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-12 bg-hsl(var(--editor-sidebar)) border-b border-hsl(var(--editor-border)) flex items-center justify-between px-4">
      <div className="flex items-center">
      <h1 className="text-3xl font-extrabold text-foreground font-worksans tracking-wide">
      CODEMATE
      </h1>

      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="h-8 w-8 p-0"
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>
      </div>
    </header>
  );
};

export default Header;
