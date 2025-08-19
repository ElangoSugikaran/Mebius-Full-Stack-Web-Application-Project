import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Save, 
  Edit, 
  Eye, 
  Upload, 
  Home, 
  Sparkles, 
  ArrowRight,
  Plus,
  Trash2,
  Move
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Schema for hero section form
const heroSectionSchema = z.object({
  badgeText: z.string().min(1, "Badge text is required"),
  mainHeadline: z.string().min(1, "Main headline is required"),
  highlightedWord: z.string().min(1, "Highlighted word is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  primaryButtonText: z.string().min(1, "Primary button text is required"),
  secondaryButtonText: z.string().min(1, "Secondary button text is required"),
  isActive: z.boolean().default(true)
});

// Schema for hero images
const heroImageSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Image title is required"),
  description: z.string().optional(),
  imageUrl: z.string().min(1, "Image URL is required"),
  position: z.enum(["featured", "small-1", "small-2"]),
  isActive: z.boolean().default(true)
});

// Mock initial data - replace with actual API calls
const initialHeroData = {
  badgeText: "New Collection 2025",
  mainHeadline: "Style That",
  highlightedWord: "Speaks",
  description: "Discover premium fashion that fits your lifestyle. From casual comfort to elegant sophistication, find your perfect style with our curated collections.",
  primaryButtonText: "Shop Now",
  secondaryButtonText: "View Collections",
  isActive: true
};

const initialImages = [
  {
    id: "1",
    title: "Summer Collection",
    description: "100+ New Arrivals",
    imageUrl: "/assets/images/729091cd0452fb9d0b89106ceec16368.png",
    position: "featured",
    isActive: true
  },
  {
    id: "2",
    title: "Outdoor Active",
    description: "",
    imageUrl: "/assets/images/29a85f64d93c41afa6b64d31b3a88038.png",
    position: "small-1",
    isActive: true
  },
  {
    id: "3",
    title: "Casual Comfort",
    description: "",
    imageUrl: "/assets/images/0233936f837e7b69d6a545511b1ba132.png",
    position: "small-2",
    isActive: true
  }
];

