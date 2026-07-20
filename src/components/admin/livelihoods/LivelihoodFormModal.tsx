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

import { LivelihoodOpportunity } from "@/types/database";

export type LivelihoodFormData = LivelihoodOpportunity;

const defaultFormData: LivelihoodFormData = {
  title: "",
  category: "",
  description: "",
  provider: "",
  location: "",
  eligibility: "",
  duration: "",
  contact: "",
  website: "",
  status: "Active",
};

interface LivelihoodFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: LivelihoodFormData | null;
  onSuccess: () => void;
}

export function LivelihoodFormModal({
  isOpen,
  onOpenChange,
  initialData,
  onSuccess,
}: LivelihoodFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LivelihoodFormData>({ ...defaultFormData });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (initialData) {
          setFormData({
            ...defaultFormData,
            ...initialData,
            title: initialData.title ?? "",
            category: initialData.category ?? "",
            description: initialData.description ?? "",
            provider: initialData.provider ?? "",
            location: initialData.location ?? "",
            eligibility: initialData.eligibility ?? "",
            duration: initialData.duration ?? "",
            contact: initialData.contact ?? "",
            website: initialData.website ?? "",
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
    
    if (!formData.title) {
      toast.error("Please fill in the opportunity name");
      return;
    }

    setLoading(true);

    try {
      if (formData.id) {
        // Update
        const payload = {
          title: formData.title,
          category: formData.category,
          description: formData.description,
          provider: formData.provider,
          location: formData.location,
          eligibility: formData.eligibility,
          duration: formData.duration,
          contact: formData.contact,
          website: formData.website,
          status: formData.status,
        };

        console.log("--- SUPABASE UPDATE DIAGNOSTICS ---");
        console.log("Table Name: livelihood_opportunities");
        console.log("Record ID:", formData.id);
        console.log("Payload:", payload);

        const response = await supabase
          .from("livelihood_opportunities")
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

        toast.success("Opportunity updated successfully");
      } else {
        // Insert
        const { error } = await supabase
          .from("livelihood_opportunities")
          .insert([{
            title: formData.title,
            category: formData.category,
            description: formData.description,
            provider: formData.provider,
            location: formData.location,
            eligibility: formData.eligibility,
            duration: formData.duration,
            contact: formData.contact,
            website: formData.website,
            status: formData.status,
          }]);

        if (error) {
          throw new Error(`Supabase Error: ${error.message} (Code: ${error.code})`);
        }
        toast.success("Opportunity created successfully");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      console.error("Error saving opportunity:", err);
      toast.error(err instanceof Error ? err.message : "Failed to save opportunity. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Opportunity" : "Add New Opportunity"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Opportunity Title <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              name="title"
              value={formData.title ?? ""}
              onChange={handleChange}
              placeholder="e.g. Tailoring Training Program"
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
                placeholder="e.g. Skill Training"
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="provider">Provider</Label>
              <Input
                id="provider"
                name="provider"
                value={formData.provider ?? ""}
                onChange={handleChange}
                placeholder="e.g. Skill India"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location ?? ""}
                onChange={handleChange}
                placeholder="e.g. All India"
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                name="duration"
                value={formData.duration ?? ""}
                onChange={handleChange}
                placeholder="e.g. 3 Months"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="eligibility">Eligibility</Label>
            <Input
              id="eligibility"
              name="eligibility"
              value={formData.eligibility ?? ""}
              onChange={handleChange}
              placeholder="e.g. 10th Pass"
              disabled={loading}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="contact">Contact Info</Label>
              <Input
                id="contact"
                name="contact"
                value={formData.contact ?? ""}
                onChange={handleChange}
                placeholder="Phone or Email"
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                value={formData.website ?? ""}
                onChange={handleChange}
                placeholder="e.g. https://example.com"
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
                <SelectItem value="Closed">Closed</SelectItem>
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
              placeholder="Detailed description..."
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
              {loading ? "Saving..." : "Save Opportunity"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
