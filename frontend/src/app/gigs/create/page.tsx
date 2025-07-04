"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { main: "Programming & Tech", subs: ["Web Development", "Mobile Apps", "Desktop Applications"] },
  { main: "Graphics & Design", subs: ["Logo Design", "Brand Identity", "Illustrations"] },
  { main: "Digital Marketing", subs: ["Social Media", "SEO", "Content Marketing"] }
];

export default function CreateGigPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    category: { main: "", sub: "" },
    description: "",
    searchTags: [] as string[],
    packages: {
      basic: { title: "Basic Package", description: "", price: 5 },
      standard: { title: "Standard Package", description: "", price: 15 },
      premium: { title: "Premium Package", description: "", price: 25 },
    }
  });
  
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [currentField, setCurrentField] = useState<string | null>(null);
  
  // AI content generation mutation
  const generateContent = trpc.ai.generateGigContent.useMutation({
    onSuccess: (data) => {
      if (!currentField) return;
      
      if (currentField === "title") {
        setFormData(prev => ({ ...prev, title: data.content }));
      } 
      else if (currentField === "description") {
        setFormData(prev => ({ ...prev, description: data.content }));
      }
      else if (currentField === "searchTags") {
        setFormData(prev => ({ 
          ...prev, 
          searchTags: data.content.split(',').map(tag => tag.trim()) 
        }));
      }
      else if (currentField.startsWith("packages.")) {
        const [_, packageType, field] = currentField.split('.');
        if (packageType && field && formData.packages[packageType as keyof typeof formData.packages]) {
          setFormData(prev => ({ 
            ...prev, 
            packages: {
              ...prev.packages,
              [packageType]: {
                ...prev.packages[packageType as keyof typeof formData.packages],
                [field]: data.content
              }
            }
          }));
        }
      }
      
      toast({
        title: "Content Generated",
        description: `Successfully generated content for ${currentField}`,
      });
      
      setCurrentField(null);
      setCurrentPrompt("");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate content. Please try again.",
      });
    }
  });
  
  // Generate titles mutation
  const generateTitles = trpc.ai.generateGigTitles.useMutation({
    onSuccess: (data) => {
      if (data.titles && data.titles.length > 0) {
        setFormData(prev => ({ ...prev, title: data.titles[0] }));
        toast({
          title: "Title Generated",
          description: "Successfully generated gig title!",
        });
      }
    }
  });
  
  // Save gig mutation
  const saveGig = trpc.gigs.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Your gig has been created successfully!",
      });
      router.push(`/gigs/${data.id}`);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create gig. Please check your inputs.",
      });
    }
  });
  
  const handleGenerate = (field: string, context?: string) => {
    setCurrentField(field);
    
    let prompt = currentPrompt;
    if (context) {
      prompt = context;
      setCurrentPrompt(context);
    }
    
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a prompt for generation",
      });
      return;
    }
    
    generateContent.mutate({ 
      prompt, 
      field, 
      context: {
        title: formData.title,
        category: formData.category,
        existing: field.includes('.') 
          ? formData.packages[field.split('.')[1] as keyof typeof formData.packages]
          : null
      } 
    });
  };
  
  const handleQuickTitleGeneration = () => {
    const keywords = formData.category.main && formData.category.sub 
      ? `${formData.category.main} ${formData.category.sub}` 
      : "web development";
    
    generateTitles.mutate({ keywords, count: 1 });
  };
  
  const handleSaveGig = () => {
    // Validate form data
    if (!formData.title.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Gig title is required",
      });
      return;
    }
    
    if (!formData.description.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Gig description is required",
      });
      return;
    }
    
    if (!formData.category.main || !formData.category.sub) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select a category and subcategory",
      });
      return;
    }
    
    saveGig.mutate(formData);
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Gig with AI Assistance</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basics">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basics">Basic Info</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="packages">Packages</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basics" className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Gig Title</Label>
                <div className="flex gap-2">
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="I will..."
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleGenerate("title", "Generate a catchy gig title for a freelance service offering web development with React, Next.js and Tailwind CSS")}
                    disabled={generateContent.isLoading}
                    variant="outline"
                  >
                    {generateContent.isLoading && currentField === "title" ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Generating...
                      </>
                    ) : (
                      "Generate"
                    )}
                  </Button>
                  <Button 
                    onClick={handleQuickTitleGeneration} 
                    disabled={generateTitles.isLoading}
                  >
                    {generateTitles.isLoading ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Quick Gen
                      </>
                    ) : (
                      "Quick Gen"
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={formData.category.main}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      category: { main: value, sub: "" }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category.main} value={category.main}>
                          {category.main}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Subcategory</Label>
                  <Select 
                    value={formData.category.sub}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      category: { ...prev.category, sub: value } 
                    }))}
                    disabled={!formData.category.main}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.category.main && CATEGORIES
                        .find(c => c.main === formData.category.main)?.subs
                        .map(sub => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Search Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.searchTags.join(", ")}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      searchTags: e.target.value.split(",").map(tag => tag.trim())
                    }))}
                    placeholder="react, nextjs, tailwind css"
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleGenerate("searchTags", `Generate 5 search tags for a gig about ${formData.title || "web development with React and Next.js"}`)}
                    disabled={generateContent.isLoading}
                    variant="outline"
                  >
                    {generateContent.isLoading && currentField === "searchTags" ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Generating...
                      </>
                    ) : (
                      "Generate Tags"
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="description" className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="description">Gig Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your service in detail..."
                  className="min-h-[200px]"
                />
                <div className="flex gap-2 pt-2">
                  <Input
                    placeholder="Enter your own prompt for generation"
                    value={currentPrompt}
                    onChange={(e) => setCurrentPrompt(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleGenerate("description")}
                    disabled={generateContent.isLoading || (!currentPrompt && currentField === "description")}
                  >
                    {generateContent.isLoading && currentField === "description" ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Generating...
                      </>
                    ) : (
                      "Generate"
                    )}
                  </Button>
                </div>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    onClick={() => handleGenerate("description", `Write a professional and compelling description for a freelance gig titled "${formData.title || 'Web Development Service'}". Focus on expertise in React, Next.js, and Tailwind CSS. Include mentions of responsive design, clean code, and on-time delivery. The description should be approximately 250 words and highlight my dedication to quality and client satisfaction.`)}
                    disabled={generateContent.isLoading}
                    className="w-full"
                  >
                    Generate Standard Description
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="packages" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["basic", "standard", "premium"].map((pkg) => (
                  <Card key={pkg}>
                    <CardHeader>
                      <CardTitle className="capitalize">{pkg} Package</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={formData.packages[pkg as keyof typeof formData.packages].title}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            packages: {
                              ...prev.packages,
                              [pkg]: {
                                ...prev.packages[pkg as keyof typeof formData.packages],
                                title: e.target.value
                              }
                            }
                          }))}
                          placeholder="Package title"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={formData.packages[pkg as keyof typeof formData.packages].description}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            packages: {
                              ...prev.packages,
                              [pkg]: {
                                ...prev.packages[pkg as keyof typeof formData.packages],
                                description: e.target.value
                              }
                            }
                          }))}
                          placeholder="Package description"
                          rows={4}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGenerate(`packages.${pkg}.description`,
                            `Write a concise description for the ${pkg} package of my ${formData.title || "web development"} service. For the ${pkg} package, focus on ${
                              pkg === 'basic' ? 'essential features and quick delivery' : 
                              pkg === 'standard' ? 'balanced features and good value' : 
                              'premium features and comprehensive service'
                            }. Keep it under 50 words.`
                          )}
                          disabled={generateContent.isLoading}
                          className="w-full mt-1"
                        >
                          {generateContent.isLoading && currentField === `packages.${pkg}.description` ? (
                            <>
                              <Spinner className="mr-2 h-4 w-4" />
                              Generating...
                            </>
                          ) : (
                            "Generate Description"
                          )}
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Price ($)</Label>
                        <Input
                          type="number"
                          value={formData.packages[pkg as keyof typeof formData.packages].price}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            packages: {
                              ...prev.packages,
                              [pkg]: {
                                ...prev.packages[pkg as keyof typeof formData.packages],
                                price: parseInt(e.target.value) || 0
                              }
                            }
                          }))}
                          min="5"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="pt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold">{formData.title || "No title yet"}</h3>
                      <div className="text-sm text-gray-500">
                        {formData.category.main && formData.category.sub 
                          ? `${formData.category.main} › ${formData.category.sub}` 
                          : "No category selected"}
                      </div>
                    </div>
                    
                    {formData.description && (
                      <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <div className="prose prose-sm max-w-none">
                          {formData.description.split('\n').map((paragraph, i) => (
                            <p key={i}>{paragraph}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-medium mb-2">Packages</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {["basic", "standard", "premium"].map((pkg) => (
                          <Card key={pkg} className="overflow-hidden">
                            <div className="bg-muted py-2 px-4 font-medium capitalize">
                              {formData.packages[pkg as keyof typeof formData.packages].title || pkg}
                            </div>
                            <CardContent className="p-4">
                              <div className="mb-4">
                                <span className="text-2xl font-bold">
                                  ${formData.packages[pkg as keyof typeof formData.packages].price}
                                </span>
                              </div>
                              <p className="text-sm">
                                {formData.packages[pkg as keyof typeof formData.packages].description || "No description yet"}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                    
                    {formData.searchTags.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.searchTags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-muted rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-6 flex justify-end">
                <Button 
                  size="lg" 
                  onClick={handleSaveGig}
                  disabled={saveGig.isLoading || !formData.title.trim() || !formData.description.trim()}
                >
                  {saveGig.isLoading ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Creating...
                    </>
                  ) : (
                    "Create Gig"
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
