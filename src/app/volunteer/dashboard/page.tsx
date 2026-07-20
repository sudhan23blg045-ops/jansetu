"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, Clock, AlertCircle, Calendar, ArrowRight, User, Bell } from "lucide-react";
import { format } from "date-fns";

export default function VolunteerDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    assigned: 0,
    completed: 0,
    pending: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login?redirect=/volunteer/dashboard");
        return;
      }

      // Check role
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!userProfile || userProfile.role !== 'volunteer') {
        router.push("/");
        return;
      }
      
      setProfile(userProfile);

      // Fetch assigned applications
      const { data: apps, error } = await supabase
        .from("applications")
        .select("*")
        .eq("assigned_volunteer_id", session.user.id)
        .order("updated_at", { ascending: false });

      if (!error && apps) {
        setApplications(apps);
        setStats({
          assigned: apps.length,
          completed: apps.filter(a => a.status === 'Approved' || a.status === 'Rejected').length,
          pending: apps.filter(a => a.status !== 'Approved' && a.status !== 'Rejected').length,
        });
      }
      
      setLoading(false);
    };

    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-8 flex justify-center items-center min-h-[calc(100vh-80px)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl min-h-[calc(100vh-80px)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Volunteer Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {profile?.full_name}. Here are your assigned tasks.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/volunteer/profile")}>
            <User className="mr-2 h-4 w-4" /> My Profile
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assigned</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assigned}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Action</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Applications</CardTitle>
          <CardDescription>Manage and update applications assigned to you</CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-md border border-dashed">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium mb-1">No Applications Assigned</h3>
              <p className="text-muted-foreground">You will be notified when an admin assigns an application to you.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Applicant</th>
                    <th className="px-4 py-3 font-medium">Request Type</th>
                    <th className="px-4 py-3 font-medium">Assigned Date</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium">{app.full_name}</div>
                        <div className="text-xs text-muted-foreground">{app.mobile_number}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{app.application_type}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">{app.related_item || '-'}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {app.assigned_date ? format(new Date(app.assigned_date), "PP") : "Recently"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                          ${app.status === 'Approved' || app.status === 'Applied on Government Portal' ? 'bg-green-100 text-green-800' :
                            app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            app.status === 'Submitted' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/volunteer/applications/${app.id}`)}>
                          Manage <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
