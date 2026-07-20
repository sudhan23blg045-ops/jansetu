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

import { Ngo } from "@/types/database";

export type NgoFormData = Ngo;

const defaultFormData: NgoFormData = {
  ngo_name: "",
  services: "",
  district: "",
  state: "",
  phone: "",
  email: "",
  website: "",
  address: "",
  status: "Active",
  description: "",
};

interface NgoFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: NgoFormData | null;
  onSuccess: () => void;
}

export function NgoFormModal({
  isOpen,
  onOpenChange,
  initialData,
  onSuccess,
}: NgoFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<NgoFormData>({ ...defaultFormData });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (initialData) {
          setFormData({
            ...defaultFormData,
            ...initialData,
            ngo_name: initialData.ngo_name ?? "",
            services: initialData.services ?? "",
            district: initialData.district ?? "",
            state: initialData.state ?? "",
            phone: initialData.phone ?? "",
            email: initialData.email ?? "",
            website: initialData.website ?? "",
            address: initialData.address ?? "",
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
    
    if (!formData.ngo_name) {
      toast.error("Please fill in the NGO name");
      return;
    }

    setLoading(true);

    try {
      if (formData.id) {
        // Update
        const payload = {
          ngo_name: formData.ngo_name,
          services: formData.services,
          district: formData.district,
          state: formData.state,
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
          address: formData.address,
          status: formData.status,
          description: formData.description,
        };

        console.log("--- SUPABASE UPDATE DIAGNOSTICS ---");
        console.log("Table Name: ngos");
        console.log("Record ID:", formData.id);
        console.log("Payload:", payload);

        const response = await supabase
          .from("ngos")
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

        toast.success("NGO updated successfully");
      } else {
        // Insert
        const insertPayload = {
          ngo_name: formData.ngo_name,
          services: formData.services,
          district: formData.district,
          state: formData.state,
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
          address: formData.address,
          status: formData.status,
          description: formData.description,
        };

        const { error } = await supabase
          .from("ngos")
          .insert([insertPayload]);

        if (error) {
          throw new Error(`Supabase Error: ${error.message} (Code: ${error.code})`);
        }
        toast.success("NGO created successfully");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      console.error("Error saving NGO:", err);
      toast.error(err instanceof Error ? err.message : "Failed to save NGO. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit NGO" : "Add New NGO"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="ngo_name">NGO Name <span className="text-destructive">*</span></Label>
            <Input
              id="ngo_name"
              name="ngo_name"
              value={formData.ngo_name ?? ""}
              onChange={handleChange}
              placeholder="e.g. Rural Development Trust"
              disabled={loading}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="services">Services</Label>
              <Input
                id="services"
                name="services"
                value={formData.services ?? ""}
                onChange={handleChange}
                placeholder="e.g. Education, Health"
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone ?? ""}
                onChange={handleChange}
                placeholder="e.g. +91 9876543210"
                disabled={loading}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email ?? ""}
                onChange={handleChange}
                placeholder="e.g. contact@ngo.org"
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
                placeholder="e.g. https://www.ngo.org"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                name="district"
                value={formData.district ?? ""}
                onChange={handleChange}
                placeholder="e.g. Bangalore Urban"
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
                placeholder="e.g. Karnataka"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address ?? ""}
              onChange={handleChange}
              placeholder="Full address..."
              disabled={loading}
            />
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
                <SelectItem value="Pending">Pending</SelectItem>
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
              placeholder="Detailed description of the NGO..."
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
              {loading ? "Saving..." : "Save NGO"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
