"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, FileText, Briefcase, Network, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface DashboardCounts {
  schemes: number;
  ngos: number;
  livelihoods: number;
  communities: number;
  users: number;
}

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [
          { count: schemesCount, error: schemesError },
          { count: ngosCount, error: ngosError },
          { count: livelihoodsCount, error: livelihoodsError },
          { count: communitiesCount, error: communitiesError },
          { count: usersCount, error: usersError },
        ] = await Promise.all([
          supabase.from("schemes").select("*", { count: "exact", head: true }),
          supabase.from("ngos").select("*", { count: "exact", head: true }),
          supabase.from("livelihood_opportunities").select("*", { count: "exact", head: true }),
          supabase.from("nomadic_communities").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true }),
        ]);

        // If any of the queries fail, we can display a warning but still show available data, 
        // or just throw an error. For a robust dashboard, we'll try to show what we have.
        if (schemesError || ngosError || livelihoodsError || communitiesError || usersError) {
          console.error("Some queries failed:", { schemesError, ngosError, livelihoodsError, communitiesError, usersError });
          setError("Some data could not be loaded. Please refresh the page.");
        }

        setCounts({
          schemes: schemesCount || 0,
          ngos: ngosCount || 0,
          livelihoods: livelihoodsCount || 0,
          communities: communitiesCount || 0,
          users: usersCount || 0,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Unable to connect to the database. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-14 bg-muted rounded-t-lg" />
              <CardContent className="h-20 bg-muted/50 rounded-b-lg" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Manage platform data, users, and resources.</p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive flex items-center gap-3 p-4 rounded-md mb-6 border border-destructive/20">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {counts && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Government Schemes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.schemes}</div>
              <p className="text-xs text-muted-foreground">Active government schemes</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registered NGOs</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.ngos}</div>
              <p className="text-xs text-muted-foreground">NGOs in the directory</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Livelihood Opportunities</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.livelihoods}</div>
              <p className="text-xs text-muted-foreground">Available jobs and training</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nomadic Communities</CardTitle>
              <Network className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.communities}</div>
              <p className="text-xs text-muted-foreground">Recognized communities</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.users}</div>
              <p className="text-xs text-muted-foreground">Registered user accounts</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
