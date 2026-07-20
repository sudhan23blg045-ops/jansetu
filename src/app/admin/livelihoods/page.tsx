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

import { LivelihoodFormModal, LivelihoodFormData } from "@/components/admin/livelihoods/LivelihoodFormModal";
import { DeleteConfirmDialog } from "@/components/admin/crud/DeleteConfirmDialog";

export default function AdminLivelihoodsPage() {
  const [opportunities, setOpportunities] = useState<LivelihoodFormData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<LivelihoodFormData | null>(null);
  
  // Delete Dialog States
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [opportunityToDelete, setOpportunityToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("livelihood_opportunities")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setOpportunities(data || []);
    } catch (err: unknown) {
      console.error("Error fetching opportunities:", err);
      toast.error("Failed to load opportunities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOpportunities();
  }, []);

  const handleEdit = (opportunity: LivelihoodFormData) => {
    setSelectedOpportunity(opportunity);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedOpportunity(null);
    setIsFormOpen(true);
  };

  const confirmDelete = (id: string) => {
    setOpportunityToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!opportunityToDelete) return;
    setIsDeleting(true);
    
    try {
      const response = await supabase
        .from("livelihood_opportunities")
        .delete()
        .eq("id", opportunityToDelete)
        .select();

      if (response.error) {
        throw new Error(`Supabase Error: ${response.error.message}`);
      }

      if (!response.data || response.data.length === 0) {
        throw new Error("Delete failed silently: No rows were deleted. This is usually caused by Row Level Security (RLS) policies blocking the DELETE operation.");
      }
      
      toast.success("Opportunity deleted successfully");
      fetchOpportunities();
    } catch (err: unknown) {
      console.error("Error deleting opportunity:", err);
      toast.error("Failed to delete the opportunity.");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setOpportunityToDelete(null);
    }
  };

  // Filter Data
  const filteredOpportunities = opportunities.filter((opportunity) => {
    const matchesSearch = 
      opportunity.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opportunity.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opportunity.location?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === "All" || opportunity.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Livelihood Opportunities</h1>
          <p className="text-muted-foreground mt-1">Manage jobs, gigs, and skill-based opportunities.</p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Opportunity
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search by title, category, location or type..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <select 
          className="flex h-10 w-full md:w-[150px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Closed">Closed</option>
          <option value="Draft">Draft</option>
        </select>
        
        <Button variant="outline" size="icon" onClick={fetchOpportunities} title="Refresh Table">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <ShadcnTable>
            <ShadcnTableHeader>
              <ShadcnTableRow>
              <ShadcnTableHead>Opportunity Title</ShadcnTableHead>
              <ShadcnTableHead>Category</ShadcnTableHead>
              <ShadcnTableHead>Provider</ShadcnTableHead>
              <ShadcnTableHead>Location</ShadcnTableHead>
              <ShadcnTableHead>Duration</ShadcnTableHead>
              <ShadcnTableHead>Status</ShadcnTableHead>
              <ShadcnTableHead className="text-right">Actions</ShadcnTableHead>
            </ShadcnTableRow>
            </ShadcnTableHeader>
            <ShadcnTableBody>
              {loading ? (
                <ShadcnTableRow>
                  <ShadcnTableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Loading opportunities...
                  </ShadcnTableCell>
                </ShadcnTableRow>
              ) : filteredOpportunities.length === 0 ? (
                <ShadcnTableRow>
                  <ShadcnTableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No opportunities found.
                  </ShadcnTableCell>
                </ShadcnTableRow>
              ) : (
                filteredOpportunities.map((opportunity) => (
                  <ShadcnTableRow key={opportunity.id}>
                  <ShadcnTableCell className="font-medium">{opportunity.title}</ShadcnTableCell>
                  <ShadcnTableCell>{opportunity.category || "N/A"}</ShadcnTableCell>
                  <ShadcnTableCell>{opportunity.provider || "N/A"}</ShadcnTableCell>
                  <ShadcnTableCell>{opportunity.location || "N/A"}</ShadcnTableCell>
                  <ShadcnTableCell>{opportunity.duration || "N/A"}</ShadcnTableCell>
                  <ShadcnTableCell>
                    <Badge variant={
                      opportunity.status === "Active" ? "default" :
                      opportunity.status === "Inactive" ? "secondary" : "outline"
                    }>
                      {opportunity.status}
                    </Badge>
                  </ShadcnTableCell>
                    <ShadcnTableCell className="text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEdit(opportunity)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => opportunity.id && confirmDelete(opportunity.id.toString())}
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

      <LivelihoodFormModal
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={selectedOpportunity}
        onSuccess={fetchOpportunities}
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
