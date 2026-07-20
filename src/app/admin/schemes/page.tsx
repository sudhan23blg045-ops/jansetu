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

import { SchemeFormModal, SchemeFormData } from "@/components/admin/schemes/SchemeFormModal";
import { DeleteConfirmDialog } from "@/components/admin/crud/DeleteConfirmDialog";

export default function AdminSchemesPage() {
  const [schemes, setSchemes] = useState<SchemeFormData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<SchemeFormData | null>(null);
  
  // Delete Dialog States
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [schemeToDelete, setSchemeToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("schemes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setSchemes(data || []);
    } catch (err: unknown) {
      console.error("Error fetching schemes:", err);
      toast.error("Failed to load schemes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSchemes();
  }, []);

  const handleEdit = (scheme: SchemeFormData) => {
    setSelectedScheme(scheme);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedScheme(null);
    setIsFormOpen(true);
  };

  const confirmDelete = (id: string) => {
    setSchemeToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!schemeToDelete) return;
    setIsDeleting(true);
    
    try {
      const response = await supabase
        .from("schemes")
        .delete()
        .eq("id", schemeToDelete)
        .select();

      if (response.error) {
        throw new Error(`Supabase Error: ${response.error.message}`);
      }

      if (!response.data || response.data.length === 0) {
        throw new Error("Delete failed silently: No rows were deleted. This is usually caused by Row Level Security (RLS) policies blocking the DELETE operation.");
      }
      
      toast.success("Scheme deleted successfully");
      fetchSchemes();
    } catch (err: unknown) {
      console.error("Error deleting scheme:", err);
      toast.error("Failed to delete the scheme.");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSchemeToDelete(null);
    }
  };

  // Filter Data
  const filteredSchemes = schemes.filter((scheme) => {
    const matchesSearch = 
      scheme.scheme_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.state?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === "All" || scheme.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Government Schemes</h1>
          <p className="text-muted-foreground mt-1">Manage and review all government schemes data.</p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Scheme
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search schemes by name, category, or state..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* We can use native select or a simple button toggle for status filter to save space/complexity for now */}
        <select 
          className="flex h-10 w-full md:w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Draft">Draft</option>
        </select>
        
        <Button variant="outline" size="icon" onClick={fetchSchemes} title="Refresh Table">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <ShadcnTable>
          <ShadcnTableHeader>
            <ShadcnTableRow>
              <ShadcnTableHead>Scheme Name</ShadcnTableHead>
              <ShadcnTableHead>Category</ShadcnTableHead>
              <ShadcnTableHead>State</ShadcnTableHead>
              <ShadcnTableHead>Status</ShadcnTableHead>
              <ShadcnTableHead className="text-right">Actions</ShadcnTableHead>
            </ShadcnTableRow>
          </ShadcnTableHeader>
          <ShadcnTableBody>
            {loading ? (
              <ShadcnTableRow>
                <ShadcnTableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Loading schemes...
                </ShadcnTableCell>
              </ShadcnTableRow>
            ) : filteredSchemes.length === 0 ? (
              <ShadcnTableRow>
                <ShadcnTableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No schemes found.
                </ShadcnTableCell>
              </ShadcnTableRow>
            ) : (
              filteredSchemes.map((scheme) => (
                <ShadcnTableRow key={scheme.id}>
                  <ShadcnTableCell className="font-medium">{scheme.scheme_name}</ShadcnTableCell>
                  <ShadcnTableCell>{scheme.category}</ShadcnTableCell>
                  <ShadcnTableCell>{scheme.state}</ShadcnTableCell>
                  <ShadcnTableCell>
                    <Badge variant={
                      scheme.status === "Active" ? "default" :
                      scheme.status === "Inactive" ? "secondary" : "outline"
                    }>
                      {scheme.status}
                    </Badge>
                  </ShadcnTableCell>
                  <ShadcnTableCell className="text-right space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEdit(scheme)}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => scheme.id && confirmDelete(scheme.id.toString())}
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

      <SchemeFormModal
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={selectedScheme}
        onSuccess={fetchSchemes}
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
