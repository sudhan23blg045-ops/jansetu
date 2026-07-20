import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, LifeBuoy, FileQuestion, Book } from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">How can we help you?</h1>
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input type="search" placeholder="Search for articles, tutorials, or FAQs..." className="pl-10 py-6 text-lg" />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card className="text-center hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2">
              <LifeBuoy className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>Get in touch with our team</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="text-center hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2">
              <FileQuestion className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>FAQs</CardTitle>
            <CardDescription>Find quick answers</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">View FAQs</Button>
          </CardContent>
        </Card>
        <Card className="text-center hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2">
              <Book className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>User Guides</CardTitle>
            <CardDescription>Learn how to use the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Read Guides</Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        {/* Accordion component isn't installed yet, so we use a mock for now */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">How do I apply for a government scheme?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">To apply for a scheme, first ensure your profile is complete. Navigate to the Schemes page, select the scheme you are interested in, and click "Check Eligibility". If eligible, you will be guided through the application process.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Is this platform completely free?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Yes, registering and accessing information on the NOMADS platform is completely free for all users.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
