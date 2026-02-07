import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaClock, FaRupeeSign, FaStar } from 'react-icons/fa';
import './Destination.css';

function Destination() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const destinations = [
    { 
      img: "https://static.toiimg.com/photo/63282406.cms", 
      title: "Taj Mahal", 
      price: 5000, 
      duration: "1 day", 
      location: "Agra",
      category: "monument",
      rating: 4.9
    },
    { 
      img: "https://res.cloudinary.com/rainforest-cruises/images/c_fill,g_auto/f_auto,q_auto/v1661186647/top-10-tourist-attractions-in-india-harmandir-sahib/top-10-tourist-attractions-in-india-harmandir-sahib-1120x732.jpg", 
      title: "Harmandir Sahib", 
      price: 1500, 
      duration: "1 day", 
      location: "Amritsar",
      category: "religious",
      rating: 4.8
    },
    { 
      img: "https://res.cloudinary.com/rainforest-cruises/images/c_fill,g_auto/f_auto,q_auto/v1661186675/top-10-tourist-attractions-in-indiaa-gateway-of-india/top-10-tourist-attractions-in-indiaa-gateway-of-india-1120x732.jpg", 
      title: "Gateway of India", 
      price: 1200, 
      duration: "1 day", 
      location: "Mumbai",
      category: "monument",
      rating: 4.6
    },
    { 
      img: "https://res.cloudinary.com/rainforest-cruises/images/c_fill,g_auto/f_auto,q_auto/v1661186654/top-10-tourist-attractions-in-india-manikarnika-ghat/top-10-tourist-attractions-in-india-manikarnika-ghat-1120x732.jpg", 
      title: "Manikarnika Ghat", 
      price: 800, 
      duration: "1 day", 
      location: "Varanasi",
      category: "religious",
      rating: 4.5
    },
    { 
      img: "https://static.investindia.gov.in/s3fs-public/2023-06/1.jpg", 
      title: "Unveiling India", 
      price: 5000, 
      duration: "1 day", 
      location: "India",
      category: "cultural",
      rating: 4.7
    },
    { 
      img: "https://www.usnews.com/object/image/00000163-8d5b-d398-ad7f-8dfff5760000/3-eiffel-tower-getty.jpg?update-time=1527086483519&size=responsive640", 
      title: "Eiffel Tower", 
      price: 15000, 
      duration: "1 day", 
      location: "Paris",
      category: "monument",
      rating: 4.9
    },
    { 
      img: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/05/d6/a1/6b/buckingham-palace.jpg?w=800&h=500&s=1", 
      title: "Buckingham Palace", 
      price: 12000, 
      duration: "1 day", 
      location: "London",
      category: "cultural",
      rating: 4.7
    },
    { 
      img: "https://static.independent.co.uk/2024/08/30/14/newFile-1.jpg?quality=75&width=1368&crop=3%3A2%2Csmart&auto=webp", 
      title: "Sacré-Cœur", 
      price: 8000, 
      duration: "1 day", 
      location: "Paris",
      category: "religious",
      rating: 4.8
    },
    { 
      img: "https://i.pinimg.com/originals/82/1f/dd/821fdd831e2b1aea8a77a1c47114d419.jpg", 
      title: "Sydney Opera House", 
      price: 15000, 
      duration: "1 day", 
      location: "Sydney",
      category: "cultural",
      rating: 4.9
    },
    { 
      img: "https://th.bing.com/th/id/OIP.h8n-oldwOQb3qUu9gfsASAHaE4?w=283&h=187&c=7&r=0&o=5&dpr=1.3&pid=1.7", 
      title: "Colosseum", 
      price: 5000, 
      duration: "1 day", 
      location: "Rome",
      category: "monument",
      rating: 4.8
    },
    { 
      img: "https://th.bing.com/th/id/OIP.XkqF431xd5SUUIa1YzJoaAHaE8?w=261&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7", 
      title: "Coonoor", 
      price: 5000, 
      duration: "1 day", 
      location: "Tamil Nadu",
      category: "nature",
      rating: 4.6
    },
    { 
      img: "https://th.bing.com/th/id/OIP.wIRKfP8CSNoGuIFh9FpfnAHaE8?w=285&h=189&c=7&r=0&o=5&dpr=1.3&pid=1.7", 
      title: "Great Wall of China", 
      price: 12000, 
      duration: "1 day", 
      location: "Beijing",
      category: "monument",
      rating: 4.9
    },
    { 
      img: "https://th.bing.com/th/id/OIP.GrWEF4alrc4QSjkqd6I9dgHaD3?w=306&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7", 
      title: "Machu Picchu", 
      price: 10000, 
      duration: "1 day", 
      location: "Peru",
      category: "nature",
      rating: 4.9
    },
    { 
      img: "https://th.bing.com/th/id/OIP.M1KNz9aDY4K2G7pTF3wR3wHaEK?w=267&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7", 
      title: "Neuschwanstein Castle", 
      price: 14000, 
      duration: "1 day", 
      location: "Germany",
      category: "cultural",
      rating: 4.8
    },
    { 
      img: "https://th.bing.com/th/id/OIP.5WZhaZl4kztYhGaJnumP9gHaE9?w=277&h=185&c=7&r=0&o=5&dpr=1.3&pid=1.7", 
      title: "Bali", 
      price: 14000, 
      duration: "1 day", 
      location: "Indonesia",
      category: "nature",
      rating: 4.9
    },
  ];

  // Handle Book Now click - navigate to booking with destination data
  const handleBookNow = (destination) => {
    navigate('/Booking', { 
      state: { 
        selectedDestination: destination 
      } 
    });
  };

  return (
    <div className="destination-wrapper">
      {/* Hero Section */}
      <div className="destination-hero">
        <div className="hero-content-dest">
          <h1 className="hero-title-dest">
            Discover Your Next <span className="gradient-text">Adventure</span>
          </h1>
          <p className="hero-subtitle-dest">
            Explore handpicked destinations from around the world
          </p>
        </div>
      </div>

      {/* Destinations Grid */}
      <div className={`destinations-container ${isVisible ? 'visible' : ''}`}>
        {destinations.map((destination, index) => (
          <div
            key={index}
            className={`destination-card ${isVisible ? 'fade-in' : ''}`}
            style={{ animationDelay: `${index * 0.1}s` }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Popular Badge */}
            {destination.rating >= 4.8 && (
              <div className="popular-badge">
                <FaStar /> Popular
              </div>
            )}

            {/* Image Container */}
            <div className="image-container">
              <img 
                src={destination.img} 
                className="destination-image" 
                alt={destination.title}
                loading="lazy"
              />
            </div>

            {/* Card Body */}
            <div className="destination-body">
              <div className="destination-header">
                <h4 className="destination-title">{destination.title}</h4>
                <div className="rating">
                  <FaStar className="star-icon" />
                  <span>{destination.rating}</span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="destination-details-grid">
                <div className="detail-item">
                  <FaMapMarkerAlt className="detail-icon location" />
                  <span>{destination.location}</span>
                </div>
                <div className="detail-item">
                  <FaClock className="detail-icon duration" />
                  <span>{destination.duration}</span>
                </div>
                <div className="detail-item price-item">
                  <FaRupeeSign className="detail-icon price" />
                  <span className="price-text">
                    {destination.price.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Book Now Button */}
              <button 
                className="book-now-btn"
                onClick={() => handleBookNow(destination)}
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Destination;
