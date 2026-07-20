"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { motion } from "framer-motion";
import { FADE_IN_UP, STAGGER_CONTAINER, CARD_HOVER } from "@/lib/animations";
import { Skeleton } from "@/components/ui/skeleton";

interface Scheme {
  id: string;
  scheme_name: string;
  description: string;
  eligibility: string;
  benefits: string;
  category: string;
  state: string;
  status: string;
  official_link: string;
}

export default function SchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleLinkClick = (url?: string | null) => {
    if (url) {
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      window.open(formattedUrl, '_blank');
    } else {
      setToastMessage("Official website not available.");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const { data, error } = await supabase
          .from("schemes")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setSchemes(data || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : t("common.error"));
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, [t]);

  const mapCategory = (category: string) => {
    if (!category) return "";
    const keyMap: Record<string, string> = {
      "Healthcare": "categories.healthcare",
      "Nutrition": "categories.nutrition",
      "Community Support": "categories.community_support",
      "Skill Development": "categories.skill_development",
      "Women Empowerment": "categories.women_empowerment",
      "Disability Support": "categories.disability_support",
      "Employment": "categories.employment",
      "Education": "nav.education",
    };
    return keyMap[category] ? t(keyMap[category]) : category;
  };

  const mapStatus = (status: string) => {
    if (!status) return "";
    const keyMap: Record<string, string> = {
      "active": "status.active",
      "verified": "status.verified",
      "open": "status.open",
      "inactive": "status.inactive",
      "closed": "status.closed",
    };
    return keyMap[status.toLowerCase()] ? t(keyMap[status.toLowerCase()]) : status;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t("schemes.title")}</h1>
          <p className="text-muted-foreground">{t("schemes.desc")}</p>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder={t("schemes.search_placeholder")} className="pl-8" />
        </div>
        <Button variant="outline" className="shrink-0" title="Filter">
          <Filter className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline-block">Filter</span>
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 py-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="flex flex-col h-full overflow-hidden">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-20 rounded-full mb-2" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mt-1" />
              </CardHeader>
              <CardContent className="flex-1 space-y-4 pb-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </CardContent>
              <CardFooter className="pt-4 border-t gap-2 flex-col sm:flex-row mt-auto">
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <motion.div initial="hidden" animate="visible" variants={FADE_IN_UP} className="py-20 text-center text-destructive bg-destructive/10 rounded-md border border-destructive/20">{error}</motion.div>
      ) : schemes.length === 0 ? (
        <motion.div initial="hidden" animate="visible" variants={FADE_IN_UP} className="py-20 text-center text-muted-foreground bg-muted/20 rounded-md border">{t("schemes.no_results")}</motion.div>
      ) : (
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={STAGGER_CONTAINER}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {schemes.map((scheme) => (
            <motion.div key={scheme.id} variants={FADE_IN_UP} whileHover={CARD_HOVER}>
              <Card className="flex flex-col h-full transition-colors duration-300 hover:border-primary/30 overflow-hidden">
                <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary border-transparent">
                    {scheme.category ? mapCategory(scheme.category) : t("common.all_categories")}
                  </span>
                  <span className="text-sm text-muted-foreground text-right shrink-0">{scheme.state || "Central Govt."}</span>
                </div>
                <CardTitle className="line-clamp-2 leading-tight" title={scheme.scheme_name}>{scheme.scheme_name}</CardTitle>
                <CardDescription className="line-clamp-3 mt-2 text-sm" title={scheme.description}>
                  {scheme.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4 pb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground shrink-0">Eligibility:</span>
                    <span className="font-medium line-clamp-1 text-right ml-2" title={scheme.eligibility}>{scheme.eligibility || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground shrink-0">Benefits:</span>
                    <span className="font-medium line-clamp-1 text-right ml-2" title={scheme.benefits}>{scheme.benefits || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground shrink-0">Status:</span>
                    <span className={`font-medium ${scheme.status?.toLowerCase() === 'active' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {scheme.status ? mapStatus(scheme.status) : "Unknown"}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t gap-2 flex-col sm:flex-row mt-auto">
                <Button className="w-full" asChild>
                  <a href={`/applications/new?type=Government+Scheme&item=${encodeURIComponent(scheme.scheme_name)}`}>Apply Now</a>
                </Button>
                {scheme.official_link && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto shrink-0 flex">
                    <Button variant="outline" className="w-full sm:w-auto px-3 shrink-0" asChild>
                      <a href={scheme.official_link} target="_blank" rel="noopener noreferrer" title="Official Website">
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">Official Website</span>
                      </a>
                    </Button>
                  </motion.div>
                )}
              </CardFooter>
            </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
      
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-foreground text-background px-4 py-2 rounded-md shadow-lg z-50 animate-in fade-in slide-in-from-bottom-4">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
