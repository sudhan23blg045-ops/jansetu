"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Info, FileText, BookOpen, GraduationCap, Building, Award, Wrench, Home, Map, Megaphone, Search, Landmark } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { motion } from "framer-motion";
import { FADE_IN_UP, STAGGER_CONTAINER } from "@/lib/animations";
import { Skeleton } from "@/components/ui/skeleton";

interface NomadicCommunity {
  id: number;
  community_name: string;
  status: string;
}

export default function NomadicCommunitiesPage() {
  const [communities, setCommunities] = useState<NomadicCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchCommunities() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("nomadic_communities")
          .select("id, community_name, status")
          .order("id", { ascending: true });

        if (error) {
          throw error;
        }

        setCommunities(data || []);
      } catch (err: unknown) {
        console.error("Error fetching communities:", err);
        setError(t("common.error"));
      } finally {
        setLoading(false);
      }
    }

    fetchCommunities();
  }, [t]);

  const filteredCommunities = communities.filter(community => 
    community.community_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("communities.title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("communities.desc")}
          </p>
        </div>
      </div>
      
      <motion.div initial="hidden" animate="visible" variants={STAGGER_CONTAINER} className="grid gap-6">
        <motion.div variants={FADE_IN_UP}>
          <Card className="hover:border-primary/50 transition-colors shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Info className="h-5 w-5 text-primary" />
                {t("communities_page.about_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
              <p>{t("communities_page.about_p1")}</p>
              <p>{t("communities_page.about_p2")}</p>
              <p>{t("communities_page.about_p3")}</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={FADE_IN_UP}>
          <Card className="hover:border-primary/50 transition-colors relative overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
            <div className="absolute top-0 right-0">
              <span className="inline-flex items-center rounded-bl-lg border-l border-b border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {t("communities_page.gov_badge")}
              </span>
            </div>
            <CardHeader className="pb-3 pt-6">
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5 text-primary" />
                {t("communities_page.gov_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                {t("communities_page.gov_p1")}
              </p>
              <p>
                {t("communities_page.gov_p2")}
              </p>
              <p>
                {t("communities_page.gov_p3")}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="mt-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">{t("communities_page.programs_title")}</h2>
          <p className="text-muted-foreground mt-2">
            {t("communities_page.programs_desc")}
          </p>
        </div>
        
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={STAGGER_CONTAINER} className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: t("communities_page.prog1_title"),
              desc: t("communities_page.prog1_desc"),
              icon: <BookOpen className="h-6 w-6 text-primary" />,
            },
            {
              title: t("communities_page.prog2_title"),
              desc: t("communities_page.prog2_desc"),
              icon: <GraduationCap className="h-6 w-6 text-primary" />,
            },
            {
              title: t("communities_page.prog3_title"),
              desc: t("communities_page.prog3_desc"),
              icon: <Building className="h-6 w-6 text-primary" />,
            },
            {
              title: t("communities_page.prog4_title"),
              desc: t("communities_page.prog4_desc"),
              icon: <Award className="h-6 w-6 text-primary" />,
            },
            {
              title: t("communities_page.prog5_title"),
              desc: t("communities_page.prog5_desc"),
              icon: <Wrench className="h-6 w-6 text-primary" />,
            },
            {
              title: t("communities_page.prog6_title"),
              desc: t("communities_page.prog6_desc"),
              icon: <Home className="h-6 w-6 text-primary" />,
            },
            {
              title: t("communities_page.prog7_title"),
              desc: t("communities_page.prog7_desc"),
              icon: <Map className="h-6 w-6 text-primary" />,
            },
            {
              title: t("communities_page.prog8_title"),
              desc: t("communities_page.prog8_desc"),
              icon: <Megaphone className="h-6 w-6 text-primary" />,
            }
          ].map((program, idx) => (
            <motion.div key={idx} variants={FADE_IN_UP} whileHover={{ y: -5 }}>
              <Card className="flex flex-col h-full shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:border-primary/30 transition-all duration-300">
                <CardHeader className="pb-3 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {program.icon}
                    </div>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Active
                    </span>
                  </div>
                  <CardTitle className="text-lg leading-tight">{program.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{program.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="mt-16">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("communities_page.list_title")}</h2>
            <p className="text-muted-foreground mt-1">
              {t("communities_page.list_desc")}
            </p>
          </div>
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder={t("communities_page.search_ph")} 
              className="pl-8" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card className="overflow-hidden">
          {loading ? (
            <div className="flex flex-col py-6 space-y-4 px-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4 w-full">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-6 flex-1" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-destructive/10 text-destructive p-4 flex items-center justify-center">
              {error}
            </div>
          ) : filteredCommunities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No communities found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-medium w-24">Sl. No.</th>
                    <th scope="col" className="px-6 py-4 font-medium">Community Name</th>
                    <th scope="col" className="px-6 py-4 font-medium w-48 text-right">Status</th>
                    <th scope="col" className="px-6 py-4 font-medium w-48 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredCommunities.map((community) => (
                    <tr key={community.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-medium">{community.id}</td>
                      <td className="px-6 py-4">{community.community_name}</td>
                      <td className="px-6 py-4 text-right">
                        {community.status && (
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${community.status.toLowerCase() === 'recognized' || community.status.toLowerCase() === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-secondary text-secondary-foreground'}`}>
                            {community.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <Button size="sm" variant="outline" asChild>
                           <a href={`/applications/new?type=Community+Support&item=${encodeURIComponent(community.community_name)}`}>Request Support</a>
                         </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <div className="mt-16">
        <Card className="hover:border-primary/50 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0">
            <span className="inline-flex items-center rounded-bl-lg border-l border-b border-primary/20 bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
              Official Government Body
            </span>
          </div>
          <CardHeader className="pb-3 pt-6">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Landmark className="h-5 w-5 text-primary" />
              Nomadic & Semi-Nomadic Development Board
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p className="font-medium text-foreground">
              Government body responsible for planning and implementing welfare initiatives for Nomadic and Semi-Nomadic Communities in Karnataka.
            </p>
            <p>
              The Government of Karnataka established the Nomadic/Semi-Nomadic Development Board to facilitate the effective implementation of welfare programs and comprehensive development plans for Nomadic and Semi-Nomadic Communities.
            </p>
            
            <div className="mt-6">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">Key Responsibilities</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                  <span>Develop welfare policies and long-term development plans.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                  <span>Coordinate with various government departments.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                  <span>Monitor implementation of education, housing, livelihood, and infrastructure programs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                  <span>Improve access to government benefits.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                  <span>Promote social and economic development.</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
