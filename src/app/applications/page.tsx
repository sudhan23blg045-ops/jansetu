"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Clock, CheckCircle, XCircle, AlertCircle, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "@/lib/i18n/LanguageContext";

interface Application {
  id: string;
  application_type: string;
  related_item: string;
  status: string;
  created_at: string;
}

export default function UserApplicationsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login?redirect=/applications");
        return;
      }

      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching applications:", error);
      } else {
        setApplications(data || []);
      }
      setLoading(false);
    };

    fetchApplications();
  }, [router]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "Rejected": return <XCircle className="h-5 w-5 text-red-500" />;
      case "Under Review": return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case "Documents Verified": return <CheckCircle className="h-5 w-5 text-indigo-500" />;
      case "Applied on Government Portal": return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case "Volunteer Assigned": return <AlertCircle className="h-5 w-5 text-purple-500" />;
      default: return <Clock className="h-5 w-5 text-amber-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Rejected": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "Under Review": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Documents Verified": return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400";
      case "Applied on Government Portal": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "Volunteer Assigned": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      default: return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl min-h-[calc(100vh-80px)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Applications</h1>
          <p className="text-muted-foreground">Track the status of your assistance requests</p>
        </div>
        <Button onClick={() => router.push("/applications/new")} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" /> New Application
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-muted/50 rounded-t-xl" />
              <CardContent className="h-32" />
            </Card>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <Card className="text-center py-16 border-dashed bg-muted/10">
          <CardContent>
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Applications Found</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              You haven't submitted any applications yet. Click the button below to request assistance for a scheme, NGO, or livelihood opportunity.
            </p>
            <Button onClick={() => router.push("/applications/new")}>
              <Plus className="mr-2 h-4 w-4" /> Start Your First Application
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {applications.map((app) => (
            <Card key={app.id} className="overflow-hidden hover:border-primary/30 transition-colors">
              <CardHeader className="pb-3 bg-muted/20 border-b">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-lg leading-tight mb-1">{app.application_type}</CardTitle>
                    {app.related_item && (
                      <CardDescription className="font-medium text-foreground">{app.related_item}</CardDescription>
                    )}
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 ${getStatusColor(app.status)}`}>
                    {getStatusIcon(app.status)}
                    {app.status}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 pb-2">
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <Calendar className="mr-2 h-4 w-4" />
                  Submitted on {format(new Date(app.created_at), "PPP")}
                </div>
                
                {/* Timeline UI snippet */}
                <div className="relative pl-6 border-l-2 border-muted space-y-4 my-6">
                   <div className="relative">
                      <div className="absolute -left-[1.65rem] top-1 h-4 w-4 rounded-full border-2 border-background bg-primary"></div>
                      <p className="text-sm font-medium">Application Submitted</p>
                   </div>
                   {app.status !== 'Submitted' && (
                     <div className="relative">
                        <div className="absolute -left-[1.65rem] top-1 h-4 w-4 rounded-full border-2 border-background bg-primary"></div>
                        <p className="text-sm font-medium">Processing Started</p>
                     </div>
                   )}
                   {(app.status === 'Approved' || app.status === 'Applied on Government Portal') && (
                     <div className="relative">
                        <div className="absolute -left-[1.65rem] top-1 h-4 w-4 rounded-full border-2 border-background bg-green-500"></div>
                        <p className="text-sm font-medium">Action Completed</p>
                     </div>
                   )}
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-4">
                 <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push(`/applications/${app.id}`)}
                 >
                    View Details
                 </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
