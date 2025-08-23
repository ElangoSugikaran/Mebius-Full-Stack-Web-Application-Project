import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from 'react';
import { Save, CreditCard, DollarSign, Truck, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useGetPaymentSettingsQuery, useUpdatePaymentSettingsMutation } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// VALIDATION SCHEMA - Updated to match backend expectations
const paymentSettingsSchema = z.object({
  stripe: z.object({
    enabled: z.boolean().default(true)
  }),
  cashOnDelivery: z.object({
    enabled: z.boolean().default(true)
  }),
  currency: z.object({
    code: z.string()
      .length(3, "Currency code must be exactly 3 characters")
      .regex(/^[A-Z]{3}$/, "Currency code must be uppercase letters"),
    symbol: z.string()
      .min(1, "Currency symbol is required")
      .max(3, "Currency symbol cannot exceed 3 characters")
  })
});

const PaymentSettingsPage = () => {
  const { 
    data: paymentSettings, 
    isLoading, 
    error, 
    refetch 
  } = useGetPaymentSettingsQuery();
  
  const [
    updatePaymentSettings, 
    { 
      isLoading: isUpdating, 
      error: updateError 
    }
  ] = useUpdatePaymentSettingsMutation();

  // FORM SETUP
  const form = useForm({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      stripe: {
        enabled: true
      },
      cashOnDelivery: {
        enabled: true
      },
      currency: {
        code: 'USD',
        symbol: '$'
      }
    }
  });

  // Load payment settings data when available
  useEffect(() => {
    if (paymentSettings) {
      console.log('📥 Loading payment settings data:', paymentSettings);
      
      form.reset({
        stripe: {
          enabled: paymentSettings.stripe?.enabled ?? true
        },
        cashOnDelivery: {
          enabled: paymentSettings.cashOnDelivery?.enabled ?? true
        },
        currency: {
          code: paymentSettings.currency?.code || 'USD',
          symbol: paymentSettings.currency?.symbol || '$'
        }
      });
    }
  }, [paymentSettings, form]);

  const onSubmit = async (values) => {
    try {
      console.log('📤 Submitting payment settings:', values);
      
      const result = await updatePaymentSettings(values).unwrap();
      
      console.log('✅ Payment settings updated successfully:', result);
      toast.success('Payment Settings Saved Successfully!', {
        position: "top-right",
        autoClose: 3000
      });
      
      // Optionally refetch to ensure UI is in sync
      refetch();
      
    } catch (error) {
      console.error('❌ Failed to save payment settings:', error);
      
      // Extract error message
      let errorMessage = 'Failed to Save Payment Settings. Please try again.';
      
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

  const currencyOptions = [
    { code: 'USD', name: 'USD - US Dollar', symbol: '$' },
    { code: 'EUR', name: 'EUR - Euro', symbol: '€' },
    { code: 'GBP', name: 'GBP - British Pound', symbol: '£' },
    { code: 'CAD', name: 'CAD - Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'AUD - Australian Dollar', symbol: 'A$' },
    { code: 'INR', name: 'INR - Indian Rupee', symbol: '₹' },
    { code: 'JPY', name: 'JPY - Japanese Yen', symbol: '¥' },
    { code: 'CHF', name: 'CHF - Swiss Franc', symbol: 'CHF' },
    { code: 'CNY', name: 'CNY - Chinese Yuan', symbol: '¥' },
  ];

  const handleCurrencyChange = (currencyCode) => {
    const selectedCurrency = currencyOptions.find(curr => curr.code === currencyCode);
    if (selectedCurrency) {
      form.setValue('currency.code', selectedCurrency.code);
      form.setValue('currency.symbol', selectedCurrency.symbol);
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
              <span className="text-lg text-gray-600">Loading payment settings...</span>
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
              Failed to load payment settings: {error?.data?.message || error?.message || 'Unknown error'}
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
                <CreditCard className="mr-3 h-8 w-8 text-green-600" />
                Payment Settings
              </h1>
              <p className="text-gray-600 mt-2">
                Configure payment methods and currency settings
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
            
            {/* Payment Methods Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-blue-600" />
                  Payment Methods
                </CardTitle>
                <CardDescription>
                  Choose how customers can pay for orders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Stripe Settings */}
                <div className="border rounded-lg p-4">
                  <FormField
                    control={form.control}
                    name="stripe.enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-medium">Stripe Payment</FormLabel>
                            <FormDescription>Accept credit/debit cards online securely</FormDescription>
                          </div>
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
                  
                  {form.watch("stripe.enabled") && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>✅ Stripe Enabled:</strong> Customers can pay with credit/debit cards. 
                        Stripe handles secure payment processing for you.
                      </p>
                    </div>
                  )}
                </div>

                {/* Cash on Delivery Settings */}
                <div className="border rounded-lg p-4">
                  <FormField
                    control={form.control}
                    name="cashOnDelivery.enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Truck className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-medium">Cash on Delivery</FormLabel>
                            <FormDescription>Accept cash payments when delivering orders</FormDescription>
                          </div>
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
                  
                  {form.watch("cashOnDelivery.enabled") && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800">
                        <strong>✅ Cash on Delivery Enabled:</strong> Customers can pay when they receive their order. 
                        Great for building trust with new customers.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Currency Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5 text-green-600" />
                  Currency Settings
                </CardTitle>
                <CardDescription>
                  Set your store's default currency for displaying prices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="currency.code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Currency</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleCurrencyChange(value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {currencyOptions.map((currency) => (
                              <SelectItem key={currency.code} value={currency.code}>
                                <div className="flex items-center space-x-2">
                                  <span>{currency.symbol}</span>
                                  <span>{currency.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          This currency will be used throughout your store
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="currency.symbol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency Symbol</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="$"
                            maxLength={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Symbol displayed with prices (e.g., $, €, £)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Currency Preview */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <div className="text-lg font-semibold">
                    Price: {form.watch("currency.symbol")}99.99
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info Card about Tax and Shipping */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-900 mb-2">💡 Additional Features</h3>
                    <div className="space-y-2 text-sm text-blue-800">
                      <p>
                        <strong>Tax Calculations:</strong> Currently disabled to keep things simple. 
                        Contact your developer when you need to add tax rates.
                      </p>
                      <p>
                        <strong>Shipping Costs:</strong> Not configured yet. 
                        You can manually add shipping costs to product prices for now.
                      </p>
                      <p>
                        <strong>Multiple Currencies:</strong> Coming soon! 
                        Currently, one currency is supported per store.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods Status Summary */}
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="pt-6">
                <h3 className="font-medium text-gray-900 mb-3">📋 Current Payment Methods Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Stripe (Online Cards)</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      form.watch("stripe.enabled") 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {form.watch("stripe.enabled") ? "✅ Enabled" : "❌ Disabled"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Cash on Delivery</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      form.watch("cashOnDelivery.enabled") 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {form.watch("cashOnDelivery.enabled") ? "✅ Enabled" : "❌ Disabled"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Store Currency</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      {form.watch("currency.symbol")} {form.watch("currency.code")}
                    </span>
                  </div>
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
                    Save Payment Settings
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

export default PaymentSettingsPage;