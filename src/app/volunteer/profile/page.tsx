"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, ShieldCheck, Mail, Phone, MapPin, Briefcase, Camera, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

const SKILLS = [
  "Field Work", "Data Entry", "Translation", "Counseling", "Legal Aid", "Healthcare", "Education", "Fundraising", "Digital Literacy"
];

const LANGUAGES = [
  "English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Marathi", "Gujarati", "Bengali", "Odia", "Urdu"
];

export default function VolunteerProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [mobile, setMobile] = useState("");
  const [availability, setAvailability] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login?redirect=/volunteer/profile");
        return;
      }

      const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      const { data: volReg } = await supabase.from('volunteer_registrations').select('*').eq('user_id', session.user.id).single();

      if (userProfile && volReg) {
        setProfile(userProfile);
        setRegistration(volReg);
        
        // Init form state
        setMobile(volReg.mobile_number || "");
        setAvailability(volReg.availability || "");
        setSelectedSkills(volReg.skills || []);
        setSelectedLanguages(volReg.languages || []);
      } else {
        router.push("/");
      }
      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  const toggleSelection = (item: string, list: string[], setList: (val: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSave = async () => {
    if (!registration) return;
    setSaving(true);
    
    try {
      let photoUrl = registration.profile_photo_url;
      
      // Upload new photo if selected
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${registration.user_id}/photo/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('volunteer-documents')
          .upload(filePath, photoFile);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('volunteer-documents')
          .getPublicUrl(filePath);
          
        photoUrl = publicUrl;
      }
      
      const { error } = await supabase
        .from('volunteer_registrations')
        .update({
          mobile_number: mobile,
          availability: availability,
          skills: selectedSkills,
          languages: selectedLanguages,
          profile_photo_url: photoUrl
        })
        .eq('id', registration.id);
        
      if (error) throw error;
      
      setRegistration({
        ...registration,
        mobile_number: mobile,
        availability: availability,
        skills: selectedSkills,
        languages: selectedLanguages,
        profile_photo_url: photoUrl
      });
      
      toast.success("Profile updated successfully");
      setPhotoFile(null); // Reset file input
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-[calc(100vh-80px)]">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Volunteer Profile</h1>
          <p className="text-muted-foreground">Manage your settings and availability.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Read Only Info */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-muted mb-4">
                <Image 
                  src={photoFile ? URL.createObjectURL(photoFile) : registration?.profile_photo_url || "/images/placeholder-user.jpg"} 
                  alt="Profile" 
                  fill 
                  className="object-cover"
                />
                <label className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white">
                  <Camera className="h-8 w-8" />
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
                </label>
              </div>
              <h3 className="text-xl font-bold">{registration?.full_name}</h3>
              <p className="text-primary font-medium text-sm flex items-center gap-1 mt-1">
                <ShieldCheck className="h-4 w-4" /> Verified Sahayak
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{registration?.email}</span>
              </div>
              <div className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{registration?.district}, {registration?.state}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Briefcase className="h-4 w-4 shrink-0" />
                <span>{registration?.occupation}</span>
              </div>
            </CardContent>
            <CardFooter>
               <Button variant="outline" className="w-full text-xs" onClick={() => router.push("/profile")}>
                 Change Password
               </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Editable Forms */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Update Information</CardTitle>
              <CardDescription>Keep your contact details and availability up to date.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <select
                    id="availability"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
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

              <div className="space-y-3">
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map(skill => (
                    <div 
                      key={skill}
                      onClick={() => toggleSelection(skill, selectedSkills, setSelectedSkills)}
                      className={`cursor-pointer px-3 py-1.5 rounded-full text-xs border transition-colors font-medium ${
                        selectedSkills.includes(skill) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'
                      }`}
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Languages Known</Label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(lang => (
                    <div 
                      key={lang}
                      onClick={() => toggleSelection(lang, selectedLanguages, setSelectedLanguages)}
                      className={`cursor-pointer px-3 py-1.5 rounded-full text-xs border transition-colors font-medium ${
                        selectedLanguages.includes(lang) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'
                      }`}
                    >
                      {lang}
                    </div>
                  ))}
                </div>
              </div>

            </CardContent>
            <CardFooter className="justify-end border-t pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
