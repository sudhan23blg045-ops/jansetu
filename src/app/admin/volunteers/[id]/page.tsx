"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, XCircle, Clock, MapPin, Briefcase, Mail, Phone, Calendar, Download, ExternalLink, ShieldCheck, FileText, Medal, Award, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function AdminVolunteerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [vol, setVol] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchVolunteer = async () => {
      const { data, error } = await supabase
        .from("volunteer_registrations")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setVol(data);
      }
      setLoading(false);
    };

    fetchVolunteer();
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    if (!vol) return;
    setUpdating(true);
    
    const { error } = await supabase
      .from("volunteer_registrations")
      .update({ status: newStatus })
      .eq("id", vol.id);
      
    if (!error) {
      setVol({ ...vol, status: newStatus });
    } else {
      console.error("Error updating status:", error);
    }
    
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
         <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!vol) {
    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Volunteers
        </Button>
        <Card className="text-center py-16 border-dashed">
          <CardContent>
            <h2 className="text-xl font-semibold mb-2">Registration Not Found</h2>
            <p className="text-muted-foreground">The volunteer registration you are looking for does not exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 pt-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{vol.full_name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold
                ${vol.status === 'Approved' ? 'bg-green-100 text-green-800' :
                  vol.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                {vol.status === 'Approved' && <CheckCircle className="h-3 w-3" />}
                {vol.status === 'Rejected' && <XCircle className="h-3 w-3" />}
                {vol.status === 'Pending' && <Clock className="h-3 w-3" />}
                {vol.status}
              </span>
              <span className="text-sm text-muted-foreground">
                Registered on {format(new Date(vol.created_at), "PPP")}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          {vol.status !== 'Approved' && (
            <Button 
              onClick={() => updateStatus('Approved')} 
              disabled={updating}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Approve
            </Button>
          )}
          {vol.status !== 'Rejected' && (
            <Button 
              onClick={() => updateStatus('Rejected')} 
              disabled={updating}
              variant="destructive"
              className="w-full sm:w-auto"
            >
              <XCircle className="mr-2 h-4 w-4" /> Reject
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm">{vol.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm">{vol.mobile_number}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-sm">{vol.address}, {vol.district}, {vol.state}</span>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm">{vol.occupation} {vol.organization ? `at ${vol.organization}` : ''}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm">Available: {vol.availability}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verification Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted/40 rounded-md border flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm truncate font-medium">Aadhaar Card</span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => window.open(vol.aadhaar_url, "_blank")}>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="p-3 bg-muted/40 rounded-md border flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <UserCheck className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm truncate font-medium">Profile Photo</span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => window.open(vol.profile_photo_url, "_blank")}>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
             <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                   <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" /> Assigned
                   </div>
                   <span className="font-semibold">{vol.applications_assigned || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                   <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" /> Completed
                   </div>
                   <span className="font-semibold">{vol.applications_completed || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-blue-500" /> Avg Process Time
                   </div>
                   <span className="font-semibold text-sm">2.4 days</span>
                </div>
             </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skills & Languages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {vol.skills?.map((skill: string) => (
                    <span key={skill} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-md font-medium border border-primary/20">
                      {skill}
                    </span>
                  ))}
                  {(!vol.skills || vol.skills.length === 0) && <span className="text-sm text-muted-foreground">None specified</span>}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Languages</h4>
                <div className="flex flex-wrap gap-2">
                  {vol.languages?.map((lang: string) => (
                    <span key={lang} className="px-3 py-1 bg-muted text-foreground text-sm rounded-md font-medium border">
                      {lang}
                    </span>
                  ))}
                  {(!vol.languages || vol.languages.length === 0) && <span className="text-sm text-muted-foreground">None specified</span>}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {vol.status === 'Approved' && (
             <Card>
               <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Active Assignments</CardTitle>
                    <CardDescription>Applications currently assigned to this volunteer</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">Assign Application</Button>
               </CardHeader>
               <CardContent>
                  <div className="text-center py-8 bg-muted/20 border border-dashed rounded-md mt-4">
                     <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                     <p className="text-sm text-muted-foreground">No active assignments</p>
                  </div>
               </CardContent>
             </Card>
          )}

          {/* Future Ready Display (Ratings / Badges) */}
          {vol.status === 'Approved' && (
             <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-900/50">
                   <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                         <Medal className="h-4 w-4 text-amber-500" /> Ratings & Reviews
                      </CardTitle>
                   </CardHeader>
                   <CardContent>
                      <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">4.8 <span className="text-sm font-normal text-muted-foreground">/ 5.0</span></div>
                      <p className="text-xs text-muted-foreground mt-1">Based on 12 applicant reviews</p>
                   </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-900/50">
                   <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                         <Award className="h-4 w-4 text-blue-500" /> Badges Earned
                      </CardTitle>
                   </CardHeader>
                   <CardContent>
                      <div className="flex gap-2">
                         <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center" title="Fast Responder">⚡</div>
                         <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center" title="10+ Completions">🌟</div>
                         <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center" title="Community Champion">🏆</div>
                      </div>
                   </CardContent>
                </Card>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

// UserCheck icon missing from lucide-react import above
function UserCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  )
}
