import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export function LanguageSelector() {
  const [language, setLanguage] = useState("es");

  return (
    <div className="space-y-3">
      <Label htmlFor="language-select" className="text-sm font-medium">Idioma</Label>
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger id="language-select" className="w-full">
          <SelectValue placeholder="Selecciona un idioma" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="es">Español</SelectItem>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="pt">Português</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
