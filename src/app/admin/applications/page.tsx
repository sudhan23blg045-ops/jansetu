"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText, Search, Clock, CheckCircle, XCircle, Users } from "lucide-react";
import { format } from "date-fns";
import ApplicationDetailsModal from "@/components/admin/applications/ApplicationDetailsModal";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  
  // Analytics State
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    thisMonth: 0,
  });

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setApplications(data);
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      setStats({
        total: data.length,
        pending: data.filter(a => a.status === 'Submitted' || a.status === 'Under Review' || a.status === 'Volunteer Assigned').length,
        approved: data.filter(a => a.status === 'Approved' || a.status === 'Applied on Government Portal').length,
        rejected: data.filter(a => a.status === 'Rejected').length,
        thisMonth: data.filter(a => {
          const date = new Date(a.created_at);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }).length,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.application_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.related_item?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Manage Applications</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active & Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved / Processed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle>Application Requests</CardTitle>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Volunteer Assigned">Volunteer Assigned</option>
                <option value="Documents Verified">Documents Verified</option>
                <option value="Applied on Government Portal">Applied on Government Portal</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applicant or type..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Applicant Name</th>
                  <th className="px-4 py-3 font-medium">Mobile</th>
                  <th className="px-4 py-3 font-medium">State</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Related Item</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y cursor-pointer">
                {loading ? (
                   <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Loading applications...</td></tr>
                ) : filteredApps.length === 0 ? (
                   <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No applications found.</td></tr>
                ) : (
                  filteredApps.map((app) => (
                    <tr key={app.id} onClick={() => setSelectedAppId(app.id)} className="hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{app.full_name}</td>
                      <td className="px-4 py-3">{app.mobile_number}</td>
                      <td className="px-4 py-3">{app.state}</td>
                      <td className="px-4 py-3">{app.application_type}</td>
                      <td className="px-4 py-3">{app.related_item || "-"}</td>
                      <td className="px-4 py-3">{format(new Date(app.created_at), "PP")}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                          ${app.status === 'Approved' || app.status === 'Applied on Government Portal' ? 'bg-green-100 text-green-800' :
                            app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            app.status === 'Submitted' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedAppId && (
        <ApplicationDetailsModal
          applicationId={selectedAppId}
          onClose={() => {
            setSelectedAppId(null);
            fetchApplications();
          }}
        />
      )}
    </div>
  );
}
