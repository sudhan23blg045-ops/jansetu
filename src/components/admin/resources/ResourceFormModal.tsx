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

export interface ResourceFormData {
  id?: string;
  title: string;
  category: string;
  description: string;
  resource_type: string;
  resource_url: string;
  source: string;
  thumbnail_url?: string;
}

const defaultFormData: ResourceFormData = {
  title: "",
  category: "",
  description: "",
  resource_type: "",
  resource_url: "",
  source: "",
  thumbnail_url: "",
};

interface ResourceFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ResourceFormData | null;
  onSuccess: () => void;
}

export function ResourceFormModal({
  isOpen,
  onOpenChange,
  initialData,
  onSuccess,
}: ResourceFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ResourceFormData>({ ...defaultFormData });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (initialData) {
          setFormData({
            ...defaultFormData,
            ...initialData,
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

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.description || !formData.resource_type || !formData.resource_url || !formData.source) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!validateUrl(formData.resource_url)) {
      toast.error("Please enter a valid URL starting with http:// or https://");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        resource_type: formData.resource_type,
        resource_url: formData.resource_url,
        source: formData.source,
        thumbnail_url: formData.thumbnail_url || null,
      };

      if (formData.id) {
        // Update
        const { error } = await supabase
          .from("resources")
          .update(payload)
          .eq("id", formData.id);

        if (error) {
          throw new Error(`Supabase Error: ${error.message}`);
        }

        toast.success("Resource updated successfully");
      } else {
        // Insert
        const { error } = await supabase
          .from("resources")
          .insert([payload]);

        if (error) {
          throw new Error(`Supabase Error: ${error.message}`);
        }
        toast.success("Resource created successfully");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      console.error("Submission error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to save resource");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{formData.id ? "Edit Resource" : "Add New Resource"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="E.g., Handbook on Forest Rights Act"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) => { if (val) handleSelectChange("category", val); }}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Guidelines">Guidelines</SelectItem>
                    <SelectItem value="Community Lists">Community Lists</SelectItem>
                    <SelectItem value="Reports">Reports</SelectItem>
                    <SelectItem value="Government Links">Government Links</SelectItem>
                    <SelectItem value="Success Stories">Success Stories</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resource_type">Resource Type *</Label>
                <Select
                  value={formData.resource_type}
                  onValueChange={(val) => { if (val) handleSelectChange("resource_type", val); }}
                  required
                >
                  <SelectTrigger id="resource_type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="Website">Website</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide a brief summary of the resource..."
                className="h-24"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resource_url">Resource URL *</Label>
              <Input
                id="resource_url"
                name="resource_url"
                value={formData.resource_url}
                onChange={handleChange}
                placeholder="https://example.com/document.pdf"
                type="url"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Official Source *</Label>
              <Input
                id="source"
                name="source"
                value={formData.source}
                onChange={handleChange}
                placeholder="E.g., Ministry of Tribal Affairs"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail_url">Thumbnail URL (Optional)</Label>
              <Input
                id="thumbnail_url"
                name="thumbnail_url"
                value={formData.thumbnail_url || ""}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                type="url"
              />
              <p className="text-xs text-muted-foreground">Leave blank to use default type icon</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : formData.id ? "Update Resource" : "Add Resource"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