// Main Admin Home Management Component
const AdminHomeManagement = () => {
  const [activeTab, setActiveTab] = useState("hero-content");
  const [heroImages, setHeroImages] = useState(initialImages);
  const [previewMode, setPreviewMode] = useState(false);

  // Hero Section Form
  const heroForm = useForm({
    resolver: zodResolver(heroSectionSchema),
    defaultValues: initialHeroData
  });

  // Handle hero section submit
  const onHeroSubmit = async (values) => {
    try {
      console.log("Hero Section Data:", values);
      // TODO: Replace with actual API call
      // await updateHeroSection(values).unwrap();
      alert("Hero section updated successfully!");
    } catch (error) {
      console.error("Failed to update hero section:", error);
      alert("Failed to update hero section");
    }
  };

  // Handle image upload
  const handleImageUpload = (event, imageId) => {
    const file = event.target.files[0];
    if (file) {
      // TODO: Upload to your image service
      const fakeUrl = URL.createObjectURL(file);
      setHeroImages(prev => 
        prev.map(img => 
          img.id === imageId 
            ? { ...img, imageUrl: fakeUrl }
            : img
        )
      );
    }
  };

  // Update image details
  const updateImageDetails = (imageId, field, value) => {
    setHeroImages(prev => 
      prev.map(img => 
        img.id === imageId 
          ? { ...img, [field]: value }
          : img
      )
    );
  };

  // Preview Component
  const HeroPreview = () => {
    const heroData = heroForm.watch();
    
    return (
      <div className="border rounded-lg overflow-hidden bg-gray-50">
        <div className="bg-white p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Side - Text Content */}
            <div className="space-y-6">
              <div className="space-y-4">
                <Badge className="bg-blue-50 text-blue-700 px-4 py-2">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {heroData.badgeText}
                </Badge>
                
                <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                  {heroData.mainHeadline}
                  <span className="text-blue-600"> {heroData.highlightedWord}</span>
                  <br />
                  Your Language
                </h1>
                
                <p className="text-lg text-gray-600">
                  {heroData.description}
                </p>
              </div>
              
              <div className="flex gap-4">
                <Button className="px-8 py-4">
                  {heroData.primaryButtonText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" className="px-8 py-4">
                  {heroData.secondaryButtonText}
                </Button>
              </div>
            </div>
            
            {/* Right Side - Images */}
            <div className="grid grid-cols-2 gap-4 h-[400px]">
              {heroImages.filter(img => img.isActive).map((image) => (
                <div
                  key={image.id}
                  className={`relative rounded-2xl overflow-hidden ${
                    image.position === "featured" ? "col-span-2" : ""
                  }`}
                >
                  <img
                    src={image.imageUrl}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-3 left-3">
                    <span className="text-white font-medium text-sm">
                      {image.title}
                    </span>
                    {image.description && (
                      <p className="text-white/80 text-xs">{image.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Home className="mr-3 h-8 w-8" />
            Home Page Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your website's home page content and appearance
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center"
          >
            <Eye className="mr-2 h-4 w-4" />
            {previewMode ? "Edit Mode" : "Preview Mode"}
          </Button>
        </div>
      </div>

      {previewMode ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Live Preview</h2>
            <Button onClick={() => setPreviewMode(false)}>
              <Edit className="mr-2 h-4 w-4" />
              Back to Edit
            </Button>
          </div>
          <HeroPreview />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hero-content">Hero Content</TabsTrigger>
            <TabsTrigger value="hero-images">Hero Images</TabsTrigger>
          </TabsList>

          {/* HERO CONTENT TAB */}
          <TabsContent value="hero-content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Edit className="mr-2 h-5 w-5" />
                  Hero Section Content
                </CardTitle>
                <CardDescription>
                  Update the main hero section text and buttons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...heroForm}>
                  <div className="space-y-6">
                    
                    {/* Badge Text */}
                    <FormField
                      control={heroForm.control}
                      name="badgeText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Badge Text</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., New Collection 2025" {...field} />
                          </FormControl>
                          <FormDescription>
                            Small badge text that appears above the headline
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Main Headline */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={heroForm.control}
                        name="mainHeadline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Main Headline</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Style That" {...field} />
                            </FormControl>
                            <FormDescription>
                              First part of the main headline
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={heroForm.control}
                        name="highlightedWord"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Highlighted Word</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Speaks" {...field} />
                            </FormControl>
                            <FormDescription>
                              Word that will be highlighted in blue
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Description */}
                    <FormField
                      control={heroForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your brand and what makes it special..." 
                              className="min-h-24"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Supporting text that explains your value proposition
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Button Texts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={heroForm.control}
                        name="primaryButtonText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Button Text</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Shop Now" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={heroForm.control}
                        name="secondaryButtonText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secondary Button Text</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., View Collections" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Active Status */}
                    <FormField
                      control={heroForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active Section</FormLabel>
                            <FormDescription>
                              Show this hero section on the homepage
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button 
                        onClick={heroForm.handleSubmit(onHeroSubmit)}
                        className="px-8">
                        <Save className="mr-2 h-4 w-4" />
                        Save Hero Content
                      </Button>
                    </div>
                  </div>
                </Form>
              </CardContent>
            </Card>

            {/* Live Preview Card */}
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>
                  See how your changes will look on the homepage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HeroPreview />
              </CardContent>
            </Card>
          </TabsContent>

          {/* HERO IMAGES TAB */}
          <TabsContent value="hero-images" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {heroImages.map((image) => (
                <Card key={image.id}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      {image.position === "featured" ? "Featured Image" : `Image ${image.position.split('-')[1]}`}
                      <Badge variant={image.isActive ? "default" : "secondary"}>
                        {image.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Image Preview */}
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={image.imageUrl}
                        alt={image.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Image Title */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        value={image.title}
                        onChange={(e) => updateImageDetails(image.id, 'title', e.target.value)}
                        placeholder="Image title"
                      />
                    </div>

                    {/* Image Description */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description (Optional)</label>
                      <Input
                        value={image.description}
                        onChange={(e) => updateImageDetails(image.id, 'description', e.target.value)}
                        placeholder="Image description"
                      />
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Upload New Image</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, image.id)}
                          className="cursor-pointer"
                        />
                        <Button type="button" variant="outline" size="sm">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm font-medium">Active</span>
                      <Switch
                        checked={image.isActive}
                        onCheckedChange={(checked) => updateImageDetails(image.id, 'isActive', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Save Images Button */}
            <div className="flex justify-end">
              <Button onClick={() => {
                console.log("Saving images:", heroImages);
                alert("Images updated successfully!");
              }}>
                <Save className="mr-2 h-4 w-4" />
                Save All Images
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AdminHomeManagement;