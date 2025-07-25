import React, { useEffect, useState } from "react";

const themes = ["light", "dark", "magenta", "cyan"];

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState("cynberpunk");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof document !== "undefined") {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
      setTheme(currentTheme);
    }
  }, []);

  const handleChange = (e) => {
    const newTheme = e.target.value;
    setTheme(newTheme);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", newTheme);
    }
  };

  // Prevent SSR mismatch by not rendering until mounted
  if (!mounted) return null;

  return (
    <form>
      <label htmlFor="theme-select">Theme:</label>
      <select id="theme-select" value={theme} onChange={handleChange}>
        {themes.map(theme => (
          <option key={theme} value={theme}>{theme}</option>
        ))}
      </select>
    </form>
  );
};

export default ThemeSwitcher;