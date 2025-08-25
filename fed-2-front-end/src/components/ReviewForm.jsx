import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useCreateReviewMutation } from '../lib/api';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Schema validation
const reviewFormSchema = z.object({
  title: z.string()
    .min(3, "Review title must be at least 3 characters")
    .max(100, "Review title cannot exceed 100 characters"),
  comment: z.string()
    .min(10, "Review must be at least 10 characters")
    .max(500, "Review cannot exceed 500 characters"),
  userName: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  rating: z.number()
    .min(1, "Please select a rating")
    .max(5, "Rating cannot exceed 5 stars"),
});

const ReviewForm = ({ productId, onReviewSubmitted, isVisible, onClose }) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [createReview, { isLoading: isSubmitting }] = useCreateReviewMutation(); // Add this hook

  // Form setup with react-hook-form
  const form = useForm({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      title: '',
      comment: '',
      userName: '',
      rating: 0
    }
  });

  // ✅ FIXED: Submit handler using RTK Query mutation
  const onSubmit = async (values) => {
    try {
      // Get Clerk user ID
      const clerk = window.Clerk;
      let userId = null;
      
      if (clerk && clerk.user) {
        userId = clerk.user.id;
      }

      const newReview = await createReview({
        ...values,
        productId,
        userId // This will now be passed to the backend
      }).unwrap();
      
      // Reset form
      form.reset({
        title: '',
        comment: '',
        userName: '',
        rating: 0
      });
      
      // Notify parent component
      onReviewSubmitted(newReview);
      
      // Show success toast
      toast.success('🎉 Review submitted successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Close form
      onClose();
      
    } catch (error) {
      console.error('Error submitting review:', error);
      
      toast.error('❌ Failed to submit review. Please try again.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };


  // Star rating component
  const renderStars = () => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= (hoveredRating || form.watch("rating"));
      
      return (
        <button
          key={index}
          type="button"
          onClick={() => form.setValue('rating', starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          className="p-1 transition-colors"
        >
          <Star
            className={`h-6 w-6 transition-colors ${
              isActive 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300 hover:text-yellow-200'
            }`}
          />
        </button>
      );
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border-0">
        <CardHeader className="bg-white">
          <div className="flex items-center justify-between">
            <CardTitle>Write a Review</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-8 h-8 p-0"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Rating Field */}
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Rating <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-1">
                        {renderStars()}
                        <span className="ml-2 text-sm text-gray-600">
                          {field.value > 0 ? `${field.value}/5` : 'Select rating'}
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Name Field */}
              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Your Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Title Field */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Review Title <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Summarize your review in a few words"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Comment Field */}
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Review <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell others about your experience with this product..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewForm;