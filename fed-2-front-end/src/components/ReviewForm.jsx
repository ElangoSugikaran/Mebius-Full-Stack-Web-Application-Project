import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Star, Loader2 } from 'lucide-react';

const ReviewForm = ({ productId, onReviewSubmitted, isVisible, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    comment: '',
    userName: '',
    rating: 0
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Review title is required';
    }
    
    if (!formData.comment.trim()) {
      newErrors.comment = 'Review comment is required';
    }
    
    if (!formData.userName.trim()) {
      newErrors.userName = 'Your name is required';
    }
    
    if (formData.rating === 0) {
      newErrors.rating = 'Please select a rating';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:8000/api/reviews/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          productId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      const newReview = await response.json();
      
      // Reset form
      setFormData({
        title: '',
        comment: '',
        userName: '',
        rating: 0
      });
      setErrors({});
      
      // Notify parent component
      onReviewSubmitted(newReview);
      
      // Show success message
      alert('Review submitted successfully!');
      
      // Close form
      onClose();
      
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const renderStars = () => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= (hoveredRating || formData.rating);
      
      return (
        <button
          key={index}
          type="button"
          onClick={() => handleInputChange('rating', starValue)}
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
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
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
          <div className="space-y-4">
            {/* Rating */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1">
                {renderStars()}
                <span className="ml-2 text-sm text-gray-600">
                  {formData.rating > 0 ? `${formData.rating}/5` : 'Select rating'}
                </span>
              </div>
              {errors.rating && (
                <p className="text-red-500 text-sm">{errors.rating}</p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="userName" className="text-sm font-medium">
                Your Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="userName"
                type="text"
                placeholder="Enter your name"
                value={formData.userName}
                onChange={(e) => handleInputChange('userName', e.target.value)}
                className={errors.userName ? 'border-red-500' : ''}
              />
              {errors.userName && (
                <p className="text-red-500 text-sm">{errors.userName}</p>
              )}
            </div>

            {/* Review Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Review Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                type="text"
                placeholder="Summarize your review in a few words"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title}</p>
              )}
            </div>

            {/* Review Comment */}
            <div className="space-y-2">
              <label htmlFor="comment" className="text-sm font-medium">
                Review <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="comment"
                placeholder="Tell others about your experience with this product..."
                rows={4}
                value={formData.comment}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                className={errors.comment ? 'border-red-500' : ''}
              />
              {errors.comment && (
                <p className="text-red-500 text-sm">{errors.comment}</p>
              )}
            </div>

            {/* Submit Button */}
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
                type="button"
                className="flex-1"
                disabled={isSubmitting}
                onClick={handleSubmit}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewForm;