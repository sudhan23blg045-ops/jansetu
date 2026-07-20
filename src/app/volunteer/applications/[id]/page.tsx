"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Clock, CheckCircle, AlertCircle, FileText, User, MapPin, Download, ExternalLink, Send } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function VolunteerApplicationManager({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchApp = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Check role
      const { data: userProfile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (!userProfile || userProfile.role !== 'volunteer') {
        router.push("/");
        return;
      }

      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("id", id)
        .eq("assigned_volunteer_id", session.user.id)
        .single();

      if (!error && data) {
        setApp(data);
        setNotes(data.volunteer_notes || "");
      }
      setLoading(false);
    };

    fetchApp();
  }, [id, router]);

  const handleUpdateNotes = async () => {
    setUpdating(true);
    const { error } = await supabase
      .from("applications")
      .update({ volunteer_notes: notes })
      .eq("id", app.id);
      
    if (!error) {
      setApp({ ...app, volunteer_notes: notes });
      toast.success("Notes updated successfully");
    } else {
      toast.error("Failed to update notes");
    }
    setUpdating(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", app.id);
      
    if (!error) {
      setApp({ ...app, status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      
      // Send notification to user
      await supabase.from("notifications").insert({
        user_id: app.user_id,
        title: 'Application Updated',
        message: `Your application status has been updated to: ${newStatus}.`
      });
    } else {
      toast.error("Failed to update status");
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <Card className="text-center py-16 border-dashed">
          <CardContent>
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied or Not Found</h2>
            <p className="text-muted-foreground">You do not have permission to manage this application or it doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{app.application_type}</h2>
            <p className="text-muted-foreground">{app.related_item}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full border">
           <span className="text-sm font-medium">Current Status:</span>
           <span className="text-sm font-bold text-primary">{app.status}</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Actions & Notes Column */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
              <CardDescription>Change the workflow stage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant={app.status === 'Documents Verified' ? "default" : "outline"} 
                className="w-full justify-start"
                onClick={() => handleStatusChange('Documents Verified')}
                disabled={updating || app.status === 'Documents Verified'}
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Mark Documents Verified
              </Button>
              <Button 
                variant={app.status === 'Under Review' ? "default" : "outline"} 
                className="w-full justify-start"
                onClick={() => handleStatusChange('Under Review')}
                disabled={updating || app.status === 'Under Review'}
              >
                <Clock className="mr-2 h-4 w-4" /> Move to Under Review
              </Button>
              <Button 
                variant={app.status === 'Applied on Government Portal' ? "default" : "outline"} 
                className="w-full justify-start"
                onClick={() => handleStatusChange('Applied on Government Portal')}
                disabled={updating || app.status === 'Applied on Government Portal'}
              >
                <ExternalLink className="mr-2 h-4 w-4" /> Applied on Gov Portal
              </Button>
              
              <div className="pt-4 mt-4 border-t">
                 <Button 
                   variant="outline" 
                   className="w-full justify-start text-amber-600 border-amber-200 hover:bg-amber-50"
                   onClick={async () => {
                     toast.success("Request sent to applicant");
                     await supabase.from("notifications").insert({
                       user_id: app.user_id,
                       title: 'Additional Documents Required',
                       message: `The volunteer assisting you has requested additional documents for your ${app.application_type} application.`
                     });
                   }}
                 >
                   <AlertCircle className="mr-2 h-4 w-4" /> Request Additional Docs
                 </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Volunteer Notes</CardTitle>
              <CardDescription>Only visible to you and Admins</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                placeholder="Add notes about your progress, missing info, etc..." 
                className="min-h-[150px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <Button onClick={handleUpdateNotes} disabled={updating || notes === app.volunteer_notes} className="w-full">
                <Send className="mr-2 h-4 w-4" /> Save Notes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Applicant Details Column */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Applicant Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="text-base font-medium">{app.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Mobile Number</p>
                  <p className="text-base font-medium">{app.mobile_number}</p>
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
                  <p className="text-base flex items-start gap-1 mt-1">
                     <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                     <span>{app.address}, {app.district}, {app.state}</span>
                  </p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm font-medium text-muted-foreground mb-2">Reason for Request</p>
                <div className="p-3 bg-muted/30 rounded-md text-sm whitespace-pre-wrap">
                  {app.reason_for_request}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Applicant Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {app.document_urls && app.document_urls.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {app.document_urls.map((url: string, i: number) => (
                    <div key={i} className="flex flex-col gap-2 p-3 bg-muted/40 rounded-md border">
                      <div className="flex items-center gap-2 text-sm overflow-hidden mb-2">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate font-medium">Document {i + 1}</span>
                      </div>
                      <div className="flex gap-2 w-full">
                         <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => window.open(url, "_blank")}>
                           <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> View
                         </Button>
                         <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => {
                           const a = document.createElement("a");
                           a.href = url;
                           a.download = `applicant_document_${i+1}`;
                           a.target = "_blank";
                           a.click();
                         }}>
                           <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                         </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8 bg-muted/20 rounded-md border border-dashed">
                   No documents uploaded by applicant.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
