import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from 'react';
import { Save, CreditCard, DollarSign, Percent, Truck } from 'lucide-react';
import { toast } from 'react-toastify';
import { useGetSettingsQuery, useUpdatePaymentSettingsMutation } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

// VALIDATION SCHEMA
const paymentSettingsSchema = z.object({
  stripe: z.object({
    enabled: z.boolean().default(true),
    publicKey: z.string().optional(),
    secretKey: z.string().optional(),
  }),
  cashOnDelivery: z.object({
    enabled: z.boolean().default(true),
  }),
  currency: z.object({
    code: z.string().min(3, "Currency code is required"),
    symbol: z.string().min(1, "Currency symbol is required"),
  }),
  tax: z.object({
    enabled: z.boolean().default(true),
    rate: z.number().min(0, "Tax rate cannot be negative").max(50, "Tax rate cannot exceed 50%"),
    name: z.string().min(1, "Tax name is required"),
  }),
});

const PaymentSettingsPage = () => {
  const { data: settings, isLoading, error } = useGetSettingsQuery();
  const [updatePaymentSettings] = useUpdatePaymentSettingsMutation();

  // FORM SETUP
  const form = useForm({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      stripe: {
        enabled: true,
        publicKey: '',
        secretKey: ''
      },
      cashOnDelivery: {
        enabled: true
      },
      currency: {
        code: 'USD',
        symbol: '$'
      },
      tax: {
        enabled: false,
        rate: 0,
        name: 'Sales Tax'
      }
    }
  });

  useEffect(() => {
    if (settings?.payment) {
      form.reset(settings.payment);
    }
  }, [settings, form]);

  const onSubmit = async (values) => {
    try {
      await updatePaymentSettings(values).unwrap();
      toast.success('✅ Payment Settings Saved Successfully!');
    } catch (error) {
      console.error('Failed to save payment settings:', error);
      toast.error('❌ Failed to Save Payment Settings\nPlease try again.');
    }
  };

  const currencyOptions = [
    { code: 'USD', name: 'USD - US Dollar', symbol: '$' },
    { code: 'EUR', name: 'EUR - Euro', symbol: '€' },
    { code: 'GBP', name: 'GBP - British Pound', symbol: '£' },
    { code: 'CAD', name: 'CAD - Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'AUD - Australian Dollar', symbol: 'A$' },
    { code: 'INR', name: 'INR - Indian Rupee', symbol: '₹' },
  ];

  const handleCurrencyChange = (currencyCode) => {
    const selectedCurrency = currencyOptions.find(curr => curr.code === currencyCode);
    if (selectedCurrency) {
      form.setValue('currency.code', selectedCurrency.code);
      form.setValue('currency.symbol', selectedCurrency.symbol);
    }
  };

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
                  Configure how customers can pay for orders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Stripe Settings */}
                <div className="border rounded-lg p-4">
                  <FormField
                    control={form.control}
                    name="stripe.enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-medium">Stripe</FormLabel>
                            <FormDescription>Accept credit/debit cards</FormDescription>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="stripe.publicKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stripe Public Key</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="pk_live_..." 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="stripe.secretKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stripe Secret Key</FormLabel>
                            <FormControl>
                              <Input 
                                type="password"
                                placeholder="sk_live_..." 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Cash on Delivery Settings */}
                <div className="border rounded-lg p-4">
                  <FormField
                    control={form.control}
                    name="cashOnDelivery.enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Truck className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-medium">Cash on Delivery</FormLabel>
                            <FormDescription>Accept cash payments on delivery</FormDescription>
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
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800">
                        <strong>Note:</strong> Cash on Delivery allows customers to pay when they receive their order. 
                        Make sure your delivery team is equipped to handle cash transactions.
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
                  Set your store's default currency
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
                                {currency.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tax Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Percent className="mr-2 h-5 w-5 text-orange-600" />
                  Tax Settings
                </CardTitle>
                <CardDescription>
                  Configure tax calculation for your store
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <FormField
                  control={form.control}
                  name="tax.enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Tax Calculation</FormLabel>
                        <FormDescription>
                          Automatically calculate tax on orders
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
                
                {form.watch("tax.enabled") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tax.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Sales Tax"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Display name for tax on invoices
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="tax.rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax Rate (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="8.5"
                              step="0.1"
                              min="0"
                              max="50"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            Percentage rate to apply to orders
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting}
                className="px-8"
              >
                {form.formState.isSubmitting ? (
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