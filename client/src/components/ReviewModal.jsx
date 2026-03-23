import { useState } from 'react';
import { toast } from 'react-hot-toast';

const StarRatingInput = ({ rating, setRating }) => {
  return (
    <div className="flex justify-center space-x-1">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <label key={ratingValue}>
            <input
              type="radio"
              name="rating"
              value={ratingValue}
              onClick={() => setRating(ratingValue)}
              className="hidden"
            />
            <svg
              className={`w-10 h-10 cursor-pointer ${ratingValue <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </label>
        );
      })}
    </div>
  );
};

const ReviewModal = ({ isOpen, onClose, onSubmit, booking }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment.trim() === '') {
      return toast.error('Please leave a comment.');
    }
    setIsSubmitting(true);
    await onSubmit({ bookingId: booking._id, rating, comment });
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all" role="dialog">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Leave a Review</h2>
            <p className="text-gray-500 text-sm mt-1">How was your experience with the service?</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div>
            <label className="block text-md font-semibold text-gray-700 mb-2 text-center">Your Rating</label>
            <StarRatingInput rating={rating} setRating={setRating} />
          </div>
          
          <div>
            <label htmlFor="comment" className="block text-md font-semibold text-gray-700">Your Comments</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details of your own experience..."
              className="w-full p-3 mt-1 border rounded-lg h-32"
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;