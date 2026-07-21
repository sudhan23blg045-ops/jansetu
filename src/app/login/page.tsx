"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let emailToLogin = identifier.trim();

    // Determine if input is email or phone. Basic check for '@'
    const isEmail = emailToLogin.includes("@");

    if (!isEmail) {
      // Input is treated as a phone number. Look up the corresponding email.
      const { data: email, error: lookupError } = await supabase.rpc('get_email_by_phone', { 
        p_phone: emailToLogin 
      });

      if (lookupError || !email) {
        setError("No account found with this phone number.");
        setLoading(false);
        return;
      }
      
      emailToLogin = email;
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: emailToLogin,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        router.push("/dashboard");
      } else if (profile?.role === 'admin') {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-140px)] mx-auto px-4 py-8">
      <Card className="w-full max-w-md">
        <form onSubmit={handleLogin}>
          <CardHeader className="space-y-1 flex flex-col items-center">
            <Image src="/images/jansetu-logo.png" alt="Jansetu Logo" width={80} height={80} className="mb-2 object-contain" />
            <CardTitle className="text-2xl font-bold text-center">{t("auth.welcome")}</CardTitle>
            <CardDescription className="text-center">
              {t("auth.login_msg")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or Phone Number</Label>
              <Input 
                id="identifier" 
                type="text" 
                placeholder="m@example.com or +91 00000 00000" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Link href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("auth.signing_in") : t("auth.sign_in")}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              {t("auth.no_account")} {" "}
              <Link href="/register" className="text-primary hover:underline font-medium">
                {t("auth.sign_up")}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
