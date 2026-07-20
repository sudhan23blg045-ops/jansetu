"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Building2, 
  Briefcase, 
  Users, 
  UserCircle, 
  LogOut,
  Library,
  ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

const sidebarLinks = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Manage Applications", href: "/admin/applications", icon: ClipboardList },
  { name: "Government Schemes", href: "/admin/schemes", icon: FileText },
  { name: "NGOs", href: "/admin/ngos", icon: Building2 },
  { name: "Livelihoods", href: "/admin/livelihoods", icon: Briefcase },
  { name: "Communities", href: "/admin/communities", icon: Users },
  { name: "Resources", href: "/admin/resources", icon: Library },
  { name: "Volunteers", href: "/admin/volunteers", icon: UserCircle },
  { name: "Users", href: "/admin/users", icon: Users },
];

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className={cn("flex flex-col h-full bg-card border-r", className)}>
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
          <Image src="/images/jansetu-logo.png" alt="Jansetu Logo" width={32} height={32} className="object-contain" />
          <h2 className="text-xl font-bold tracking-tight text-primary">Jansetu</h2>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
