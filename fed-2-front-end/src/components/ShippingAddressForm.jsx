// 🔧 FIXED: ShippingAddressForm.jsx - Simplified for checkout flow
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// 🔧 FIXED: Schema matches what we actually need
const shippingAddressFormSchema = z.object({
  line1: z.string().min(1, "Address line 1 is required").max(100),
  line2: z.string().max(100).optional().or(z.literal("")),
  city: z.string().min(1, "City is required").max(50),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(15),
});

const ShippingAddressForm = ({ onSubmit }) => {
  // Initialize the form with validation schema
  const form = useForm({
    resolver: zodResolver(shippingAddressFormSchema),
    defaultValues: {
      line1: "",
      line2: "",
      city: "",
      phone: "",
    },
  });

  // 🔧 FIXED: Only handle form submission - don't create order here
  // The CheckoutPage will handle order creation
  async function handleSubmit(values) {
    try {
      console.log("📋 Form submitted with values:", values);
      
      // 🔧 FIXED: Just call the parent callback with form data
      if (onSubmit) {
        onSubmit(values);
      }
      
      // Show success message (optional)
      console.log("✅ Address information saved");
      
    } catch (error) {
      console.error("❌ Form submission error:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="line1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line 1 *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your street address" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="line2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line 2 (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Apartment, suite, unit, building, floor, etc." 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your city" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number *</FormLabel>
              <FormControl>
                <Input 
                  type="tel"
                  placeholder="Enter your phone number" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">
          Save Address Information
        </Button>
      </form>
    </Form>
  );
};

export default ShippingAddressForm;