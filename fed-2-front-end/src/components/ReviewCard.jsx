// components/ReviewCard.jsx
import { Star } from "lucide-react";

const ReviewCard = ({ review }) => {
  // Format date to readable format
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{review.userName || "Anonymous"}</h4>
          <div className="flex items-center gap-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < review.rating 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-sm text-gray-600 ml-2">{review.rating}/5</span>
          </div>
        </div>
        <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
      </div>
      
      <div>
        <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
        <p className="text-gray-600 text-sm">{review.comment}</p>
      </div>
      
      {review.verified && (
        <div className="mt-3 flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800">Verified Purchase</Badge>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;