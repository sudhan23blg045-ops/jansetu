"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Users, ShieldCheck, Trophy, Sparkles } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function VolunteerLandingPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/nomadic_hero_bg_1784295694544.jpg"
            alt="Volunteer Background"
            fill
            className="object-cover opacity-20 dark:opacity-10"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background"></div>
        </div>
        
        <div className="container relative z-10 px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm mb-4"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Join the Jansetu Volunteer Network
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold tracking-tight"
            >
              Empower Communities. <br className="hidden md:block" />
              <span className="text-primary">Make a Real Difference.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-muted-foreground"
            >
              Become a Jansetu Sahayak (Volunteer) and help nomadic and semi-nomadic communities access government schemes, education, and livelihood opportunities.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Button asChild size="lg" className="rounded-full px-8 text-lg">
                <Link href="/volunteer/register">
                  Register as Volunteer <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 text-lg">
                <Link href="/volunteer/dashboard">
                  Volunteer Login
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Volunteer Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Why Volunteer with Jansetu?</h2>
            <p className="text-muted-foreground text-lg">
              Your time and skills can transform lives by bridging the gap between available resources and the communities that need them most.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-card p-6 rounded-2xl border shadow-sm flex flex-col items-center text-center hover:border-primary/50 transition-colors"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Direct Impact</h3>
              <p className="text-muted-foreground">
                Work directly with individuals to help them apply for crucial government schemes and secure their livelihoods.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card p-6 rounded-2xl border shadow-sm flex flex-col items-center text-center hover:border-primary/50 transition-colors"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Network</h3>
              <p className="text-muted-foreground">
                Join a secure, verified network of dedicated volunteers and NGOs working towards a common goal of inclusive growth.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card p-6 rounded-2xl border shadow-sm flex flex-col items-center text-center hover:border-primary/50 transition-colors"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Earn Recognition</h3>
              <p className="text-muted-foreground">
                Build your profile, earn badges for your contributions, and receive official certificates for your volunteer hours.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl mx-auto">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">How it Works</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0">1</div>
                  <div>
                    <h4 className="text-lg font-semibold">Register & Verify</h4>
                    <p className="text-muted-foreground">Complete the registration form and upload your identity documents for verification.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0">2</div>
                  <div>
                    <h4 className="text-lg font-semibold">Get Assigned</h4>
                    <p className="text-muted-foreground">Admins will assign you applications from communities in your region or matching your skills.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0">3</div>
                  <div>
                    <h4 className="text-lg font-semibold">Assist & Update</h4>
                    <p className="text-muted-foreground">Contact the applicant, help them gather documents, apply on government portals, and update the status on Jansetu.</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button asChild size="lg">
                  <Link href="/volunteer/register">Get Started Today</Link>
                </Button>
              </div>
            </div>
            
            <div className="flex-1 w-full max-w-md bg-muted/20 p-8 rounded-3xl border">
              <div className="bg-card rounded-xl p-4 shadow-sm border mb-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-sm">New Application Assigned</span>
                  <span className="text-xs text-muted-foreground">Just now</span>
                </div>
                <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
                <div className="h-4 w-1/2 bg-muted rounded mb-4"></div>
                <div className="flex justify-end">
                  <div className="h-8 w-24 bg-primary/20 rounded"></div>
                </div>
              </div>
              <div className="bg-card rounded-xl p-4 shadow-sm border opacity-70">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-sm">Status Updated</span>
                  <span className="text-xs text-muted-foreground">2 hrs ago</span>
                </div>
                <div className="h-4 w-full bg-muted rounded mb-2"></div>
                <div className="h-4 w-2/3 bg-muted rounded mb-4"></div>
                <div className="flex justify-end">
                   <div className="h-8 w-24 bg-primary/20 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
