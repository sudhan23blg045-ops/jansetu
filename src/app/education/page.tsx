import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Award, PlayCircle } from "lucide-react";

export default function EducationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Education & Skill Development</h1>
        <p className="text-muted-foreground">Access training programs and courses to boost your career.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground border-transparent">
                  IT & Software
                </span>
                <span className="text-sm font-medium">Free</span>
              </div>
              <CardTitle>Introduction to Digital Literacy</CardTitle>
              <CardDescription className="mt-2">
                Learn the basics of computers, internet browsing, and digital communication tools essential for the modern workplace.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  12 Modules (4 hours)
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Award className="mr-2 h-4 w-4" />
                  Certificate on completion
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t">
              <Button className="w-full">
                <BookOpen className="mr-2 h-4 w-4" /> Start Learning
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
