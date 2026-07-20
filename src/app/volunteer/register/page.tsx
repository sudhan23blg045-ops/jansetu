"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowLeft, CheckCircle, UploadCloud, Loader2 } from "lucide-react";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const SKILLS = [
  "Field Work", "Data Entry", "Translation", "Counseling", "Legal Aid", "Healthcare", "Education", "Fundraising", "Digital Literacy"
];

const LANGUAGES = [
  "English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Marathi", "Gujarati", "Bengali", "Odia", "Urdu"
];

export default function VolunteerRegistration() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [occupation, setOccupation] = useState("");
  const [organization, setOrganization] = useState("");
  const [availability, setAvailability] = useState("Weekends");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  
  // Files
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  // Declaration
  const [declaration, setDeclaration] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login?redirect=/volunteer/register");
        return;
      }
      setUserId(session.user.id);
      
      // Pre-fill if we have profile data
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (profile) {
        if (profile.full_name) setFullName(profile.full_name);
      }
      
      // Check if already registered
      const { data: existingReg } = await supabase.from('volunteer_registrations').select('id, status').eq('user_id', session.user.id).single();
      if (existingReg) {
        if (existingReg.status === 'Approved') {
          router.push("/volunteer/dashboard");
        } else {
          setSuccess(true);
        }
      }
    };
    checkAuth();
  }, [router]);

  const toggleSelection = (item: string, list: string[], setList: (val: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const uploadFile = async (file: File, pathFolder: string): Promise<string | null> => {
    if (!userId) {
      console.error("userId is null before upload!");
      return null;
    }
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${pathFolder}/${fileName}`;
    
    console.log("--- UPLOAD DEBUG ---");
    console.log("Current userId state:", userId);
    console.log("Upload path (filePath):", filePath);
    console.log("File details:", file.name, file.size, file.type);
    
    const { data: sessionData } = await supabase.auth.getSession();
    console.log("Actual auth.uid() from session:", sessionData?.session?.user?.id);
    console.log("--------------------");

    const { data, error } = await supabase.storage
      .from('volunteer-documents')
      .upload(filePath, file);
      
    if (error) {
      console.error("Supabase Storage Error Details:", error);
      throw error;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('volunteer-documents')
      .getPublicUrl(filePath);
      
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    if (!fullName || !email || !mobile || !state || !district || !address || !occupation || !availability) {
      setError("Please fill in all required text fields.");
      return;
    }
    
    if (!aadhaarFile || !photoFile) {
      setError("Please upload both Aadhaar and Profile Photo.");
      return;
    }
    
    if (selectedSkills.length === 0 || selectedLanguages.length === 0) {
      setError("Please select at least one skill and one language.");
      return;
    }
    
    if (!declaration) {
      setError("You must accept the declaration to proceed.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Upload files
      console.log("--- Starting Aadhaar Upload ---");
      const aadhaarUrl = await uploadFile(aadhaarFile, 'aadhaar');
      console.log("Aadhaar Upload Result URL:", aadhaarUrl);
      
      console.log("--- Starting Profile Photo Upload ---");
      const photoUrl = await uploadFile(photoFile, 'photo');
      console.log("Profile Photo Upload Result URL:", photoUrl);

      if (!aadhaarUrl || !photoUrl) {
        throw new Error("Failed to retrieve file URLs after upload.");
      }

      // 2. Insert record
      console.log("--- Starting Volunteer Registration Insert ---");
      const insertData = {
        user_id: userId,
        full_name: fullName,
        email: email,
        mobile_number: mobile,
        state: state,
        district: district,
        address: address,
        occupation: occupation,
        organization: organization || null,
        skills: selectedSkills,
        languages: selectedLanguages,
        availability: availability,
        aadhaar_url: aadhaarUrl,
        profile_photo_url: photoUrl,
        status: 'Pending'
      };
      
      const { data: dbData, error: dbError } = await supabase.from('volunteer_registrations').insert(insertData);
      
      console.log("Registration Insert returned Data:", dbData);
      console.log("Registration Insert returned Error:", dbError);

      if (dbError) {
        throw dbError;
      }
      
      console.log("Registration successfully completed!");
      setSuccess(true);
    } catch (err: any) {
      console.error("=== Registration Error ===");
      console.error("Raw Error Object:", err);
      console.error("Message:", err.message);
      console.error("Code:", err.code);
      console.error("Details:", err.details);
      console.error("Hint:", err.hint);
      console.error("Stringified Error:", JSON.stringify(err, null, 2));
      console.error("==========================");
      
      setError(err.message || "An unexpected error occurred during registration. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl min-h-[calc(100vh-80px)] flex items-center justify-center">
        <Card className="w-full border-green-200 shadow-sm text-center py-8">
          <CardHeader>
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Registration Submitted</CardTitle>
            <CardDescription className="text-base mt-2">
              Thank you for volunteering with Jansetu! Your registration is currently under review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We will verify your details and documents. You will receive an email once your volunteer profile is approved.
            </p>
          </CardContent>
          <CardFooter className="justify-center mt-4">
            <Button onClick={() => router.push("/")} variant="outline">Return to Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl min-h-[calc(100vh-80px)]">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 -ml-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Volunteer Registration</h1>
        <p className="text-muted-foreground">Complete the form below to join our network of Sahayaks.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium mb-1">Error</h4>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 pt-6">
            
            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number <span className="text-red-500">*</span></Label>
                  <Input id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">Current Occupation <span className="text-red-500">*</span></Label>
                  <Input id="occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="e.g. Student, Teacher, Engineer" required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="organization">Organization/College (Optional)</Label>
                  <Input id="organization" value={organization} onChange={(e) => setOrganization(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
                  <select
                    id="state"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  >
                    <option value="">Select State</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District <span className="text-red-500">*</span></Label>
                  <Input id="district" value={district} onChange={(e) => setDistrict(e.target.value)} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Full Address <span className="text-red-500">*</span></Label>
                  <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
                </div>
              </div>
            </div>

            {/* Skills & Availability */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Skills & Availability</h3>
              
              <div className="space-y-3">
                <Label>Skills <span className="text-red-500">*</span></Label>
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map(skill => (
                    <div 
                      key={skill}
                      onClick={() => toggleSelection(skill, selectedSkills, setSelectedSkills)}
                      className={`cursor-pointer px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        selectedSkills.includes(skill) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'
                      }`}
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label>Languages Known <span className="text-red-500">*</span></Label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(lang => (
                    <div 
                      key={lang}
                      onClick={() => toggleSelection(lang, selectedLanguages, setSelectedLanguages)}
                      className={`cursor-pointer px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        selectedLanguages.includes(lang) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'
                      }`}
                    >
                      {lang}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label htmlFor="availability">Availability <span className="text-red-500">*</span></Label>
                <select
                  id="availability"
                  className="flex h-10 w-full md:w-1/2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                >
                  <option value="Weekends">Weekends Only</option>
                  <option value="Weekdays">Weekdays</option>
                  <option value="Flexible">Flexible / Anytime</option>
                  <option value="Few hours a week">Few hours a week</option>
                </select>
              </div>
            </div>

            {/* Document Uploads */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Documents (For Verification)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-2 border rounded-lg p-4 bg-muted/20">
                  <Label>Aadhaar Card <span className="text-red-500">*</span></Label>
                  <p className="text-xs text-muted-foreground mb-4">Upload a clear photo of your Aadhaar card for identity verification.</p>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted/50 border-muted-foreground/25">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {aadhaarFile ? <span className="font-semibold text-primary">{aadhaarFile.name}</span> : "Click to upload Aadhaar"}
                        </p>
                      </div>
                      <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => setAadhaarFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                </div>

                <div className="space-y-2 border rounded-lg p-4 bg-muted/20">
                  <Label>Profile Photo <span className="text-red-500">*</span></Label>
                  <p className="text-xs text-muted-foreground mb-4">Upload a recent, clear, passport-style photo of yourself.</p>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted/50 border-muted-foreground/25">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {photoFile ? <span className="font-semibold text-primary">{photoFile.name}</span> : "Click to upload Photo"}
                        </p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                </div>

              </div>
            </div>

            {/* Declaration */}
            <div className="space-y-4 pt-4">
              <div className="flex items-start space-x-3 p-4 border rounded-lg bg-primary/5 border-primary/20">
                <input 
                  type="checkbox"
                  id="declaration" 
                  checked={declaration} 
                  onChange={(e) => setDeclaration(e.target.checked)}
                  className="mt-1.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="declaration" className="font-semibold cursor-pointer text-base">
                    Volunteer Declaration
                  </Label>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    I declare that all information provided above is true and correct. I understand that my role as a Jansetu Sahayak is purely voluntary and non-remunerative. I agree to abide by the code of conduct, maintain confidentiality of applicant data, and act in the best interests of the communities I serve.
                  </p>
                </div>
              </div>
            </div>

          </CardContent>
          <CardFooter className="bg-muted/30 px-6 py-4 border-t flex justify-end">
            <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting Registration...</>
              ) : (
                "Submit Registration"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
