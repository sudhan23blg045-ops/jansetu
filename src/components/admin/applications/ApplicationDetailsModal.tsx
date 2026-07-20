"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileText, Download, UserCircle, Briefcase, MapPin, Phone, Mail } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Props {
  applicationId: string;
  onClose: () => void;
}

export default function ApplicationDetailsModal({ applicationId, onClose }: Props) {
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Editable state
  const [status, setStatus] = useState("");
  const [volunteerNotes, setVolunteerNotes] = useState("");
  const [govtAppNumber, setGovtAppNumber] = useState("");
  const [govtPortalName, setGovtPortalName] = useState("");
  const [assignedVolunteerId, setAssignedVolunteerId] = useState("");
  
  const [volunteers, setVolunteers] = useState<any[]>([]);
  
  const statuses = [
    "Submitted",
    "Volunteer Assigned",
    "Documents Verified",
    "Under Review",
    "Applied on Government Portal",
    "Approved",
    "Rejected"
  ];

  useEffect(() => {
    const fetchDetails = async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("id", applicationId)
        .single();
        
      if (data) {
        setApp(data);
        setStatus(data.status);
        setVolunteerNotes(data.volunteer_notes || "");
        setGovtAppNumber(data.government_application_number || "");
        setGovtPortalName(data.government_portal_name || "");
        setAssignedVolunteerId(data.assigned_volunteer_id || "");
      }
      
      const { data: vols } = await supabase
        .from("volunteer_registrations")
        .select("id, user_id, full_name, status")
        .eq("status", "Approved");
      if (vols) setVolunteers(vols);

      setLoading(false);
    };
    
    fetchDetails();
  }, [applicationId]);

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const updates: any = {
        status,
        volunteer_notes: volunteerNotes,
        government_application_number: govtAppNumber,
        government_portal_name: govtPortalName,
      };

      if (assignedVolunteerId) {
        updates.assigned_volunteer_id = assignedVolunteerId;
        if (!app.assigned_date) updates.assigned_date = new Date().toISOString();
        if (status === 'Submitted') updates.status = 'Volunteer Assigned';
      }

      // If status changed to Applied on Govt Portal and applied_date is null
      if (status === 'Applied on Government Portal' && !app.applied_date) {
        updates.applied_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from("applications")
        .update(updates)
        .eq("id", applicationId);
        
      if (error) throw error;

      // Add Notification
      if (status !== app.status) {
        await supabase.from("notifications").insert({
          user_id: app.user_id,
          title: "Application Status Updated",
          message: `Your application for ${app.application_type} (${app.related_item || ''}) is now: ${status}.`
        });
      }

      toast.success("Application updated successfully");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to update application");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !app) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4 mb-4">
          <DialogTitle className="text-2xl">Application Details</DialogTitle>
          <DialogDescription>
            Submitted on {format(new Date(app.created_at), "PPP 'at' p")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Column: Read Only Info */}
          <div className="space-y-6">
            <div className="bg-muted/30 p-4 rounded-lg space-y-3">
              <h4 className="font-semibold flex items-center gap-2"><Briefcase className="w-4 h-4" /> Request Info</h4>
              <div className="grid grid-cols-3 text-sm gap-1">
                <span className="text-muted-foreground">Type:</span>
                <span className="col-span-2 font-medium">{app.application_type}</span>
                
                <span className="text-muted-foreground">Item:</span>
                <span className="col-span-2 font-medium">{app.related_item || "N/A"}</span>
              </div>
              <div className="text-sm pt-2 border-t">
                <span className="text-muted-foreground block mb-1">Reason:</span>
                <p className="whitespace-pre-wrap">{app.reason_for_request}</p>
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg space-y-3">
              <h4 className="font-semibold flex items-center gap-2"><UserCircle className="w-4 h-4" /> Applicant Details</h4>
              <div className="grid grid-cols-3 text-sm gap-2">
                <span className="text-muted-foreground"><UserCircle className="w-4 h-4 inline mr-1" /> Name:</span>
                <span className="col-span-2 font-medium">{app.full_name}</span>
                
                <span className="text-muted-foreground"><Phone className="w-4 h-4 inline mr-1" /> Mobile:</span>
                <span className="col-span-2 font-medium">{app.mobile_number}</span>
                
                <span className="text-muted-foreground"><Mail className="w-4 h-4 inline mr-1" /> Email:</span>
                <span className="col-span-2 font-medium truncate" title={app.email}>{app.email}</span>
                
                <span className="text-muted-foreground"><MapPin className="w-4 h-4 inline mr-1" /> Address:</span>
                <span className="col-span-2 font-medium">{app.address}, {app.district}, {app.state}</span>
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg space-y-3">
              <h4 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4" /> Attached Documents</h4>
              {app.document_urls && app.document_urls.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {app.document_urls.map((url: string, idx: number) => (
                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-primary hover:underline bg-background border px-3 py-2 rounded-md">
                      <Download className="w-4 h-4 mr-2" /> Document {idx + 1}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No documents uploaded.</p>
              )}
            </div>
          </div>

          {/* Right Column: Editable Action Area */}
          <div className="space-y-6">
            
            <div className="space-y-4 bg-primary/5 p-4 rounded-lg border border-primary/20">
              <h4 className="font-semibold text-primary mb-4">Application Processing</h4>
              
              <div className="space-y-2">
                <Label htmlFor="status">Current Status</Label>
                <Select value={status} onValueChange={(val) => setStatus(val || "")}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="volunteer">Assign Volunteer</Label>
                <Select value={assignedVolunteerId} onValueChange={(val) => setAssignedVolunteerId(val || "")}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {volunteers.map(v => <SelectItem key={v.user_id} value={v.user_id}>{v.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="volunteerNotes">Volunteer / Admin Notes</Label>
                <Textarea 
                  id="volunteerNotes" 
                  value={volunteerNotes} 
                  onChange={e => setVolunteerNotes(e.target.value)} 
                  placeholder="Internal notes, visible only to admins/volunteers"
                  className="bg-background"
                  rows={4}
                />
              </div>
            </div>

            <div className="space-y-4 border p-4 rounded-lg">
              <h4 className="font-semibold mb-4">Government Portal Tracking</h4>
              <p className="text-xs text-muted-foreground mb-4">If this was applied on a government portal on behalf of the user, enter the tracking details here.</p>
              
              <div className="space-y-2">
                <Label htmlFor="govtAppNumber">Application Number / ID</Label>
                <Input 
                  id="govtAppNumber" 
                  value={govtAppNumber} 
                  onChange={e => setGovtAppNumber(e.target.value)} 
                  placeholder="e.g. MH-12345678" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="govtPortalName">Portal Name</Label>
                <Input 
                  id="govtPortalName" 
                  value={govtPortalName} 
                  onChange={e => setGovtPortalName(e.target.value)} 
                  placeholder="e.g. National Scholarship Portal" 
                />
              </div>
            </div>
            
          </div>
        </div>

        <DialogFooter className="mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
