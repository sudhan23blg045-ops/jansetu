import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark, Building2, Briefcase, GraduationCap, FileText, Heart, Home, HelpCircle } from "lucide-react";

import { useTranslation } from "@/lib/i18n/LanguageContext";

interface QuickActionGridProps {
  onActionSelect: (action: string) => void;
}

export function QuickActionGrid({ onActionSelect }: QuickActionGridProps) {
  const { t } = useTranslation();

  const actions = [
    { id: "schemes", title: t("nav.schemes"), icon: Landmark },
    { id: "ngos", title: t("nav.ngos"), icon: Building2 },
    { id: "livelihood", title: t("nav.livelihoods"), icon: Briefcase },
    { id: "education", title: t("nav.education"), icon: GraduationCap },
    { id: "documents", title: "Documents", icon: FileText },
    { id: "healthcare", title: "Healthcare", icon: Heart },
    { id: "housing", title: "Housing", icon: Home },
    { id: "general", title: "Ask Anything", icon: HelpCircle },
  ];

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action) => (
          <Card 
            key={action.id} 
            className="cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group bg-background/50 backdrop-blur shadow-sm"
            onClick={() => onActionSelect(action.title)}
          >
            <CardHeader className="p-4 space-y-2">
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform text-primary">
                <action.icon className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm leading-tight">{action.title}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
