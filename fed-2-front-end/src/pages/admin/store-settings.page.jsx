import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from 'react';
import { Save, Store, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useUpdateStoreSettingsMutation, useGetStoreSettingsQuery } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// VALIDATION SCHEMA - Updated to match backend expectations
const storeSettingsSchema = z.object({
  name: z.string()
    .min(2, "Store name must be at least 2 characters")
    .max(100, "Store name cannot exceed 100 characters")
    .trim(),
  description: z.string()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal('')),
  email: z.string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .optional()
    .or(z.literal('')),
  address: z.string()
    .max(200, "Address cannot exceed 200 characters")
    .optional()
    .or(z.literal('')),
  city: z.string()
    .max(50, "City name cannot exceed 50 characters")
    .optional()
    .or(z.literal('')),
  state: z.string()
    .max(50, "State name cannot exceed 50 characters")
    .optional()
    .or(z.literal('')),
  zipCode: z.string()
    .max(20, "ZIP code cannot exceed 20 characters")
    .optional()
    .or(z.literal('')),
  openTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter time in HH:MM format"),
  closeTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter time in HH:MM format"),
  isOpen: z.boolean().default(true),
  logo: z.string().optional().or(z.literal('')),
});

const StoreSettingsPage = () => {
  const { 
    data: storeSettings, 
    isLoading, 
    error, 
    refetch 
  } = useGetStoreSettingsQuery();
  
  const [
    updateStoreSettings, 
    { 
      isLoading: isUpdating, 
      error: updateError 
    }
  ] = useUpdateStoreSettingsMutation();

  // FORM SETUP
  const form = useForm({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: {
      name: '',
      description: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      openTime: '09:00',
      closeTime: '18:00',
      isOpen: true,
      logo: ''
    }
  });

  // Load settings data when available
  useEffect(() => {
    if (storeSettings) {
      console.log('📥 Loading settings data:', storeSettings);
      
      form.reset({
        name: storeSettings.name || '',
        description: storeSettings.description || '',
        email: storeSettings.email || '',
        phone: storeSettings.phone || '',
        address: storeSettings.address || '',
        city: storeSettings.city || '',
        state: storeSettings.state || '',
        zipCode: storeSettings.zipCode || '',
        openTime: storeSettings.openTime || '09:00',
        closeTime: storeSettings.closeTime || '18:00',
        isOpen: storeSettings.isOpen !== undefined ? storeSettings.isOpen : true,
        logo: storeSettings.logo || ''
      });
    }
  }, [storeSettings, form]);

  const onSubmit = async (values) => {
    try {
      console.log('📤 Submitting store settings:', values);
      
      const result = await updateStoreSettings(values).unwrap();
      
      console.log('✅ Settings updated successfully:', result);
      toast.success('Store Settings Saved Successfully!', {
        position: "top-right",
        autoClose: 3000
      });
      
      // Optionally refetch to ensure UI is in sync
      refetch();
      
    } catch (error) {
      console.error('❌ Failed to save settings:', error);
      
      // Extract error message
      let errorMessage = 'Failed to Save Store Settings. Please try again.';
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <span className="text-lg text-gray-600">Loading store settings...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load store settings: {error?.data?.message || error?.message || 'Unknown error'}
            </AlertDescription>
          </Alert>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Store className="mr-3 h-8 w-8 text-blue-600" />
                Store Settings
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your store basic information and brand details
              </p>
            </div>
          </div>
        </div>

        {/* Show update error if any */}
        {updateError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Update failed: {updateError?.data?.message || updateError?.message || 'Unknown error'}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="mr-2 h-5 w-5 text-blue-600" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Essential details about your store and brand
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your store/brand name"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        This will be displayed across your store
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your store and what makes it special..."
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Brief description of your brand and products
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Contact Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="mr-2 h-5 w-5 text-green-600" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  How customers can reach you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input 
                            type="email"
                            placeholder="store@example.com"
                            className="pl-10"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Primary contact email for customer inquiries
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input 
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            className="pl-10"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Customer support phone number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="openTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opening Time</FormLabel>
                        <FormControl>
                          <Input 
                            type="time"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          When your store opens (24-hour format)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="closeTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Closing Time</FormLabel>
                        <FormControl>
                          <Input 
                            type="time"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          When your store closes (24-hour format)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Store Address Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-red-600" />
                  Store Address
                </CardTitle>
                <CardDescription>
                  Physical location details (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123 Main Street"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="New York"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="NY"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP/Postal Code</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="10001"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <Button 
                type="submit" 
                disabled={isUpdating || form.formState.isSubmitting}
                className="px-8"
              >
                {(isUpdating || form.formState.isSubmitting) ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Store Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default StoreSettingsPage;