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

import { NgoFormModal, NgoFormData } from "@/components/admin/ngos/NgoFormModal";
import { DeleteConfirmDialog } from "@/components/admin/crud/DeleteConfirmDialog";

export default function AdminNgosPage() {
  const [ngos, setNgos] = useState<NgoFormData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedNgo, setSelectedNgo] = useState<NgoFormData | null>(null);
  
  // Delete Dialog States
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ngoToDelete, setNgoToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchNgos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("ngos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setNgos(data || []);
    } catch (err: unknown) {
      console.error("Error fetching NGOs:", err);
      toast.error("Failed to load NGOs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNgos();
  }, []);

  const handleEdit = (ngo: NgoFormData) => {
    setSelectedNgo(ngo);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedNgo(null);
    setIsFormOpen(true);
  };

  const confirmDelete = (id: string) => {
    setNgoToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!ngoToDelete) return;
    setIsDeleting(true);
    
    try {
      const response = await supabase
        .from("ngos")
        .delete()
        .eq("id", ngoToDelete)
        .select();

      if (response.error) {
        throw new Error(`Supabase Error: ${response.error.message}`);
      }

      if (!response.data || response.data.length === 0) {
        throw new Error("Delete failed silently: No rows were deleted. This is usually caused by Row Level Security (RLS) policies blocking the DELETE operation.");
      }
      
      toast.success("NGO deleted successfully");
      fetchNgos();
    } catch (err: unknown) {
      console.error("Error deleting NGO:", err);
      toast.error("Failed to delete the NGO.");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setNgoToDelete(null);
    }
  };

  // Filter Data
  const filteredNgos = ngos.filter((ngo) => {
    const matchesSearch = 
      ngo.ngo_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ngo.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ngo.state?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === "All" || ngo.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">NGO Directory</h1>
          <p className="text-muted-foreground mt-1">Manage partner NGOs and organizations.</p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add NGO
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search NGOs by name, category, district or state..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <select 
          className="flex h-10 w-full md:w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Under Review">Under Review</option>
        </select>
        
        <Button variant="outline" size="icon" onClick={fetchNgos} title="Refresh Table">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <ShadcnTable>
          <ShadcnTableHeader>
            <ShadcnTableRow>
              <ShadcnTableHead>NGO Name</ShadcnTableHead>
              <ShadcnTableHead>Services</ShadcnTableHead>
              <ShadcnTableHead>District</ShadcnTableHead>
              <ShadcnTableHead>State</ShadcnTableHead>
              <ShadcnTableHead>Contact</ShadcnTableHead>
              <ShadcnTableHead>Status</ShadcnTableHead>
              <ShadcnTableHead className="text-right">Actions</ShadcnTableHead>
            </ShadcnTableRow>
          </ShadcnTableHeader>
          <ShadcnTableBody>
            {loading ? (
              <ShadcnTableRow>
                <ShadcnTableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Loading NGOs...
                </ShadcnTableCell>
              </ShadcnTableRow>
            ) : filteredNgos.length === 0 ? (
              <ShadcnTableRow>
                <ShadcnTableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No NGOs found.
                </ShadcnTableCell>
              </ShadcnTableRow>
            ) : (
              filteredNgos.map((ngo) => (
                <ShadcnTableRow key={ngo.id}>
                  <ShadcnTableCell className="font-medium">{ngo.ngo_name}</ShadcnTableCell>
                  <ShadcnTableCell>{ngo.services || "N/A"}</ShadcnTableCell>
                  <ShadcnTableCell>{ngo.district}</ShadcnTableCell>
                  <ShadcnTableCell>{ngo.state}</ShadcnTableCell>
                  <ShadcnTableCell className="text-sm">
                    {ngo.phone && <div>{ngo.phone}</div>}
                    {ngo.email && <div className="text-muted-foreground">{ngo.email}</div>}
                    {!ngo.phone && !ngo.email && "N/A"}
                  </ShadcnTableCell>
                  <ShadcnTableCell>
                    <Badge variant={
                      ngo.status === "Active" ? "default" :
                      ngo.status === "Inactive" ? "secondary" : "outline"
                    }>
                      {ngo.status}
                    </Badge>
                  </ShadcnTableCell>
                  <ShadcnTableCell className="text-right space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEdit(ngo)}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => ngo.id && confirmDelete(ngo.id.toString())}
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

      <NgoFormModal
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={selectedNgo}
        onSuccess={fetchNgos}
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
