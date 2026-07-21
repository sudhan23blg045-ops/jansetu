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
  CheckCircle2, XCircle, FileWarning, Play, Pause, Square, ExternalLink, ArrowRight
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

        // 3. Fetch Documents (Fallback to checking application document_urls if user_documents table fails)
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
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-12 w-1/3" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-7">
          <Skeleton className="h-96 w-full col-span-4" />
          <Skeleton className="h-96 w-full col-span-3" />
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
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-2 flex-1 w-full max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {firstName}</h1>
          <p className="text-muted-foreground">Here's an overview of your Jansetu activities and application progress.</p>
          
          <div className="pt-4 space-y-2">
            <div className="flex justify-between text-sm font-medium">
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
        <Button asChild>
          <Link href="/profile">Edit Profile</Link>
        </Button>
      </div>

      {/* Top Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications Submitted</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApps}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-yellow-500 font-medium">{underReviewApps} Review</span> • <span className="text-green-500 font-medium">{approvedApps} Approved</span>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eligible Schemes</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schemes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              matching schemes found
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <Library className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {requiredDocs.length - documents.length} pending documents
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NGO & Volunteer Support</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ngoSupportCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active NGO support requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-7">
        
        {/* Left Column (Span 4) */}
        <div className="col-span-1 md:col-span-4 space-y-6">
          
          {/* Recent Applications */}
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Status of your submitted forms and requests.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                  <FileText className="h-10 w-10 text-muted-foreground/50" />
                  <p className="text-muted-foreground">You haven't applied for any schemes yet.</p>
                  <Button variant="outline" asChild>
                    <Link href="/schemes">Browse Government Schemes</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.slice(0, 5).map((app) => (
                    <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-card gap-4">
                      <div>
                        <h4 className="font-semibold text-sm">{app.related_item || app.application_type}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(app.created_at || new Date()), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          app.status === 'Approved' ? 'default' : 
                          app.status === 'Rejected' ? 'destructive' : 
                          'secondary'
                        }>
                          {app.status}
                        </Badge>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/applications/${app.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Your application activity and success rate.</CardDescription>
            </CardHeader>
            <CardContent>
              <DashboardCharts statusData={statusData} monthlyData={monthlyData} />
            </CardContent>
          </Card>

        </div>

        {/* Right Column (Span 3) */}
        <div className="col-span-1 md:col-span-3 space-y-6">
          
          {/* Recommended Schemes */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended For You</CardTitle>
              <CardDescription>Government schemes matching your profile.</CardDescription>
            </CardHeader>
            <CardContent>
              {profileCompletion < 50 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-4">Complete your profile to receive personalized recommendations.</p>
                  <Button variant="outline" size="sm" asChild><Link href="/profile">Edit Profile</Link></Button>
                </div>
              ) : schemes.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">No new recommendations available.</div>
              ) : (
                <div className="space-y-4">
                  {schemes.map(scheme => (
                    <div key={scheme.id} className="p-3 border rounded-lg bg-muted/30">
                      <h4 className="font-semibold text-sm line-clamp-1">{scheme.scheme_name}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{scheme.description}</p>
                      <div className="mt-3 flex gap-2">
                        <Button variant="default" size="sm" className="w-full text-xs h-8" asChild>
                          <Link href={`/applications/new?scheme=${scheme.id}`}>Apply Now</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Documents */}
          <Card>
            <CardHeader>
              <CardTitle>My Documents</CardTitle>
              <CardDescription>Upload status of required paperwork.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {requiredDocs.map(docName => {
                  const isUploaded = uploadedDocTypes.includes(docName);
                  return (
                    <div key={docName} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-muted-foreground">{docName}</span>
                      {isUploaded ? (
                        <span className="flex items-center text-green-500 gap-1"><CheckCircle2 className="h-4 w-4"/> Uploaded</span>
                      ) : (
                        <span className="flex items-center text-red-500 gap-1"><XCircle className="h-4 w-4"/> Missing</span>
                      )}
                    </div>
                  );
                })}
                <Button variant="outline" className="w-full mt-4" asChild>
                   <Link href="/profile">Upload Missing Documents</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Notifications
                {notifications.length > 0 && <Badge variant="secondary" className="rounded-full px-2 py-0.5">{notifications.length}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">No new notifications.</div>
              ) : (
                <div className="space-y-3">
                  {notifications.map(n => (
                    <div key={n.id} className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="mt-0.5">
                         {n.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                          n.type === 'warning' ? <FileWarning className="h-4 w-4 text-yellow-500" /> :
                          <Bell className="h-4 w-4 text-blue-500" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
      
      {/* Quick Actions & Widgets */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Bot className="h-5 w-5" /> Sahayak AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary" asChild>
              <Link href="/sahayak-ai">Find Eligible Schemes <ArrowRight className="ml-auto h-4 w-4" /></Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary" asChild>
              <Link href="/sahayak-ai">Check Application Status <ArrowRight className="ml-auto h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
               Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" asChild><Link href="/schemes">Apply for Scheme</Link></Button>
            <Button variant="outline" size="sm" asChild><Link href="/ngos">Browse NGOs</Link></Button>
            <Button variant="outline" size="sm" asChild><Link href="/livelihoods">Find Livelihoods</Link></Button>
            <Button variant="outline" size="sm" asChild><Link href="/profile">Upload Docs</Link></Button>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
