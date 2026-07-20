"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

import { NomadicCommunity } from "@/types/database";

export type CommunityFormData = NomadicCommunity;

const defaultFormData: CommunityFormData = {
  community_name: "",
  state: "",
  category: "",
  status: "Active",
  description: "",
};

interface CommunityFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: CommunityFormData | null;
  onSuccess: () => void;
}

export function CommunityFormModal({
  isOpen,
  onOpenChange,
  initialData,
  onSuccess,
}: CommunityFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CommunityFormData>({ ...defaultFormData });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (initialData) {
          // Merge initial data with default to ensure no null/undefined values
          setFormData({
            ...defaultFormData,
            ...initialData,
            community_name: initialData.community_name ?? "",
            state: initialData.state ?? "",
            category: initialData.category ?? "",
            description: initialData.description ?? "",
            status: initialData.status ?? "Active",
          });
        } else {
          setFormData({ ...defaultFormData });
        }
      }, 0);
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.community_name || !formData.state) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      if (formData.id) {
        // Update
        const payload = {
          community_name: formData.community_name,
          state: formData.state,
          category: formData.category,
          description: formData.description,
          status: formData.status,
        };

        console.log("--- SUPABASE UPDATE DIAGNOSTICS ---");
        console.log("Table Name: nomadic_communities");
        console.log("Record ID:", formData.id);
        console.log("Payload:", payload);

        const response = await supabase
          .from("nomadic_communities")
          .update(payload)
          .eq("id", formData.id)
          .select();

        console.log("Supabase Response:", response);
        console.log("Supabase Error:", response.error);
        console.log("--- END DIAGNOSTICS ---");

        if (response.error) {
          throw new Error(`Supabase Error: ${response.error.message} (Code: ${response.error.code})`);
        }

        if (!response.data || response.data.length === 0) {
          throw new Error("Update failed silently: No rows were updated. This is usually caused by Row Level Security (RLS) policies blocking the UPDATE operation, or an incorrect record ID.");
        }

        toast.success("Community updated successfully");
      } else {
        // Insert
        const { error } = await supabase
          .from("nomadic_communities")
          .insert([{
            community_name: formData.community_name,
            state: formData.state,
            category: formData.category,
            description: formData.description,
            status: formData.status,
          }]);

        if (error) {
          throw new Error(`Supabase Error: ${error.message} (Code: ${error.code})`);
        }
        toast.success("Community created successfully");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      console.error("Error saving community:", err);
      toast.error(err instanceof Error ? err.message : "Failed to save community. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Community" : "Add New Community"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="community_name">Community Name <span className="text-destructive">*</span></Label>
            <Input
              id="community_name"
              name="community_name"
              value={formData.community_name ?? ""}
              onChange={handleChange}
              placeholder="e.g. Banjara, Gadia Lohar"
              disabled={loading}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                value={formData.category ?? ""}
                onChange={handleChange}
                placeholder="e.g. DNT, NT, SNT"
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="state">State <span className="text-destructive">*</span></Label>
              <Input
                id="state"
                name="state"
                value={formData.state ?? ""}
                onChange={handleChange}
                placeholder="e.g. Rajasthan, Maharashtra"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status ?? "Active"} 
              onValueChange={(val) => handleSelectChange("status", val || "")}
              disabled={loading}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Review">Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description ?? ""}
              onChange={handleChange}
              placeholder="Detailed description of the community's culture, needs, and background..."
              rows={5}
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Community"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
