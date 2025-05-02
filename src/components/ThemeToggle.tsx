import { useTheme } from "@/components/theme-provider"
import { IconMoonFilled, IconSunFilled } from "@tabler/icons-react";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      className="p-2 rounded-lg transition"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "light" ? <IconMoonFilled size={20} className="text-blue-800" /> : <IconSunFilled size={20} className="text-[#FFDF00]" />}
    </button>
  );
};

export default ThemeToggle;
