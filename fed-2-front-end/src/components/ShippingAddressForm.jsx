import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateOrderMutation } from "@/lib/api";
import { useSelector } from "react-redux";

import {zodResolver} from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { map, z } from "zod";


 // Define the schema for the form validation
  const shippingAddressFormSchema = z.object({
    line1: z.string().min(1).max(50),
    line2: z.string().min(1).max(50),
    city: z.string().min(1).max(50),
    phone: z.string().min(2).max(15),
  });

const ShippingAddressForm = () => {

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

  const cart = useSelector((state) => state.cart.cartItems);
  const [createOrder, {isLoading}] = useCreateOrderMutation();
  console.log(cart);

  async function onSubmit(values) {
    try {
      await createOrder({ 
        shippingAddress: values,
        orderItems: cart.map(
          (item) => ({
            productId: item.product._id,
            quantity: item.quantity
          })
        ),
      }).unwrap();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="line1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line 1</FormLabel>
              <FormControl>
                <Input placeholder="Enter address line 1" {...field} />
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
              <FormLabel>Address Line 2</FormLabel>
              <FormControl>
                <Input placeholder="Enter address line 2" {...field} />
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
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="Enter city" {...field} />
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
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="Enter phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );

};


export default ShippingAddressForm;