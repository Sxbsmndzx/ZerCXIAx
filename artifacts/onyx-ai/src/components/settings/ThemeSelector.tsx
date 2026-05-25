import { useTheme } from "../../contexts/ThemeContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-3">
      <Label htmlFor="theme-select" className="text-sm font-medium">Tema</Label>
      <Select value={theme} onValueChange={(v) => setTheme(v as any)}>
        <SelectTrigger id="theme-select" className="w-full">
          <SelectValue placeholder="Selecciona un tema" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="dark">Oscuro (Onyx)</SelectItem>
          <SelectItem value="light">Claro</SelectItem>
          <SelectItem value="system">Sistema</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
