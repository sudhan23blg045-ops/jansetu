"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, Bookmark, Clock, Bell, UserCircle, Library, Building, Briefcase, Bot, 
  CheckCircle2, XCircle, FileWarning, Play, Pause, Square, ExternalLink, ArrowRight,
  Inbox, FileCheck2, LayoutDashboard, Settings
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { DashboardCharts } from "@/components/dashboard-charts";
import { format } from "date-fns";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [applications, setApplications] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [ngoSupportCount, setNgoSupportCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      
      const currentUser = session.user;
      setUser(currentUser);
      
      try {
        // 1. Fetch Profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single();
          
        setProfile(profileData || {});

        // 2. Fetch Applications
        const { data: appsData } = await supabase
          .from("applications")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false });
          
        setApplications(appsData || []);
        
        // Count NGO requests
        const ngoRequests = (appsData || []).filter(app => app.application_type === 'NGO Assistance');
        setNgoSupportCount(ngoRequests.length);

        // 3. Fetch Documents
        const { data: docsData, error: docsError } = await supabase
          .from("user_documents")
          .select("*")
          .eq("user_id", currentUser.id);
          
        if (docsError) {
           console.warn("user_documents table might not exist yet.");
           setDocuments([]);
        } else {
           setDocuments(docsData || []);
        }

        // 4. Fetch Notifications
        const { data: notifData } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })
          .limit(5);
          
        setNotifications(notifData || []);

        // 5. Fetch Recommended Schemes (Filter by state if profile has state)
        let query = supabase.from("schemes").select("*").eq("status", "Active").limit(3);
        if (profileData?.state) {
           query = query.eq("state", profileData.state);
        }
        const { data: schemesData } = await query;
        setSchemes(schemesData || []);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
        <Skeleton className="h-12 w-1/3" />
        <div className="grid gap-6 md:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-36 w-full rounded-2xl" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-12">
          <Skeleton className="h-96 w-full col-span-8 rounded-2xl" />
          <Skeleton className="h-96 w-full col-span-4 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const firstName = user.user_metadata?.first_name || profile?.first_name || "User";
  
  // Stats calculations
  const totalApps = applications.length;
  const underReviewApps = applications.filter(a => a.status === 'Under Review' || a.status === 'Submitted').length;
  const approvedApps = applications.filter(a => a.status === 'Approved').length;
  const rejectedApps = applications.filter(a => a.status === 'Rejected').length;
  
  // Charts Data
  const statusData = [
    { name: 'Approved', value: approvedApps },
    { name: 'Pending', value: underReviewApps },
    { name: 'Rejected', value: rejectedApps }
  ].filter(d => d.value > 0);
  
  // Aggregate monthly data
  const monthlyCounts: Record<string, number> = {};
  applications.forEach(app => {
    const month = format(new Date(app.created_at || new Date()), 'MMM yyyy');
    monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
  });
  const monthlyData = Object.entries(monthlyCounts).map(([month, count]) => ({ month, count }));

  // Profile completion logic
  const requiredFields = ['first_name', 'last_name', 'state', 'district', 'community', 'dob', 'gender'];
  let filledFields = 0;
  if (profile) {
    requiredFields.forEach(field => { if (profile[field]) filledFields++; });
  }
  const profileCompletion = Math.round((filledFields / requiredFields.length) * 100);

  // Document types
  const requiredDocs = ['Aadhaar', 'Income Certificate', 'Community Certificate', 'Bank Passbook', 'Ration Card'];
  const uploadedDocTypes = documents.map(d => d.document_type);

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-3 flex-1 w-full max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {firstName}</h1>
          <p className="text-muted-foreground text-sm">Here's an overview of your Jansetu activities and application progress.</p>
          
          <div className="pt-2 space-y-2">
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Profile Completion</span>
              <span>{profileCompletion}%</span>
            </div>
            <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${profileCompletion}%` }} />
            </div>
            {profileCompletion < 100 && (
              <p className="text-xs text-muted-foreground mt-1">Complete your profile to unlock better scheme recommendations.</p>
            )}
          </div>
        </div>
        <Button className="rounded-xl px-6" asChild>
          <Link href="/profile">Edit Profile</Link>
        </Button>
      </div>

      {/* Top Summary Cards (Equal width/height, 24px gap) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-sm border-muted h-full flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Applications Submitted</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><FileText className="h-4 w-4" /></div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-3xl font-bold">{totalApps}</div>
            <p className="text-xs font-medium mt-2 flex gap-2">
              <span className="text-yellow-600 dark:text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded-full">{underReviewApps} Review</span>
              <span className="text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">{approvedApps} Approved</span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl shadow-sm border-muted h-full flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Eligible Schemes</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Bookmark className="h-4 w-4" /></div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-3xl font-bold">{schemes.length}</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              matching schemes found
            </p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl shadow-sm border-muted h-full flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">Documents</CardTitle>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Library className="h-4 w-4" /></div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-3xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              {requiredDocs.length - documents.length} pending documents
            </p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl shadow-sm border-muted h-full flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">NGO & Volunteer</CardTitle>
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><Building className="h-4 w-4" /></div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-3xl font-bold">{ngoSupportCount}</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              Active NGO support requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content (12-column grid, 24px gap) */}
      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* Left Column (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Recent Applications */}
          <Card className="rounded-2xl shadow-sm border-muted flex flex-col min-h-[300px]">
            <CardHeader className="p-6">
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Status of your submitted forms and requests.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-6 pt-0 flex flex-col">
              {applications.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-8">
                  <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                    <FileCheck2 className="h-8 w-8 text-muted-foreground/60" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">No applications yet</p>
                    <p className="text-sm text-muted-foreground">Browse schemes and submit your first application.</p>
                  </div>
                  <Button variant="outline" className="rounded-xl mt-2" asChild>
                    <Link href="/schemes">Browse Schemes</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 5).map((app) => (
                    <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border/50 rounded-xl bg-card/50 hover:bg-muted/30 transition-colors gap-4">
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">{app.related_item || app.application_type}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(app.created_at || new Date()), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 font-medium border-0 ${
                          app.status === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 
                          app.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' : 
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                        }`}>
                          {app.status}
                        </Badge>
                        <Button variant="ghost" size="sm" className="rounded-lg hover:bg-background" asChild>
                          <Link href={`/applications/${app.id}`}>Details</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Analytics (Redesigned) */}
          <Card className="rounded-2xl shadow-sm border-muted min-h-[350px]">
            <CardHeader className="p-6">
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Your application activity and success rate.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <DashboardCharts statusData={statusData} monthlyData={monthlyData} />
            </CardContent>
          </Card>

        </div>

        {/* Right Column (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Actions (2x2 Grid) */}
          <Card className="rounded-2xl shadow-sm border-muted">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 grid grid-cols-2 gap-3">
              <Link href="/schemes" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-border/50 bg-card hover:bg-primary/5 hover:border-primary/30 transition-all text-center group">
                <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs font-semibold">Apply Scheme</span>
              </Link>
              <Link href="/profile" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-border/50 bg-card hover:bg-primary/5 hover:border-primary/30 transition-all text-center group">
                <Library className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs font-semibold">Upload Docs</span>
              </Link>
              <Link href="/livelihoods" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-border/50 bg-card hover:bg-primary/5 hover:border-primary/30 transition-all text-center group">
                <Briefcase className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs font-semibold">Livelihoods</span>
              </Link>
              <Link href="/ngos" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-border/50 bg-card hover:bg-primary/5 hover:border-primary/30 transition-all text-center group">
                <Building className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs font-semibold">Browse NGOs</span>
              </Link>
            </CardContent>
          </Card>

          {/* Sahayak AI Assistant */}
          <Card className="rounded-2xl shadow-sm border-primary/20 bg-primary/5 overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Bot className="h-24 w-24" />
            </div>
            <CardHeader className="p-6 pb-2 relative z-10">
              <CardTitle className="flex items-center gap-2 text-primary text-lg">
                <Bot className="h-5 w-5" /> Sahayak AI Assistant
              </CardTitle>
              <CardDescription className="text-primary/70">
                Get instant help with your applications.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-2 relative z-10">
              <Button variant="outline" className="w-full justify-between rounded-xl bg-background/50 hover:bg-background border-primary/20 hover:text-primary" asChild>
                <Link href="/sahayak-ai">Find Eligible Schemes <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button variant="outline" className="w-full justify-between rounded-xl bg-background/50 hover:bg-background border-primary/20 hover:text-primary" asChild>
                <Link href="/sahayak-ai">Application Status <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>

          {/* My Documents */}
          <Card className="rounded-2xl shadow-sm border-muted">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-lg">My Documents</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-3">
                {requiredDocs.map(docName => {
                  const isUploaded = uploadedDocTypes.includes(docName);
                  return (
                    <div key={docName} className="flex items-center justify-between text-sm py-1 border-b border-border/40 last:border-0">
                      <span className="font-medium text-foreground">{docName}</span>
                      {isUploaded ? (
                        <span className="flex items-center text-green-600 dark:text-green-500 gap-1.5 font-medium"><CheckCircle2 className="h-4 w-4"/> Uploaded</span>
                      ) : (
                        <span className="flex items-center text-red-600 dark:text-red-500 gap-1.5 font-medium"><XCircle className="h-4 w-4"/> Missing</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="rounded-2xl shadow-sm border-muted flex flex-col min-h-[250px]">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                Notifications
                {notifications.length > 0 && <Badge className="bg-primary text-primary-foreground rounded-full px-2 py-0.5">{notifications.length}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-6 pt-0 flex flex-col">
              {notifications.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 py-6">
                  <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
                    <Inbox className="h-6 w-6 text-muted-foreground/60" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">All caught up!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map(n => (
                    <div key={n.id} className="flex gap-3 p-3 border border-border/40 rounded-xl hover:bg-muted/40 transition-colors">
                      <div className="mt-0.5 shrink-0">
                         {n.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                          n.type === 'warning' ? <FileWarning className="h-4 w-4 text-yellow-500" /> :
                          <Bell className="h-4 w-4 text-blue-500" />}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold leading-none">{n.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
      
    </div>
  );
}
