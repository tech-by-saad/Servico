import { Link } from 'react-router-dom';

const ServiceCard = ({ service }) => {
  return (
    <Link 
      to={`/service/${service._id}`} 
      className="group block rounded-lg overflow-hidden shadow-md transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      <div className="relative h-52 w-full">
        <img
          src={`${import.meta.env.VITE_API_BASE_URL}${service.imageUrl}`}
          alt={service.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="text-xl font-bold text-white">
            {service.name}
          </h3>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;