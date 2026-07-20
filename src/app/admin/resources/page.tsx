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

import { ResourceFormModal, ResourceFormData } from "@/components/admin/resources/ResourceFormModal";
import { DeleteConfirmDialog } from "@/components/admin/crud/DeleteConfirmDialog";

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<ResourceFormData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<ResourceFormData | null>(null);
  
  // Delete Dialog States
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message || "Supabase Error");
      }

      setResources(data || []);
    } catch (err: any) {
      console.error("Error fetching resources:", err);
      toast.error(err.message || "Failed to load resources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleEdit = (resource: ResourceFormData) => {
    setSelectedResource(resource);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedResource(null);
    setIsFormOpen(true);
  };

  const confirmDelete = (id: string) => {
    setResourceToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!resourceToDelete) return;
    setIsDeleting(true);
    
    try {
      const response = await supabase
        .from("resources")
        .delete()
        .eq("id", resourceToDelete)
        .select();

      if (response.error) {
        throw new Error(`Supabase Error: ${response.error.message}`);
      }

      if (!response.data || response.data.length === 0) {
        throw new Error("Delete failed silently: No rows were deleted. This might be a Row Level Security (RLS) issue.");
      }
      
      toast.success("Resource deleted successfully");
      fetchResources();
    } catch (err: unknown) {
      console.error("Error deleting resource:", err);
      toast.error(err instanceof Error ? err.message : "Failed to delete resource");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setResourceToDelete(null);
    }
  };

  const filteredResources = resources.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          res.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || res.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Resources</h1>
          <p className="text-muted-foreground">Add, edit, or remove resources from the public directory.</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="h-4 w-4" /> Add Resource
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search by title or source..." 
            className="pl-8" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          {["All", "Guidelines", "Community Lists", "Reports", "Government Links", "Success Stories"].map(cat => (
            <Badge 
              key={cat}
              variant={categoryFilter === cat ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap px-3 py-1 text-sm shrink-0"
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
        <Button variant="ghost" size="icon" onClick={fetchResources} disabled={loading} title="Refresh Data">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <ShadcnTable>
            <ShadcnTableHeader>
              <ShadcnTableRow className="bg-muted/50">
                <ShadcnTableHead className="w-[300px]">Title & Source</ShadcnTableHead>
                <ShadcnTableHead>Category</ShadcnTableHead>
                <ShadcnTableHead>Type</ShadcnTableHead>
                <ShadcnTableHead className="text-right">Actions</ShadcnTableHead>
              </ShadcnTableRow>
            </ShadcnTableHeader>
            <ShadcnTableBody>
              {loading ? (
                <ShadcnTableRow>
                  <ShadcnTableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" /> Loading resources...
                    </div>
                  </ShadcnTableCell>
                </ShadcnTableRow>
              ) : filteredResources.length === 0 ? (
                <ShadcnTableRow>
                  <ShadcnTableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                    No resources found. Add a new resource to get started.
                  </ShadcnTableCell>
                </ShadcnTableRow>
              ) : (
                filteredResources.map((resource) => (
                  <ShadcnTableRow key={resource.id} className="group hover:bg-muted/30">
                    <ShadcnTableCell>
                      <div className="font-medium truncate max-w-[280px]" title={resource.title}>{resource.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[280px]" title={resource.source}>{resource.source}</div>
                    </ShadcnTableCell>
                    <ShadcnTableCell>
                      <Badge variant="outline" className="font-normal bg-primary/5 text-primary border-primary/20">
                        {resource.category}
                      </Badge>
                    </ShadcnTableCell>
                    <ShadcnTableCell>
                      <span className="text-xs font-semibold px-2 py-1 bg-muted rounded-md text-muted-foreground">
                        {resource.resource_type}
                      </span>
                    </ShadcnTableCell>
                    <ShadcnTableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(resource)} className="h-8 border-primary/20 hover:bg-primary/10 hover:text-primary">
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => confirmDelete(resource.id!)} className="h-8 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </ShadcnTableCell>
                  </ShadcnTableRow>
                ))
              )}
            </ShadcnTableBody>
          </ShadcnTable>
        </div>
      </div>

      <ResourceFormModal
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={selectedResource}
        onSuccess={fetchResources}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Resource"
        description="Are you sure you want to delete this resource? This action cannot be undone."
        isDeleting={isDeleting}
      />
    </div>
  );
}
