
import React, { useEffect, useState } from "react";

const themes = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset",
];

// Hardcoded dark themes (from DaisyUI docs)
const darkThemes = new Set([
  "dark",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "forest",
  "aqua",
  "fantasy",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "business",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset",
]);

// Simple color map for preview swatches (can be expanded)
const themeColors = {
  light: ["#f3f4f6", "#e5e7eb", "#d1d5db"],
  dark: ["#18181b", "#27272a", "#3f3f46"],
  cupcake: ["#fae8e0", "#f6c6ea", "#a3c9f7"],
  bumblebee: ["#fbee6b", "#f7c948", "#f49d37"],
  emerald: ["#10b981", "#34d399", "#6ee7b7"],
  corporate: ["#4b6bfb", "#1e293b", "#64748b"],
  synthwave: ["#e779c1", "#fbbf24", "#7f9cf5"],
  retro: ["#ffd700", "#ff7f50", "#40e0d0"],
  cyberpunk: ["#ff00cc", "#333399", "#00ffff"],
  valentine: ["#ffb6b9", "#fae3d9", "#bbded6"],
  halloween: ["#ff7518", "#000000", "#f5f5f5"],
  garden: ["#88d8b0", "#c1f7c5", "#f7f7f7"],
  forest: ["#228b22", "#6b8e23", "#556b2f"],
  aqua: ["#00ffff", "#7fffd4", "#e0ffff"],
  lofi: ["#f4f4f4", "#cfcfcf", "#a9a9a9"],
  pastel: ["#ffd1dc", "#c1f7c5", "#f7f7f7"],
  fantasy: ["#e0bbff", "#957dad", "#d291bc"],
  wireframe: ["#e5e7eb", "#9ca3af", "#374151"],
  black: ["#000000", "#222222", "#444444"],
  luxury: ["#ffd700", "#000000", "#bfae48"],
  dracula: ["#282a36", "#44475a", "#bd93f9"],
  cmyk: ["#00aaff", "#ff00aa", "#ffff00"],
  autumn: ["#ffb347", "#ffcc33", "#ff7f50"],
  business: ["#1e293b", "#64748b", "#f3f4f6"],
  acid: ["#a8ff04", "#fffa65", "#ff6f3c"],
  lemonade: ["#fff44f", "#f7c948", "#f49d37"],
  night: ["#0f172a", "#1e293b", "#334155"],
  coffee: ["#6f4e37", "#b3816f", "#d7b899"],
  winter: ["#e0f7fa", "#b2ebf2", "#80deea"],
  dim: ["#22223b", "#4a4e69", "#9a8c98"],
  nord: ["#2e3440", "#3b4252", "#88c0d0"],
  sunset: ["#ff7e5f", "#feb47b", "#ffd1dc"],
};

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState("dracula");
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
    <div className="form-control">
      <select value={theme} onChange={handleChange} className="select select-bordered w-full max-w-xs" style={{ display: "inline-flex", justifyContent: "space-between" }}>
        {themes.map((t) => {
          const colors = themeColors[t] || ["#e5e7eb", "#9ca3af", "#374151"];
          const isDark = darkThemes.has(t);
          return (
            <option key={t} value={t}>
              {/* Swatch and name */}
              <span style={{ display: "inline-flex" }}>
                {colors.map((c, i) => (
                  <span
                    key={i}
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      background: c,
                      borderRadius: "50%",
                      marginRight: 2,
                      border: "1px solid #ccc",
                    }}
                  />
                ))}
                <span style={{ marginLeft: 6 }}>{t}</span>
                {/* Dark mode indicator to the right, same color as text */}
                <span style={{ fontSize: 14, marginLeft: 8, color: "inherit" }}>
                  {isDark ? "🌌" : "🌅"}
                </span>
              </span>
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default ThemeSwitcher;


