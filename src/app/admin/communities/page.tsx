"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Table as ShadcnTable,
  TableBody as ShadcnTableBody,
  TableCell as ShadcnTableCell,
  TableHead as ShadcnTableHead,
  TableHeader as ShadcnTableHeader,
  TableRow as ShadcnTableRow,
} from "@/components/ui/table";

import { CommunityFormModal, CommunityFormData } from "@/components/admin/communities/CommunityFormModal";
import { DeleteConfirmDialog } from "@/components/admin/crud/DeleteConfirmDialog";

export default function AdminCommunitiesPage() {
  const [communities, setCommunities] = useState<CommunityFormData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [stateFilter, setStateFilter] = useState("All");

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityFormData | null>(null);
  
  // Delete Dialog States
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [communityToDelete, setCommunityToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("nomadic_communities")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setCommunities(data || []);
    } catch (err: unknown) {
      console.error("Error fetching communities:", err);
      toast.error("Failed to load communities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCommunities();
  }, []);

  const handleEdit = (community: CommunityFormData) => {
    setSelectedCommunity(community);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedCommunity(null);
    setIsFormOpen(true);
  };

  const confirmDelete = (id: string) => {
    setCommunityToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!communityToDelete) return;
    setIsDeleting(true);
    
    try {
      const response = await supabase
        .from("nomadic_communities")
        .delete()
        .eq("id", communityToDelete)
        .select();

      if (response.error) {
        throw new Error(`Supabase Error: ${response.error.message}`);
      }

      if (!response.data || response.data.length === 0) {
        throw new Error("Delete failed silently: No rows were deleted. This is usually caused by Row Level Security (RLS) policies blocking the DELETE operation.");
      }
      
      toast.success("Community deleted successfully");
      fetchCommunities();
    } catch (err: unknown) {
      console.error("Error deleting community:", err);
      toast.error("Failed to delete the community.");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setCommunityToDelete(null);
    }
  };

  // Filter Data
  const filteredCommunities = communities.filter((community) => {
    const matchesSearch = 
      community.community_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.category?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === "All" || community.status === statusFilter;
    const matchesState = stateFilter === "All" || community.state === stateFilter;

    return matchesSearch && matchesStatus && matchesState;
  });

  // Extract unique states for filter dropdown
  const uniqueStates = Array.from(new Set(
    communities.map(c => c.state).filter((s): s is string => typeof s === 'string' && s !== '')
  )).sort();

  return (
    <div className="flex-1 space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nomadic Communities</h1>
          <p className="text-muted-foreground mt-1">Manage data regarding nomadic and semi-nomadic tribes.</p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Community
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search by community name, state or category..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <select 
          className="flex h-10 w-full md:w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
        >
          <option value="All">All States</option>
          {uniqueStates.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>

        <select 
          className="flex h-10 w-full md:w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Review">Review</option>
        </select>
        
        <Button variant="outline" size="icon" onClick={fetchCommunities} title="Refresh Table">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <ShadcnTable>
            <ShadcnTableHeader>
              <ShadcnTableRow>
                <ShadcnTableHead>Community Name</ShadcnTableHead>
                <ShadcnTableHead>State</ShadcnTableHead>
                <ShadcnTableHead>Category</ShadcnTableHead>
                <ShadcnTableHead>Status</ShadcnTableHead>
                <ShadcnTableHead className="text-right">Actions</ShadcnTableHead>
              </ShadcnTableRow>
            </ShadcnTableHeader>
            <ShadcnTableBody>
              {loading ? (
                <ShadcnTableRow>
                  <ShadcnTableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Loading communities...
                  </ShadcnTableCell>
                </ShadcnTableRow>
              ) : filteredCommunities.length === 0 ? (
                <ShadcnTableRow>
                  <ShadcnTableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No communities found.
                  </ShadcnTableCell>
                </ShadcnTableRow>
              ) : (
                filteredCommunities.map((community) => (
                  <ShadcnTableRow key={community.id}>
                    <ShadcnTableCell className="font-medium">{community.community_name}</ShadcnTableCell>
                    <ShadcnTableCell>{community.state}</ShadcnTableCell>
                    <ShadcnTableCell>{community.category || 'N/A'}</ShadcnTableCell>
                    <ShadcnTableCell>
                      <Badge variant={
                        community.status === "Active" ? "default" :
                        community.status === "Inactive" ? "secondary" : "outline"
                      }>
                        {community.status}
                      </Badge>
                    </ShadcnTableCell>
                    <ShadcnTableCell className="text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEdit(community)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => community.id && confirmDelete(community.id.toString())}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </ShadcnTableCell>
                  </ShadcnTableRow>
                ))
              )}
            </ShadcnTableBody>
          </ShadcnTable>
        </div>
      </div>

      <CommunityFormModal
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={selectedCommunity}
        onSuccess={fetchCommunities}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
