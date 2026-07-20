"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Globe, Mail, Phone } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { motion } from "framer-motion";
import { FADE_IN_UP, STAGGER_CONTAINER, CARD_HOVER } from "@/lib/animations";
import { Skeleton } from "@/components/ui/skeleton";

interface NGO {
  id: string;
  ngo_name: string;
  description: string;
  services: string | string[];
  district: string;
  state: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  status: string;
}

export default function NGOsPage() {
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleLinkClick = (url?: string | null) => {
    if (url) {
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      window.open(formattedUrl, '_blank');
    } else {
      setToastMessage(t("ngos.no_website"));
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  useEffect(() => {
    async function fetchNgos() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("ngos")
          .select("*")
          .order("ngo_name", { ascending: true });

        if (error) {
          throw error;
        }

        setNgos(data || []);
      } catch (err: unknown) {
        console.error("Error fetching NGOs:", err);
        setError(err instanceof Error ? err.message : t("common.error"));
      } finally {
        setLoading(false);
      }
    }

    fetchNgos();
  }, [t]);

  const mapCategory = (category: string) => {
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

  const renderServices = (services: string | string[]) => {
    if (!services) return null;
    
    let servicesList: string[] = [];
    if (typeof services === 'string') {
      try {
        if (services.startsWith('[') && services.endsWith(']')) {
          servicesList = JSON.parse(services);
        } else {
          servicesList = services.split(',').map(s => s.trim());
        }
      } catch {
        servicesList = services.split(',').map(s => s.trim());
      }
    } else if (Array.isArray(services)) {
      servicesList = services;
    }

    return (
      <div className="flex flex-wrap gap-2 pt-2">
        {servicesList.map((service, idx) => (
          <span key={idx} className="inline-flex rounded-full bg-secondary px-2 py-1 text-xs font-medium">
            {mapCategory(service)}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t("ngos.title")}</h1>
          <p className="text-muted-foreground">{t("ngos.desc")}</p>
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder={t("ngos.search_placeholder")} className="pl-8 max-w-md" />
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 py-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="flex flex-col h-full overflow-hidden">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="flex-1 space-y-4 pb-4">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
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
      ) : ngos.length === 0 ? (
        <motion.div initial="hidden" animate="visible" variants={FADE_IN_UP} className="py-20 text-center text-muted-foreground bg-muted/20 rounded-md border">{t("ngos.no_results")}</motion.div>
      ) : (
        <motion.div initial="hidden" animate="visible" variants={STAGGER_CONTAINER} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ngos.map((ngo) => (
            <motion.div key={ngo.id || ngo.ngo_name} variants={FADE_IN_UP} whileHover={CARD_HOVER}>
              <Card className="flex flex-col h-full hover:border-primary/50 transition-colors overflow-hidden">
                <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="leading-tight">{ngo.ngo_name}</CardTitle>
                  {ngo.status && (
                    <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap shrink-0 ${ngo.status.toLowerCase() === 'active' || ngo.status.toLowerCase() === 'verified' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                      {mapStatus(ngo.status)}
                    </span>
                  )}
                </div>
                <CardDescription className="line-clamp-2 mt-2 text-sm">
                  {ngo.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4 text-sm pb-4">
                {(ngo.district || ngo.state) && (
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {[ngo.district, ngo.state].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                {ngo.website && (
                  <div className="flex items-center text-muted-foreground">
                    <Globe className="mr-2 h-4 w-4 shrink-0" />
                    <a href={ngo.website.startsWith('http') ? ngo.website : `https://${ngo.website}`} target="_blank" rel="noopener noreferrer" className="truncate hover:underline hover:text-primary">
                      {ngo.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {ngo.email && (
                  <div className="flex items-center text-muted-foreground">
                    <Mail className="mr-2 h-4 w-4 shrink-0" />
                    <a href={`mailto:${ngo.email}`} className="truncate hover:underline hover:text-primary">
                      {ngo.email}
                    </a>
                  </div>
                )}
                {ngo.phone && (
                  <div className="flex items-center text-muted-foreground">
                    <Phone className="mr-2 h-4 w-4 shrink-0" />
                    <a href={`tel:${ngo.phone}`} className="truncate hover:underline hover:text-primary">
                      {ngo.phone}
                    </a>
                  </div>
                )}
                {renderServices(ngo.services)}
              </CardContent>
              <CardFooter className="pt-4 border-t mt-auto gap-2 flex-col sm:flex-row">
                <Button className="w-full" asChild>
                  <a href={`/applications/new?type=NGO+Assistance&item=${encodeURIComponent(ngo.ngo_name)}`}>Request Assistance</a>
                </Button>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full" onClick={() => handleLinkClick(ngo.website)}>Volunteer</Button>
                </motion.div>
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
