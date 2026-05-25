import { useTheme } from "../../contexts/ThemeContext";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";

const ACCENT_COLORS = [
  { name: "Cyan", value: "187 100% 42%" },
  { name: "Violeta", value: "271 91% 65%" },
  { name: "Verde", value: "142 71% 45%" },
  { name: "Naranja", value: "24 95% 53%" },
  { name: "Rosa", value: "346 87% 61%" },
  { name: "Azul", value: "220 90% 56%" },
  { name: "Amarillo", value: "48 96% 53%" },
];

export function AccentColorPicker() {
  const { accentColor, setAccentColor } = useTheme();

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Color de acento</Label>
      <div className="flex flex-wrap gap-3">
        {ACCENT_COLORS.map((color) => (
          <button
            key={color.value}
            onClick={() => setAccentColor(color.value)}
            className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-border/50 hover:scale-110 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            style={{ backgroundColor: `hsl(${color.value})` }}
            title={color.name}
          >
            {accentColor === color.value && (
              <Check className="w-5 h-5 text-white drop-shadow-md" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
