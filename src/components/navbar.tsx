"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { VoiceGuide } from "@/components/voice-guide";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Home, FileText, Building, Users, Briefcase, Bot, UserCircle, Library, ClipboardList, Menu, Mail, HelpCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Language = "en" | "ta" | "kn" | "hi" | "te";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const { t, language, setLanguage } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-20">
      <div className="container flex h-full items-center justify-between mx-auto px-4 gap-4">
        {/* Left Side: Fixed Width */}
        <div className="w-auto lg:w-48 shrink-0 flex items-center h-full">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/images/jansetu-logo.png" alt="Jansetu Logo" width={40} height={40} className="object-contain" />
            <span className="font-bold text-xl tracking-tight text-primary hidden lg:inline-block">{t("hero.title")}</span>
          </Link>
        </div>

        {/* Center: Equal Width Grid */}
        <nav className="hidden lg:grid grid-cols-9 gap-1 xl:gap-2 flex-1 h-full py-2 max-w-6xl mx-auto">
          {[
            { href: "/", icon: Home, label: t("footer.home") },
            { href: "/schemes", icon: FileText, label: t("nav.schemes_short") },
            { href: "/ngos", icon: Building, label: t("nav.ngos") },
            { href: "/nomadic-communities", icon: Users, label: t("nav.communities_short") },
            { href: "/livelihoods", icon: Briefcase, label: t("nav.livelihoods_short") },
            { href: "/resources", icon: Library, label: t("nav.resources_short") },
            { href: "/applications", icon: ClipboardList, label: "Applications" },
            { href: "/volunteer", icon: UserCircle, label: "Volunteer" },
            { href: "/sahayak-ai", icon: Bot, label: t("nav.ai_assistant") },
          ].map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className="relative flex flex-col items-center justify-center gap-1 text-center h-full text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-md transition-colors px-1 group">
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-primary/10 rounded-md z-0"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <motion.div whileHover={{ scale: 1.1 }} className="relative z-10 flex flex-col items-center gap-1">
                  <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-primary" : ""}`} />
                  <span className={`text-[10px] xl:text-xs font-medium leading-tight line-clamp-2 ${isActive ? "text-primary font-bold" : ""}`}>
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Right Side: Fixed Width & Align Right */}
        <div className="w-auto lg:w-[280px] xl:w-[350px] shrink-0 flex items-center justify-end gap-2 xl:gap-3 h-full">
          <Select value={language} onValueChange={(val) => { if (val) setLanguage(val as Language); }}>
            <SelectTrigger className="w-[120px] h-9 gap-2 shrink-0">
              <span>🌐</span>
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t("lang.en")}</SelectItem>
              <SelectItem value="ta">{t("lang.ta")}</SelectItem>
              <SelectItem value="kn">{t("lang.kn")}</SelectItem>
              <SelectItem value="hi">{t("lang.hi")}</SelectItem>
              <SelectItem value="te">{t("lang.te")}</SelectItem>
            </SelectContent>
          </Select>
          
          <ThemeToggle />
          <VoiceGuide />
          
          <div className="hidden md:flex gap-2 items-center">
            {user ? (
              <>
                <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium hover:text-primary mx-2 whitespace-nowrap">
                  <UserCircle className="h-5 w-5 shrink-0" />
                  <span className="max-w-[80px] truncate">{user.user_metadata?.first_name || t('nav.profile')}</span>
                </Link>
                <Button variant="outline" onClick={handleLogout} className="whitespace-nowrap shrink-0">
                  {t("nav.logout")}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" asChild className="whitespace-nowrap shrink-0">
                  <Link href="/login">{t("nav.login")}</Link>
                </Button>
                <Button asChild className="whitespace-nowrap shrink-0">
                  <Link href="/register">{t("nav.get_started")}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9 shrink-0">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle mobile menu</span>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] sm:w-[350px] overflow-y-auto px-6 py-6 pb-[env(safe-area-inset-bottom)] [&>button]:p-3 [&>button]:top-5 [&>button]:right-5">
                <SheetHeader className="text-left mb-8 mt-2">
                  <SheetTitle className="text-xl font-bold text-primary flex items-center gap-3">
                    <Image src="/images/jansetu-logo.png" alt="Logo" width={32} height={32} className="object-contain" />
                    <span className="leading-none mt-1">{t("hero.title")}</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-8 pb-10">
                  <div className="flex flex-col space-y-1">
                    {[
                      { href: "/", icon: Home, label: t("footer.home") },
                      { href: "/schemes", icon: FileText, label: t("nav.schemes_short") },
                      { href: "/nomadic-communities", icon: Users, label: t("nav.communities_short") },
                      { href: "/ngos", icon: Building, label: t("nav.ngos") },
                      { href: "/livelihoods", icon: Briefcase, label: t("nav.livelihoods_short") },
                      { href: "/resources", icon: Library, label: t("nav.resources_short") },
                      { href: "/sahayak-ai", icon: Bot, label: t("nav.ai_assistant") },
                      { href: "/volunteer", icon: UserCircle, label: "Volunteer" },
                      { href: "/dashboard", icon: ClipboardList, label: "Dashboard" },
                      { href: "/contact", icon: Mail, label: t("footer.contact") },
                      { href: "/help", icon: HelpCircle, label: "FAQs" }
                    ].map((item) => {
                      const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-4 text-[16px] font-medium py-3 px-4 rounded-lg transition-all active:scale-[0.98] ${
                            isActive 
                              ? 'bg-primary/10 text-primary border-l-4 border-primary rounded-l-none' 
                              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                          }`}
                        >
                          <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>

                  <div className="flex flex-col space-y-4 pt-6 border-t border-border px-4">
                    <Link href="#" onClick={() => setIsMobileMenuOpen(false)} className="text-[15px] font-medium text-muted-foreground hover:text-primary transition-colors">
                      {t("footer.privacy")}
                    </Link>
                    <Link href="#" onClick={() => setIsMobileMenuOpen(false)} className="text-[15px] font-medium text-muted-foreground hover:text-primary transition-colors">
                      {t("footer.terms")}
                    </Link>
                  </div>

                  <div className="flex flex-col space-y-4 pt-6 pb-8 border-t border-border mt-auto">
                    {user ? (
                      <Button variant="outline" size="lg" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full justify-start text-[16px] h-12">
                        {t("nav.logout")}
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" size="lg" asChild className="w-full justify-start text-[16px] h-12" onClick={() => setIsMobileMenuOpen(false)}>
                          <Link href="/login">{t("nav.login")}</Link>
                        </Button>
                        <Button size="lg" asChild className="w-full justify-start text-[16px] h-12" onClick={() => setIsMobileMenuOpen(false)}>
                          <Link href="/register">{t("nav.get_started")}</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
