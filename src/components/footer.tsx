"use client";

import Link from "next/link";
import { Globe, Mail, MessageCircle, Share2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <span className="font-bold text-2xl tracking-tight text-primary">{t("hero.title")}</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6">
              {t("hero.description")}
            </p>
            <div className="flex items-center gap-4 text-muted-foreground">
              <Link href="#" className="hover:text-primary transition-colors">
                <Share2 className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                <Globe className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                <MessageCircle className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <h3 className="font-semibold mb-4 text-foreground">{t("footer.features")}</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/schemes" className="hover:text-primary transition-colors">{t("nav.schemes_short")}</Link></li>
              <li><Link href="/ngos" className="hover:text-primary transition-colors">{t("nav.ngos")}</Link></li>
              <li><Link href="/education" className="hover:text-primary transition-colors">{t("nav.education")}</Link></li>
              <li><Link href="/livelihoods" className="hover:text-primary transition-colors">{t("nav.livelihoods_short")}</Link></li>
            </ul>
          </div>
          <div className="hidden md:block">
            <h3 className="font-semibold mb-4 text-foreground">{t("footer.support")}</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/help" className="hover:text-primary transition-colors">{t("footer.help")}</Link></li>
              <li><Link href="/sahayak-ai" className="hover:text-primary transition-colors">{t("nav.ai_assistant")}</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">{t("footer.contact")}</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">{t("footer.community_guidelines")}</Link></li>
            </ul>
          </div>
          <div className="hidden md:block">
            <h3 className="font-semibold mb-4 text-foreground">{t("footer.legal")}</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">{t("footer.privacy")}</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">{t("footer.terms")}</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">{t("footer.cookie_policy")}</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">{t("footer.accessibility")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>{t("footer.copyright")}</p>
          <p>Designed for SDG 1: No Poverty</p>
        </div>
      </div>
    </footer>
  );
}
