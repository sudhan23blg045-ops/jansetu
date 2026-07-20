"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Briefcase, Calendar, Info } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { motion } from "framer-motion";
import { FADE_IN_UP, STAGGER_CONTAINER, CARD_HOVER } from "@/lib/animations";
import { Skeleton } from "@/components/ui/skeleton";

interface LivelihoodOpportunity {
  id: string;
  title: string;
  category: string;
  description: string;
  provider: string;
  location: string;
  eligibility: string;
  duration: string;
  website: string;
  status: string;
}

export default function LivelihoodOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<LivelihoodOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchOpportunities() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("livelihood_opportunities")
          .select("*")
          .order("title", { ascending: true });

        if (error) {
          throw error;
        }

        setOpportunities(data || []);
      } catch (err: unknown) {
        console.error("Error fetching livelihood opportunities:", err);
        setError(err instanceof Error ? err.message : t("common.error"));
      } finally {
        setLoading(false);
      }
    }

    fetchOpportunities();
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
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t("livelihoods.title")}</h1>
          <p className="text-muted-foreground">{t("livelihoods.desc")}</p>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder={t("livelihoods.search_placeholder")} className="pl-8" />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 py-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="flex flex-col h-full overflow-hidden">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="flex-1 space-y-4 pb-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
              <CardFooter className="pt-4 border-t mt-auto">
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <motion.div initial="hidden" animate="visible" variants={FADE_IN_UP} className="bg-destructive/10 text-destructive p-4 rounded-md flex items-center justify-center">
          {error}
        </motion.div>
      ) : opportunities.length === 0 ? (
        <motion.div initial="hidden" animate="visible" variants={FADE_IN_UP} className="py-20 text-center text-muted-foreground bg-muted/20 rounded-md border">{t("livelihoods.no_results")}</motion.div>
      ) : (
        <motion.div initial="hidden" animate="visible" variants={STAGGER_CONTAINER} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((opp) => (
            <motion.div key={opp.id} variants={FADE_IN_UP} whileHover={CARD_HOVER}>
              <Card className="flex flex-col h-full hover:border-primary/50 transition-colors overflow-hidden">
                <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="leading-tight">{opp.title}</CardTitle>
                  {opp.status && (
                    <span className={`shrink-0 text-xs px-2 py-1 rounded-full whitespace-nowrap ${opp.status.toLowerCase() === 'active' || opp.status.toLowerCase() === 'open' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                      {mapStatus(opp.status)}
                    </span>
                  )}
                </div>
                <CardDescription className="text-primary font-medium mt-1 text-sm">{opp.provider}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4 text-sm pb-4">
                {opp.location && (
                  <div className="flex items-start text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4 shrink-0 mt-0.5" />
                    <span>{opp.location}</span>
                  </div>
                )}
                {opp.category && (
                  <div className="flex items-center text-muted-foreground">
                    <Briefcase className="mr-2 h-4 w-4 shrink-0" />
                    {mapCategory(opp.category)}
                  </div>
                )}
                {opp.duration && (
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4 shrink-0" />
                    {opp.duration}
                  </div>
                )}
                {opp.eligibility && (
                  <div className="flex items-start text-muted-foreground">
                    <Info className="mr-2 h-4 w-4 shrink-0 mt-0.5" />
                    <span>{opp.eligibility}</span>
                  </div>
                )}
                {opp.description && (
                  <div className="pt-2">
                    <p className="line-clamp-2 text-muted-foreground">
                      {opp.description}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-4 border-t mt-auto gap-2 flex-col sm:flex-row">
                <Button className="w-full" asChild>
                  <a href={`/applications/new?type=Livelihood+Opportunity&item=${encodeURIComponent(opp.title)}`}>Apply Now</a>
                </Button>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                  {opp.website ? (
                    <Button variant="outline" asChild className="w-full">
                      <a href={opp.website.startsWith('http') ? opp.website : `https://${opp.website}`} target="_blank" rel="noopener noreferrer">
                        {t("common.view_details")}
                      </a>
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full">{t("common.view_details")}</Button>
                  )}
                </motion.div>
              </CardFooter>
            </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
