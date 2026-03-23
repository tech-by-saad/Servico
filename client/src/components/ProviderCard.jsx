import { Link } from 'react-router-dom';
import StarRating from './StarRating';

const ProviderCard = ({ profile, onBook, isCurrentUser }) => {
  // Safety check to prevent crashes if data is missing
  if (!profile || !profile.user) {
    return null;
  }

  return (
    <div className="card flex flex-col sm:flex-row justify-between sm:items-center gap-4">
      <div className="flex-grow">
        <Link to={`/provider/${profile.user._id}`} className="flex items-center gap-4 group">
          <img 
            src={profile.user.profilePicture?.startsWith('https://') ? profile.user.profilePicture : `${import.meta.env.VITE_API_BASE_URL}${profile.user.profilePicture}`} 
            alt={profile.user.name}
            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
          />
          <div>
            <h3 className="text-lg font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400">{profile.user.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <StarRating rating={profile.averageRating} />
              <span>({profile.numReviews} reviews)</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{profile.experience} years of experience</p>
          </div>
        </Link>
      </div>
      <div className="flex-shrink-0 w-full sm:w-auto text-center sm:text-right">
        <p className="font-bold text-lg text-gray-800 dark:text-white">₹{profile.price}</p>
        
        {/* --- THIS IS THE LOGIC THAT SHOWS THE CORRECT BUTTON --- */}
        {isCurrentUser ? (
          <button 
            className="bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 font-bold py-2 px-6 rounded-lg cursor-not-allowed w-full mt-2" 
            disabled
          >
            This is You
          </button>
        ) : (
          <button 
            onClick={() => onBook(profile)} 
            className="btn-primary w-full mt-2"
          >
            Book Now
          </button>
        )}
      </div>
    </div>
  );
};

export default ProviderCard;