import { useTheme } from "../contexts/ThemeContext";
import { translations, TranslationKey, LangCode } from "../i18n/translations";

export function useTranslation() {
  const { language } = useTheme();
  const lang: LangCode = language in translations ? (language as LangCode) : "es";

  const t = (key: TranslationKey): string => {
    return (translations[lang] as Record<string, string>)[key]
      ?? (translations.es as Record<string, string>)[key]
      ?? key;
  };

  return { t, lang };
}
