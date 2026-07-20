"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [community, setCommunity] = useState("");
  const [district, setDistrict] = useState("");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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
        // Create profile if doesn't exist
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
      }
      
      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        phone,
        community,
        district
      })
      .eq('id', user.id);

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
      
      // Update auth metadata as well to keep navbar in sync
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
       alert(error.message);
     } else {
       alert("Password updated successfully!");
       setCurrentPassword("");
       setNewPassword("");
     }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center">Loading profile...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">User Profile</h1>
      
      {message && (
        <div className={`mb-6 p-4 rounded-md text-sm font-medium ${message.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'}`}>
          {message.text}
        </div>
      )}

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
            <div className="space-y-2">
              <Label htmlFor="district">District & State</Label>
              <Input id="district" placeholder="e.g. Jaipur, Rajasthan" value={district} onChange={(e) => setDistrict(e.target.value)} />
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
    </div>
  );
}
