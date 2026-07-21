"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Upload, CheckCircle2, XCircle, FileIcon } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [community, setCommunity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Documents state
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  
  const requiredDocs = ['Aadhaar', 'Income Certificate', 'Community Certificate', 'Bank Passbook', 'Ration Card'];

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }
      
      setUser(session.user);
      setEmail(session.user.email || "");

      // Fetch profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        const newProfile = {
          id: session.user.id,
          email: session.user.email,
          first_name: session.user.user_metadata?.first_name || "",
          last_name: session.user.user_metadata?.last_name || "",
        };
        await supabase.from('profiles').insert(newProfile);
        setFirstName(newProfile.first_name);
        setLastName(newProfile.last_name);
      } else if (profile) {
        setFirstName(profile.first_name || "");
        setLastName(profile.last_name || "");
        setPhone(profile.phone || "");
        setCommunity(profile.community || "");
        setDistrict(profile.district || "");
        setState(profile.state || "");
      }
      
      // Fetch documents
      const { data: docsData } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', session.user.id);
        
      if (docsData) setDocuments(docsData);
      
      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        phone,
        community,
        district,
        state
      })
      .eq('id', user.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Profile updated successfully.');
      await supabase.auth.updateUser({
        data: { first_name: firstName, last_name: lastName }
      });
    }
    setSaving(false);
  };

  const handleUpdatePassword = async () => {
     if (!newPassword) return;
     const { error } = await supabase.auth.updateUser({ password: newPassword });
     if (error) {
       toast.error(error.message);
     } else {
       toast.success("Password updated successfully!");
       setCurrentPassword("");
       setNewPassword("");
     }
  }
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    
    const file = e.target.files[0];
    setUploadingDoc(docType);
    
    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${docType.replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      // 1. Upload to Supabase Storage (requires a bucket named 'user-documents')
      const { error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw new Error("Failed to upload file to storage. Ensure 'user-documents' bucket exists.");
      }
      
      // 2. We no longer generate a public URL since the bucket is explicitly private.
      // We store the secure relative filePath. We can generate signed URLs later when viewing is required.
        
      // 3. Upsert into user_documents table
      const { error: dbError } = await supabase
        .from('user_documents')
        .upsert({
          user_id: user.id,
          document_type: docType,
          file_url: filePath,
          status: 'Pending Verification'
        }, {
           onConflict: 'user_id,document_type'
        });
        
      if (dbError) throw dbError;
      
      toast.success(`${docType} uploaded successfully`);
      
      // Refresh documents
      const { data: updatedDocs } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', user.id);
      if (updatedDocs) setDocuments(updatedDocs);
      
    } catch (error: any) {
      toast.error(error.message || "An error occurred during upload");
    } finally {
      setUploadingDoc(null);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center">Loading profile...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">User Profile & Documents</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column - Personal Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" value={email} disabled />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="phone">Phone number</Label>
                   <Input id="phone" type="tel" placeholder="+91 00000 00000" value={phone} onChange={(e) => setPhone(e.target.value)} />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="community">Community</Label>
                   <Input id="community" placeholder="e.g. Banjara" value={community} onChange={(e) => setCommunity(e.target.value)} />
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="state">State</Label>
                   <Input id="state" placeholder="e.g. Rajasthan" value={state} onChange={(e) => setState(e.target.value)} />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="district">District</Label>
                   <Input id="district" placeholder="e.g. Jaipur" value={district} onChange={(e) => setDistrict(e.target.value)} />
                 </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your password and security settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password (optional)</Label>
                <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" onClick={handleUpdatePassword}>Update Password</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column - Documents */}
        <div className="space-y-6">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>My Documents</CardTitle>
              <CardDescription>
                Upload required documents for schemes and services. Supported formats: JPG, PNG, PDF.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              {requiredDocs.map(docType => {
                const uploadedDoc = documents.find(d => d.document_type === docType);
                const isUploading = uploadingDoc === docType;
                
                return (
                  <div key={docType} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg bg-card gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${uploadedDoc ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-muted text-muted-foreground'}`}>
                         <FileIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{docType}</p>
                        {uploadedDoc ? (
                          <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-0.5">
                            <CheckCircle2 className="h-3 w-3" /> 
                            {uploadedDoc.status}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-red-500 mt-0.5">
                            <XCircle className="h-3 w-3" /> Missing
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="shrink-0">
                      <Input
                        type="file"
                        id={`file-${docType}`}
                        className="hidden"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(e) => handleFileUpload(e, docType)}
                        disabled={isUploading}
                      />
                      <Button 
                        variant={uploadedDoc ? "outline" : "default"} 
                        size="sm"
                        disabled={isUploading}
                        className="w-full sm:w-auto"
                        onClick={() => document.getElementById(`file-${docType}`)?.click()}
                      >
                        {isUploading ? "Uploading..." : uploadedDoc ? "Update File" : "Upload File"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
