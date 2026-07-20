"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowRight, Landmark, Building2, BookOpen, FileText, 
  Briefcase, LifeBuoy, Bot, User, CheckCircle2, Shield, Heart, HeartHandshake, Map
} from "lucide-react";

import { useTranslation } from "@/lib/i18n/LanguageContext";
import { Counter } from "@/components/ui/counter";
import { FADE_IN_UP, STAGGER_CONTAINER } from "@/lib/animations";

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative w-full h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 25, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
            className="absolute inset-0"
          >
            <Image 
              src="/images/hero-bg.jpg" 
              alt="Nomadic Community Landscape" 
              fill 
              className="object-cover object-center"
              priority
            />
          </motion.div>
          <div className="absolute inset-0 bg-black/60 dark:bg-black/70" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={STAGGER_CONTAINER}
            className="flex flex-col items-center space-y-6 text-center text-white max-w-4xl mx-auto"
          >
            <motion.div variants={FADE_IN_UP} className="inline-flex items-center rounded-full border border-white/30 px-3 py-1 text-sm bg-white/10 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
              <Shield className="mr-2 h-4 w-4 text-emerald-400" />
              <span>{t("hero.sdg")}</span>
            </motion.div>
            <motion.h1 variants={FADE_IN_UP} className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              {t("hero.main_heading")}
            </motion.h1>
            <motion.p variants={FADE_IN_UP} className="mx-auto max-w-[800px] text-lg md:text-xl text-white/90">
              {t("hero.main_desc")}
            </motion.p>
            <motion.div variants={FADE_IN_UP} className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
                <Button asChild size="lg" className="text-md h-12 px-8 rounded-full shadow-[0_8px_24px_rgba(22,163,74,0.3)] hover:shadow-[0_12px_28px_rgba(22,163,74,0.4)] transition-shadow">
                  <Link href="/register">{t("hero.check_eligibility")}</Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
                <Button asChild variant="outline" size="lg" className="text-md h-12 px-8 rounded-full bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white backdrop-blur-sm shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
                  <Link href="/schemes">{t("hero.explore_schemes")}</Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. Impact Statistics */}
      <section className="w-full py-12 bg-primary/5 dark:bg-primary/10 border-b">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={FADE_IN_UP} className="space-y-2">
              <h3 className="text-4xl font-bold text-primary"><Counter value={150} suffix="+" /></h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("stats.schemes")}</p>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={FADE_IN_UP} className="space-y-2">
              <h3 className="text-4xl font-bold text-primary"><Counter value={45} suffix="+" /></h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("stats.ngos")}</p>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={FADE_IN_UP} className="space-y-2">
              <h3 className="text-4xl font-bold text-primary"><Counter value={12} suffix="k+" /></h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("stats.users")}</p>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={FADE_IN_UP} className="space-y-2">
              <h3 className="text-4xl font-bold text-primary"><Counter value={850} suffix="+" /></h3>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t("stats.volunteers")}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. About the Project */}
      <section className="w-full py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={FADE_IN_UP} className="space-y-6">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">About Jansetu</div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Digital Inclusion for the Marganilized</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Nomadic and semi-nomadic tribes are among the most marginalized groups, often lacking permanent addresses which restricts their access to fundamental rights, healthcare, and state welfare schemes.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our platform provides a secure digital identity integration, ensuring these communities can seamlessly discover and apply for schemes, connect with NGOs, and access vital educational resources without geographic barriers.
              </p>
              <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                <Button variant="link" className="px-0 text-primary group" asChild>
                  <Link href="/about">Read our full mission <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </motion.div>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={FADE_IN_UP} className="relative aspect-square md:aspect-video rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
               <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent z-10"></div>
               {/* Decorative placeholder block representing an image */}
               <div className="w-full h-full bg-muted flex items-center justify-center p-8 relative">
                 <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#16A34A 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                 <HeartHandshake className="h-32 w-32 text-primary/40" />
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Challenges Faced */}
      <section className="w-full py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Addressing Core Challenges</h2>
            <p className="text-lg text-muted-foreground">We recognize the unique obstacles faced by nomadic populations and have built tools specifically designed to overcome them.</p>
          </div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={STAGGER_CONTAINER} className="grid md:grid-cols-3 gap-8">
            <motion.div variants={FADE_IN_UP} className="bg-background p-8 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.04)] border transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6 text-red-600 dark:text-red-400">
                <Map className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Lack of Permanent Identity</h3>
              <p className="text-muted-foreground">Without fixed addresses, securing documentation is difficult. Our platform assists in navigating alternative verification methods and connects users with NGOs that facilitate ID procurement.</p>
            </motion.div>
            <motion.div variants={FADE_IN_UP} className="bg-background p-8 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.04)] border transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Healthcare Access</h3>
              <p className="text-muted-foreground">Constant migration disrupts healthcare continuity. We provide access to mobile health clinics mapping and national health scheme enrollments.</p>
            </motion.div>
            <motion.div variants={FADE_IN_UP} className="bg-background p-8 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.04)] border transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-6 text-orange-600 dark:text-orange-400">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Education Disruption</h3>
              <p className="text-muted-foreground">Children's education suffers due to mobility. Jansetu offers digital literacy courses and connections to residential school programs.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 5. Platform Features */}
      <section className="w-full py-20 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Comprehensive Features</h2>
            <p className="text-lg text-muted-foreground">A premium suite of tools designed to facilitate empowerment and accessibility.</p>
          </div>
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }} 
            variants={STAGGER_CONTAINER}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { icon: Bot, title: "Sahayak AI", desc: "Multilingual guidance for scheme eligibility and application.", link: "/sahayak-ai" },
              { icon: CheckCircle2, title: "Eligibility Checker", desc: "Instantly match with relevant schemes based on your profile.", link: "/schemes" },
              { icon: Landmark, title: "Government Schemes", desc: "A centralized directory of state and central welfare programs.", link: "/schemes" },
              { icon: Building2, title: "NGO Directory", desc: "Connect with verified organizations offering direct assistance.", link: "/ngos" },
              { icon: BookOpen, title: "Skill Development", desc: "Access free digital courses to enhance employability.", link: "/education" },
              { icon: FileText, title: "Document Vault", desc: "Securely upload and manage necessary identification documents.", link: "/profile" },
              { icon: Briefcase, title: "Livelihood Opportunities", desc: "Find inclusive remote and local livelihood opportunities.", link: "/livelihood-opportunities" },
              { icon: LifeBuoy, title: "Help Desk", desc: "24/7 support, guides, and community FAQs.", link: "/help" },
            ].map((feature, idx) => (
              <motion.div key={idx} variants={FADE_IN_UP}>
                <Link href={feature.link} className="block group h-full">
                  <motion.div whileHover={{ y: -3, boxShadow: "0px 12px 30px rgba(0,0,0,0.06)" }} transition={{ duration: 0.2, ease: "easeOut" }} className="h-full">
                    <Card className="h-full border bg-card transition-colors duration-300 hover:border-primary/30 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <CardHeader>
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <feature.icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 6. Featured Schemes & 7. NGO Partners (Combined layout for better flow) */}
      <section className="w-full py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Featured Schemes */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={STAGGER_CONTAINER}>
              <motion.div variants={FADE_IN_UP} className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-2">Featured Schemes</h2>
                  <p className="text-muted-foreground text-sm">Top welfare programs currently active.</p>
                </div>
                <Button variant="link" asChild className="hidden sm:flex">
                  <Link href="/schemes">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </motion.div>
              <div className="space-y-4">
                {[
                  { title: "Pradhan Mantri Awas Yojana (PMAY)", tag: "Housing" },
                  { title: "Ayushman Bharat PM-JAY", tag: "Healthcare" },
                  { title: "National Rural Employment Guarantee Act", tag: "Employment" }
                ].map((scheme, i) => (
                  <motion.div key={i} variants={FADE_IN_UP} whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                    <Card className="border transition-colors duration-300 hover:border-primary/30">
                      <CardHeader className="p-4 sm:p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <span className="text-xs font-semibold uppercase tracking-wider text-primary">{scheme.tag}</span>
                            <CardTitle className="text-lg">{scheme.title}</CardTitle>
                          </div>
                          <Button variant="outline" size="sm" className="transition-all hover:bg-primary hover:text-primary-foreground">Apply</Button>
                        </div>
                      </CardHeader>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* NGO Partners */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={STAGGER_CONTAINER}>
              <motion.div variants={FADE_IN_UP} className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-2">Partner NGOs</h2>
                  <p className="text-muted-foreground text-sm">Organizations working tirelessly on the ground.</p>
                </div>
                <Button variant="link" asChild className="hidden sm:flex">
                  <Link href="/ngos">View Directory <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </motion.div>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div key={i} variants={FADE_IN_UP} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                    <Card className="flex items-center justify-center p-6 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all h-full">
                       <div className="opacity-50 grayscale hover:grayscale-0 transition-all font-bold text-lg text-muted-foreground hover:text-foreground">
                          NGO Partner {i}
                       </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 8. AI Assistant Preview */}
      <section className="w-full py-20 md:py-32 overflow-hidden bg-primary text-primary-foreground relative">
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={STAGGER_CONTAINER} className="space-y-6">
              <motion.h2 variants={FADE_IN_UP} className="text-3xl md:text-5xl font-bold tracking-tight text-white">Meet Sahayak AI</motion.h2>
              <motion.p variants={FADE_IN_UP} className="text-lg text-primary-foreground/80 leading-relaxed">
                Your multilingual AI assistant that helps nomadic communities discover government schemes, trusted NGOs, livelihood opportunities, and community support through natural conversations.
              </motion.p>
              <motion.ul variants={FADE_IN_UP} className="space-y-3">
                <li className="flex items-center"><CheckCircle2 className="mr-3 h-5 w-5 text-emerald-300" /> Government Scheme Guidance</li>
                <li className="flex items-center"><CheckCircle2 className="mr-3 h-5 w-5 text-emerald-300" /> NGO & Community Support</li>
                <li className="flex items-center"><CheckCircle2 className="mr-3 h-5 w-5 text-emerald-300" /> Livelihood Assistance</li>
                <li className="flex items-center"><CheckCircle2 className="mr-3 h-5 w-5 text-emerald-300" /> Multilingual Conversations</li>
                <li className="flex items-center"><CheckCircle2 className="mr-3 h-5 w-5 text-emerald-300" /> Voice Interaction (Coming Soon)</li>
              </motion.ul>
              <motion.div variants={FADE_IN_UP} className="pt-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block">
                  <Button asChild size="lg" variant="secondary" className="rounded-full px-8 shadow-[0_8px_24px_rgba(255,255,255,0.2)]">
                    <Link href="/sahayak-ai">Talk to Sahayak AI</Link>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
            
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={FADE_IN_UP} className="relative">
              <Card className="bg-background/95 backdrop-blur-sm border-0 shadow-2xl text-foreground max-w-md ml-auto">
                <CardHeader className="border-b pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/20 p-2 rounded-full">
                      <Bot className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Sahayak AI</CardTitle>
                      <p className="text-xs text-green-600 font-medium">Online</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="flex gap-3">
                    <div className="bg-primary/10 p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted p-3 rounded-2xl rounded-tl-none max-w-[80%] space-y-2">
                      <p className="text-sm">Hello! 👋 Welcome to Jansetu.</p>
                      <p className="text-sm">I'm Sahayak AI.</p>
                      <p className="text-sm">I can help you with:</p>
                      <ul className="text-sm list-disc pl-4 space-y-1">
                        <li>Government Schemes</li>
                        <li>NGOs</li>
                        <li>Livelihood Opportunities</li>
                        <li>Community Support</li>
                      </ul>
                      <p className="text-sm font-medium pt-1">How can I help you today?</p>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-row-reverse">
                    <div className="bg-primary p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0 text-white">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-tr-none max-w-[80%]">
                      <p className="text-sm">I need a government scheme for my family.</p>
                    </div>
                  </div>
                   <div className="flex gap-3">
                    <div className="bg-primary/10 p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted p-3 rounded-2xl rounded-tl-none max-w-[80%]">
                      <p className="text-sm">Certainly. May I know your state so I can recommend the most relevant schemes?</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 9. Testimonials */}
      <section className="w-full py-20 md:py-32 bg-muted/20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Community Impact</h2>
            <p className="text-lg text-muted-foreground">Hear from individuals who have successfully utilized the platform.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { text: "Through Jansetu, I was finally able to secure a permanent resident certificate and enroll my children in the local school.", author: "Ramesh G.", location: "Rajasthan" },
              { text: "The AI Assistant guided me in my native language to apply for a small business loan scheme. It was incredibly easy to use.", author: "Sunita M.", location: "Maharashtra" },
              { text: "We found an NGO partner through the directory that helped our community set up a mobile health camp.", author: "Vikram S.", location: "Gujarat" }
            ].map((testimonial, idx) => (
              <motion.div key={idx} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_IN_UP}>
                <Card className="h-full bg-background border-none shadow-md relative">
                  <div className="absolute top-4 right-4 text-primary/20 text-6xl font-serif">"</div>
                  <CardContent className="pt-8">
                    <p className="text-muted-foreground italic mb-6 relative z-10">"{testimonial.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                        {testimonial.author.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{testimonial.author}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Final CTA */}
      <section className="w-full py-24 bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground text-center">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_IN_UP} className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">Join the Jansetu Community</h2>
            <p className="text-xl md:text-2xl text-primary-foreground/90">
              Start your journey towards understanding your rights and accessing opportunities. Registration is free, secure, and fast.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" variant="secondary" className="text-lg h-14 px-10 rounded-full shadow-2xl">
                <Link href="/register">Create Your Free Account</Link>
              </Button>
            </div>
            <p className="text-sm text-primary-foreground/70 mt-4">No documentation required for initial signup.</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
