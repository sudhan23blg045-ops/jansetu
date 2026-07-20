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

import { Scheme } from "@/types/database";

export type SchemeFormData = Scheme;

const defaultFormData: SchemeFormData = {
  scheme_name: "",
  category: "",
  state: "",
  status: "Active",
  description: "",
  eligibility: "",
  benefits: "",
  official_link: "",
  last_date: "",
};

interface SchemeFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: SchemeFormData | null;
  onSuccess: () => void;
}

export function SchemeFormModal({
  isOpen,
  onOpenChange,
  initialData,
  onSuccess,
}: SchemeFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SchemeFormData>({ ...defaultFormData });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (initialData) {
          setFormData({
            ...defaultFormData,
            ...initialData,
            scheme_name: initialData.scheme_name ?? "",
            category: initialData.category ?? "",
            state: initialData.state ?? "",
            status: initialData.status ?? "Active",
            description: initialData.description ?? "",
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
    
    if (!formData.scheme_name) {
      toast.error("Please fill in the primary scheme name");
      return;
    }

    setLoading(true);

    try {
      if (formData.id) {
        // Update
        const payload = {
          scheme_name: formData.scheme_name,
          category: formData.category,
          state: formData.state,
          status: formData.status,
          description: formData.description,
        };

        console.log("--- SUPABASE UPDATE DIAGNOSTICS ---");
        console.log("Table Name: schemes");
        console.log("Record ID:", formData.id);
        console.log("Payload:", payload);

        const response = await supabase
          .from("schemes")
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

        toast.success("Scheme updated successfully");
      } else {
        // Insert
        const { error } = await supabase
          .from("schemes")
          .insert([{
            scheme_name: formData.scheme_name,
            category: formData.category,
            state: formData.state,
            status: formData.status,
            description: formData.description,
          }]);

        if (error) {
          throw new Error(`Supabase Error: ${error.message} (Code: ${error.code})`);
        }
        toast.success("Scheme created successfully");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      console.error("Error saving scheme:", err);
      toast.error(err instanceof Error ? err.message : "Failed to save scheme. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Scheme" : "Add New Scheme"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="scheme_name">Scheme Name <span className="text-destructive">*</span></Label>
            <Input
              id="scheme_name"
              name="scheme_name"
              value={formData.scheme_name ?? ""}
              onChange={handleChange}
              placeholder="e.g. Pradhan Mantri Awas Yojana"
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
                placeholder="e.g. Housing, Education"
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={formData.state ?? ""}
                onChange={handleChange}
                placeholder="e.g. All, Karnataka, Tamil Nadu"
                disabled={loading}
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
                <SelectItem value="Draft">Draft</SelectItem>
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
              placeholder="Detailed description of the scheme..."
              rows={4}
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
              {loading ? "Saving..." : "Save Scheme"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
