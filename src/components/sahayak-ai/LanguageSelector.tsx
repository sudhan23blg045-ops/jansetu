import { Card, CardContent } from "@/components/ui/card";
import { Globe } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";

interface LanguageSelectorProps {
  onSelect: (lang: string) => void;
}

const languages = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
];

export function LanguageSelector({ onSelect }: LanguageSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Globe className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">🤖 {t("nav.ai_assistant")}</h1>
        <p className="text-xl text-muted-foreground font-medium">{t("ai.subtitle")}</p>
        <p className="text-muted-foreground max-w-xl mx-auto pt-2">
          {t("ai.desc")}
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full pt-4">
        {languages.map((lang) => (
          <Card 
            key={lang.code} 
            className="cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group overflow-hidden"
            onClick={() => onSelect(lang.code)}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center space-y-2">
              <span className="text-2xl font-bold group-hover:text-primary transition-colors">{lang.native}</span>
              <span className="text-sm text-muted-foreground">{lang.name}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
