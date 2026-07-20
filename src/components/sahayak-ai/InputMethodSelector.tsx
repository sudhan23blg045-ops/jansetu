import { Card, CardContent } from "@/components/ui/card";
import { Keyboard, Mic } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";

interface InputMethodSelectorProps {
  onSelect: (method: 'text' | 'voice') => void;
}

export function InputMethodSelector({ onSelect }: InputMethodSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t("ai.comm_method")}</h2>
        <p className="text-muted-foreground">{t("ai.comm_desc")}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pt-4">
        <Card 
          className="cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all duration-300 group overflow-hidden"
          onClick={() => onSelect('text')}
        >
          <CardContent className="p-10 flex flex-col items-center justify-center space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Keyboard className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-bold block">⌨️ {t("ai.type")}</span>
              <span className="text-sm text-muted-foreground block">{t("ai.type_desc")}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all duration-300 group overflow-hidden"
          onClick={() => onSelect('voice')}
        >
          <CardContent className="p-10 flex flex-col items-center justify-center space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Mic className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-bold block">🎤 {t("ai.speak")}</span>
              <span className="text-sm text-muted-foreground block">{t("ai.speak_desc")}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
