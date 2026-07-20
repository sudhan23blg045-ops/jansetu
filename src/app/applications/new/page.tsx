"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { ArrowLeft, Upload, File as FileIcon, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

function ApplicationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [community, setCommunity] = useState("");
  const [address, setAddress] = useState("");
  const [applicationType, setApplicationType] = useState("");
  const [relatedItem, setRelatedItem] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push(`/login?redirect=/applications/new`);
        return;
      }
      setUser(session.user);
      
      // Auto-prefill if metadata exists
      setFullName(session.user.user_metadata?.first_name || "");
      setMobileNumber(session.user.user_metadata?.phone || "");
      
      // Prefill from URL
      const typeParam = searchParams.get("type");
      const itemParam = searchParams.get("item");
      if (typeParam) setApplicationType(typeParam);
      if (itemParam) setRelatedItem(itemParam);

      setLoading(false);
    };
    init();
  }, [router, searchParams]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    const uploadedUrls: string[] = [];
    if (files.length === 0) return uploadedUrls;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      try {
        const { data, error } = await supabase.storage
          .from('application-documents')
          .upload(fileName, file);

        if (error) throw error;
        
        const { data: publicUrlData } = supabase.storage
          .from('application-documents')
          .getPublicUrl(fileName);
          
        uploadedUrls.push(publicUrlData.publicUrl);
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      } catch (err) {
        console.error("Error uploading file:", err);
        throw new Error(`Failed to upload ${file.name}`);
      }
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationType) {
      toast.error("Please select an application type");
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);
    
    try {
      // 1. Upload files
      let documentUrls: string[] = [];
      if (files.length > 0) {
        documentUrls = await uploadFiles();
      }

      // 2. Insert record
      const { error } = await supabase.from("applications").insert({
        user_id: user.id,
        full_name: fullName,
        mobile_number: mobileNumber,
        email: email,
        state: state,
        district: district,
        community: community,
        address: address,
        application_type: applicationType,
        related_item: relatedItem,
        reason_for_request: reason,
        additional_notes: notes,
        document_urls: documentUrls,
        status: "Submitted"
      });

      if (error) throw error;
      
      toast.success("Application submitted successfully!");
      router.push("/applications");
      
    } catch (error: any) {
      console.error("Submission error details:", error);
      console.error("JSON stringified error:", JSON.stringify(error, null, 2));
      
      const errorMsg = error?.message || error?.details || error?.hint || (typeof error === 'string' ? error : "Failed to submit application");
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 -ml-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-2xl">Request Assistance</CardTitle>
          <CardDescription>
            Submit a new application for a scheme, NGO service, livelihood opportunity, or community support.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Application Context */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">What are you applying for?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="applicationType">Application Type <span className="text-destructive">*</span></Label>
                  <Select value={applicationType} onValueChange={(val) => setApplicationType(val || "")} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Government Scheme">Government Scheme</SelectItem>
                      <SelectItem value="NGO Assistance">NGO Assistance</SelectItem>
                      <SelectItem value="Livelihood Opportunity">Livelihood Opportunity</SelectItem>
                      <SelectItem value="Community Support">Community Support</SelectItem>
                      <SelectItem value="Resource Assistance">Resource Assistance</SelectItem>
                      <SelectItem value="General Assistance">General Assistance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relatedItem">Specific Item / Name</Label>
                  <Input 
                    id="relatedItem" 
                    placeholder="e.g. SEED Scheme, XYZ Foundation" 
                    value={relatedItem}
                    onChange={(e) => setRelatedItem(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">If you know the exact scheme or NGO name.</p>
                </div>
              </div>
            </div>

            {/* Section 2: Personal Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Applicant Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
                  <Input id="fullName" required value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Mobile Number <span className="text-destructive">*</span></Label>
                  <Input id="mobileNumber" required type="tel" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                  <Input id="email" required type="email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="community">Community Name</Label>
                  <Input id="community" value={community} onChange={e => setCommunity(e.target.value)} placeholder="e.g. Banjara, Gadia Lohar" />
                </div>
              </div>
            </div>

            {/* Section 3: Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State <span className="text-destructive">*</span></Label>
                  <Input id="state" required value={state} onChange={e => setState(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District <span className="text-destructive">*</span></Label>
                  <Input id="district" required value={district} onChange={e => setDistrict(e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Full Address <span className="text-destructive">*</span></Label>
                  <Textarea id="address" required value={address} onChange={e => setAddress(e.target.value)} rows={3} />
                </div>
              </div>
            </div>

            {/* Section 4: Details & Documents */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Request Details</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Request <span className="text-destructive">*</span></Label>
                  <Textarea 
                    id="reason" 
                    required 
                    value={reason} 
                    onChange={e => setReason(e.target.value)} 
                    placeholder="Briefly describe why you are applying and what help you need."
                    rows={4} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea 
                    id="notes" 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)} 
                    placeholder="Any other details we should know?"
                    rows={2} 
                  />
                </div>
                
                <div className="space-y-3 pt-2">
                  <Label>Required Documents (Aadhar, Income Certificate, etc.)</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-muted/10 transition-colors hover:bg-muted/30">
                    <Upload className="h-8 w-8 text-muted-foreground mb-4" />
                    <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mb-4">SVG, PNG, JPG or PDF (max. 10MB)</p>
                    <Input 
                      id="files" 
                      type="file" 
                      multiple 
                      className="hidden" 
                      onChange={handleFileChange}
                    />
                    <Button type="button" variant="secondary" onClick={() => document.getElementById('files')?.click()}>
                      Select Files
                    </Button>
                  </div>
                  
                  {files.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      {files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-md bg-background">
                          <div className="flex items-center space-x-3 overflow-hidden">
                            <FileIcon className="h-5 w-5 text-primary shrink-0" />
                            <span className="text-sm truncate font-medium">{file.name}</span>
                          </div>
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => removeFile(idx)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="min-w-[150px]">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {files.length > 0 ? `Uploading (${uploadProgress}%)` : 'Submitting...'}
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewApplicationPage() {
  return (
    <Suspense fallback={<div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <ApplicationForm />
    </Suspense>
  );
}
