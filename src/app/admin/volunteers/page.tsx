"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserCheck, Users, Clock, ShieldAlert, FileText, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function AdminVolunteersPage() {
  const router = useRouter();
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    rejected: 0,
  });

  const fetchVolunteers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("volunteer_registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setVolunteers(data);
      setStats({
        total: data.length,
        active: data.filter((v: any) => v.status === "Approved").length,
        pending: data.filter((v: any) => v.status === "Pending").length,
        rejected: data.filter((v: any) => v.status === "Rejected").length,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const filteredVolunteers = volunteers.filter((v: any) => {
    const matchesSearch = 
      v.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.skills && v.skills.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (v.languages && v.languages.some((l: string) => l.toLowerCase().includes(searchQuery.toLowerCase())));
      
    const matchesStatus = statusFilter === "All" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Volunteer Management</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registered</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active (Approved)</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-500" />
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
              <CardTitle>Volunteers</CardTitle>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search name, location, skills..."
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
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Skills</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y cursor-pointer">
                {loading ? (
                   <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading volunteers...</td></tr>
                ) : filteredVolunteers.length === 0 ? (
                   <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No volunteers found.</td></tr>
                ) : (
                  filteredVolunteers.map((vol: any) => (
                    <tr 
                      key={vol.id} 
                      onClick={() => router.push(`/admin/volunteers/${vol.id}`)} 
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{vol.full_name}</div>
                        <div className="text-xs text-muted-foreground">{vol.mobile_number}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {vol.district}, {vol.state}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {vol.skills?.slice(0, 2).map((skill: string) => (
                            <span key={skill} className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded font-medium">
                              {skill}
                            </span>
                          ))}
                          {vol.skills?.length > 2 && (
                            <span className="px-1.5 py-0.5 bg-muted text-muted-foreground text-[10px] rounded font-medium">
                              +{vol.skills.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{format(new Date(vol.created_at), "PP")}</td>
                      <td className="px-4 py-3 text-right">
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
