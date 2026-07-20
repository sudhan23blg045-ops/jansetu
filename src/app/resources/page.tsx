"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, ExternalLink, FileText, Globe, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { motion } from "framer-motion";
import { FADE_IN_UP, STAGGER_CONTAINER, CARD_HOVER } from "@/lib/animations";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface Resource {
  id: string;
  title: string;
  category: string;
  description: string;
  resource_type: string;
  resource_url: string;
  source: string;
  thumbnail_url?: string;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { t } = useTranslation();

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const { data, error } = await supabase
          .from("resources")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw new Error(error.message || "Supabase Error");
        }

        setResources(data || []);
        setFilteredResources(data || []);
      } catch (err: any) {
        console.error("Supabase Error Details:", err);
        setError(err.message || t("common.error"));
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [t]);

  useEffect(() => {
    let result = resources;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
    }
    if (selectedCategory !== "All") {
      result = result.filter(r => r.category === selectedCategory);
    }
    setFilteredResources(result);
  }, [searchQuery, selectedCategory, resources]);

  const mapCategory = (category: string) => {
    if (!category) return "";
    const keyMap: Record<string, string> = {
      "Guidelines": "resources.categories.Guidelines",
      "Community Lists": "resources.categories.Community Lists",
      "Reports": "resources.categories.Reports",
      "Government Links": "resources.categories.Government Links",
      "Success Stories": "resources.categories.Success Stories"
    };
    return keyMap[category] ? t(keyMap[category]) : category;
  };

  const renderThumbnail = (resource: Resource) => {
    if (resource.thumbnail_url) {
      return (
        <div className="w-full h-32 bg-muted relative rounded-t-lg overflow-hidden shrink-0">
          <Image src={resource.thumbnail_url} alt={resource.title} fill className="object-cover" />
        </div>
      );
    }
    return (
      <div className="w-full h-32 bg-primary/5 flex items-center justify-center relative rounded-t-lg overflow-hidden shrink-0">
        {resource.resource_type === 'PDF' ? (
          <FileText className="h-12 w-12 text-primary/40" />
        ) : (
          <Globe className="h-12 w-12 text-primary/40" />
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t("resources.title")}</h1>
          <p className="text-muted-foreground">{t("resources.desc")}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder={t("resources.search_placeholder")} 
            className="pl-8" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 shrink-0">
          <Button 
            variant={selectedCategory === "All" ? "default" : "outline"} 
            onClick={() => setSelectedCategory("All")}
            className="shrink-0"
          >
            {t("resources.all_categories")}
          </Button>
          {["Guidelines", "Community Lists", "Reports", "Government Links", "Success Stories"].map(cat => (
            <Button 
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"} 
              onClick={() => setSelectedCategory(cat)}
              className="shrink-0"
            >
              {mapCategory(cat)}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 py-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="flex flex-col h-full overflow-hidden">
              <Skeleton className="h-32 w-full rounded-none" />
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-20 rounded-full mb-2" />
                <Skeleton className="h-6 w-3/4 mb-2" />
              </CardHeader>
              <CardContent className="flex-1 space-y-4 pb-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
              <CardFooter className="pt-4 border-t gap-2 mt-auto">
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <motion.div initial="hidden" animate="visible" variants={FADE_IN_UP} className="py-20 text-center text-destructive bg-destructive/10 rounded-md border border-destructive/20">{error}</motion.div>
      ) : filteredResources.length === 0 ? (
        <motion.div initial="hidden" animate="visible" variants={FADE_IN_UP} className="py-20 text-center text-muted-foreground bg-muted/20 rounded-md border">{t("resources.no_results")}</motion.div>
      ) : (
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={STAGGER_CONTAINER}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredResources.map((resource) => (
            <motion.div key={resource.id} variants={FADE_IN_UP} whileHover={CARD_HOVER}>
              <Card className="flex flex-col h-full transition-colors duration-300 hover:border-primary/30 overflow-hidden">
                {renderThumbnail(resource)}
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary border-transparent">
                      {mapCategory(resource.category)}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      {resource.resource_type === 'PDF' ? <FileText className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                      {resource.resource_type}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2 leading-tight" title={resource.title}>{resource.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-4 pb-4">
                  <CardDescription className="line-clamp-3 text-sm" title={resource.description}>
                    {resource.description}
                  </CardDescription>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Source:</span> <span className="font-medium">{resource.source}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t gap-2 mt-auto flex-col">
                  <Button className="w-full" asChild>
                    <a href={resource.resource_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {t("resources.open_resource")}
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`/applications/new?type=Resource+Assistance&item=${encodeURIComponent(resource.title)}`}>Request Assistance</a>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
