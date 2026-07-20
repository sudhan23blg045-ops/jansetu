"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, Calendar, Download, ExternalLink, FileText, User, MapPin } from "lucide-react";
import { format } from "date-fns";

interface ApplicationDetails {
  id: string;
  user_id: string;
  full_name: string;
  mobile_number: string;
  email: string;
  state: string;
  district: string;
  community: string;
  address: string;
  application_type: string;
  related_item: string;
  reason_for_request: string;
  additional_notes: string;
  document_urls: string[];
  status: string;
  assigned_volunteer_id?: string;
  assigned_date?: string;
  volunteer_notes?: string;
  government_application_number?: string;
  government_portal_name?: string;
  applied_date?: string;
  created_at: string;
  updated_at: string;
}

const TIMELINE_STEPS = [
  "Submitted",
  "Volunteer Assigned",
  "Documents Verified",
  "Applied on Government Portal",
  "Under Review",
];

export default function ApplicationDetailsPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const router = useRouter();
  const { applicationId } = use(params);
  
  const [app, setApp] = useState<ApplicationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApp = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }

      // Check if user is admin/volunteer or owner
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
        
      const isAdmin = profile?.role === 'admin' || profile?.role === 'volunteer';

      let query = supabase.from("applications").select("*").eq("id", applicationId);
      
      if (!isAdmin) {
        query = query.eq("user_id", session.user.id);
      }

      const { data, error } = await query.single();

      if (error || !data) {
        console.error("Error fetching application:", JSON.stringify(error, null, 2));
        if (error) {
          console.error("Message:", error.message);
          console.error("Details:", error.details);
          console.error("Hint:", error.hint);
          console.error("Code:", error.code);
        }
        setError(error?.message || "Application not found or you do not have permission to view it.");
      } else {
        setApp(data);
      }
      setLoading(false);
    };

    // Initial fetch
    fetchApp();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'applications',
          filter: `id=eq.${applicationId}`,
        },
        (payload) => {
          setApp(payload.new as ApplicationDetails);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [applicationId, router]);

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

  const currentStepIndex = TIMELINE_STEPS.indexOf(app?.status || "Submitted");
  const isApproved = app?.status === "Approved";
  const isRejected = app?.status === "Rejected";

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-8 pt-6 max-w-5xl">
        <Button variant="ghost" className="mb-4" disabled>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Applications
        </Button>
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="container mx-auto p-4 md:p-8 pt-6 max-w-5xl">
        <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Applications
        </Button>
        <Card className="text-center py-16 border-dashed bg-muted/10">
          <CardContent>
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Application Error</h2>
            <p className="text-muted-foreground">{error || "Application not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 pt-6 max-w-5xl min-h-[calc(100vh-80px)]">
      <Button variant="ghost" className="mb-6 -ml-4" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{app.application_type}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${getStatusColor(app.status)}`}>
              {getStatusIcon(app.status)}
              {app.status}
            </span>
          </div>
          <p className="text-muted-foreground text-lg">{app.related_item}</p>
        </div>
        <div className="text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-md">
          <p className="mb-1"><strong>App ID:</strong> {app.id.substring(0, 8).toUpperCase()}</p>
          <p><strong>Submitted:</strong> {format(new Date(app.created_at), "PPP")}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Timeline & Documents */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 pl-4 border-l-2 border-muted relative">
                {TIMELINE_STEPS.map((step, index) => {
                  const isCompleted = isApproved || isRejected || index <= currentStepIndex;
                  const isCurrent = !isApproved && !isRejected && index === currentStepIndex;
                  
                  return (
                    <div key={step} className="relative">
                      <div className={`absolute -left-[1.4rem] top-0.5 h-4 w-4 rounded-full border-2 border-background 
                        ${isCompleted ? 'bg-primary' : 'bg-muted'}`} 
                      />
                      <p className={`text-sm ${isCurrent ? 'font-bold text-foreground' : isCompleted ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                        {step}
                      </p>
                    </div>
                  );
                })}
                
                {isApproved && (
                  <div className="relative pt-2">
                    <div className="absolute -left-[1.4rem] top-2.5 h-4 w-4 rounded-full border-2 border-background bg-green-500" />
                    <p className="text-sm font-bold text-green-600">Approved</p>
                  </div>
                )}
                
                {isRejected && (
                  <div className="relative pt-2">
                    <div className="absolute -left-[1.4rem] top-2.5 h-4 w-4 rounded-full border-2 border-background bg-red-500" />
                    <p className="text-sm font-bold text-red-600">Rejected</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5" /> Uploaded Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {app.document_urls && app.document_urls.length > 0 ? (
                <ul className="space-y-3">
                  {app.document_urls.map((url, i) => (
                    <li key={i} className="flex flex-col gap-2 p-3 bg-muted/40 rounded-md border">
                      <div className="flex items-center gap-2 text-sm overflow-hidden">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate">Document {i + 1}</span>
                      </div>
                      <div className="flex gap-2 w-full">
                         <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => window.open(url, "_blank")}>
                           <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> View
                         </Button>
                         <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => {
                           const a = document.createElement("a");
                           a.href = url;
                           a.download = `document_${i+1}`;
                           a.target = "_blank";
                           a.click();
                         }}>
                           <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                         </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No documents uploaded.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5" /> Applicant Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="text-base">{app.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Mobile Number</p>
                  <p className="text-base">{app.mobile_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                  <p className="text-base">{app.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Community</p>
                  <p className="text-base">{app.community || "Not specified"}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p className="text-base flex items-start gap-1">
                     <MapPin className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                     <span>{app.address}, {app.district}, {app.state}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Reason for Request</p>
                <div className="p-3 bg-muted/30 rounded-md text-sm whitespace-pre-wrap">
                  {app.reason_for_request}
                </div>
              </div>
              
              {app.additional_notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Additional Notes</p>
                  <div className="p-3 bg-muted/30 rounded-md text-sm whitespace-pre-wrap">
                    {app.additional_notes}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Government / Processing Metadata */}
          {(app.government_application_number || app.volunteer_notes) && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">Processing Updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {app.government_application_number && (
                  <div className="grid sm:grid-cols-2 gap-4 bg-background p-4 rounded-md border">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Gov Portal Name</p>
                      <p className="font-semibold">{app.government_portal_name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Gov App Number</p>
                      <p className="font-semibold text-primary">{app.government_application_number}</p>
                    </div>
                    {app.applied_date && (
                      <div className="sm:col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">Applied Date</p>
                        <p>{format(new Date(app.applied_date), "PPP")}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {app.volunteer_notes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Agent Notes</p>
                    <div className="p-3 bg-background border rounded-md text-sm whitespace-pre-wrap">
                      {app.volunteer_notes}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
