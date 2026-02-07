import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import { RiCompassDiscoverFill, RiShieldStarLine, RiMapPinUserLine, RiCustomerService2Line, RiMailSendLine, RiCheckLine, RiCloseLine } from "react-icons/ri";
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import './Home.css';

function Home() {
  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState({ type: '', text: '' });

  // Handle newsletter subscription
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!newsletterEmail) {
      setNewsletterMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    setNewsletterLoading(true);
    setNewsletterMessage({ type: '', text: '' });

    try {
      const response = await fetch('http://localhost:5000/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setNewsletterMessage({ type: 'success', text: data.message });
        setNewsletterEmail('');
      } else {
        setNewsletterMessage({ type: 'error', text: data.message || 'Failed to subscribe' });
      }
    } catch (error) {
      console.error('Newsletter error:', error);
      setNewsletterMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setNewsletterLoading(false);
    }
  };

  const features = [
    {
      icon: <RiShieldStarLine size={40} className="feature-icon" />,
      title: "Trusted & Safe",
      desc: "We ensure your journey is safe, secure, and fully insured. Travel with peace of mind."
    },
    {
      icon: <RiMapPinUserLine size={40} className="feature-icon" />,
      title: "Handpicked Locations",
      desc: "Our experts curate the most breathtaking and unique destinations for you."
    },
    {
      icon: <RiCustomerService2Line size={40} className="feature-icon" />,
      title: "24/7 Support",
      desc: "Our dedicated team is available round the clock to assist you anywhere, anytime."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Adventure Traveler",
      quote: "Yoliday made my dream trip to Bali a reality. Seamless booking and amazing support!",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    {
      name: "Michael Chen",
      role: "Photographer",
      quote: "The curated destinations are truly hidden gems. I got the best shots of my life.",
      image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150"
    }
  ];

  return (
    <div className="home-wrapper">
      {/* 1. HERO SECTION WITH CAROUSEL */}
      <section className="hero-section">
        <Carousel 
          autoPlay 
          infiniteLoop 
          showThumbs={false} 
          showStatus={false}
          showIndicators={true}
          interval={5000} 
          transitionTime={1000}
          className="hero-carousel"
          stopOnHover={false}
          swipeable={true}
          emulateTouch={true}
          renderIndicator={(onClickHandler, isSelected, index, label) => {
            const defStyle = {
              marginLeft: 5,
              marginRight: 5,
              cursor: 'pointer',
              display: 'inline-block',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: isSelected ? 'white' : 'rgba(255, 255, 255, 0.5)',
              transition: 'all 0.3s ease',
              border: '2px solid white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            };
            return (
              <span
                style={defStyle}
                onClick={onClickHandler}
                onKeyDown={onClickHandler}
                key={index}
                role="button"
                tabIndex={0}
                aria-label={`${label} ${index + 1}`}
              />
            );
          }}
        >
          <div className="hero-slide">
            <img
              src="https://images.pexels.com/photos/1450372/pexels-photo-1450372.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080"
              alt="Tropical Beach Paradise"
              className="hero-image"
            />
          </div>
          <div className="hero-slide">
            <img
              src="https://images.pexels.com/photos/9470504/pexels-photo-9470504.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080"
              alt="Mountain Adventure"
              className="hero-image"
            />
          </div>
          <div className="hero-slide">
            <img
              src="https://images.pexels.com/photos/3601453/pexels-photo-3601453.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080"
              alt="Desert Sunset"
              className="hero-image"
            />
          </div>
        </Carousel>
        
        {/* Hero Overlay Content */}
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="hero-title animate-fade-in-up">
              Wander Often, <br />
              <span className="text-gradient">Wonder Always</span>
            </h1>
            <p className="hero-description animate-fade-in-up delay-1">
              Life is short — <strong>travel often</strong>. Unlock hidden gems, chase sunsets, and create memories that last forever. Your next adventure starts here.
            </p>
            <Link to="/Destination">
              <button className="hero-btn animate-fade-in-up delay-2">
                <RiCompassDiscoverFill size={22} />
                <span>Explore Destinations</span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. WHY CHOOSE US */}
      <section className="section-container">
        <div className="section-header">
          <h2 className="section-title-md">Why Choose Yoliday?</h2>
          <p className="section-subtitle">We make your travel experience unforgettable.</p>
        </div>
        <div className="features-grid">
          {features.map((item, index) => (
            <div key={index} className="feature-card glass-panel">
              <div className="icon-wrapper">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. POPULAR DESTINATIONS PREVIEW */}
      <section className="section-container bg-soft">
        <div className="section-header">
          <h2 className="section-title-md">Popular Destinations</h2>
          <p className="section-subtitle">Top rated spots by our community.</p>
        </div>
        <div className="preview-grid">
           <div className="preview-card glass-panel">
             <img src="https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Maldives Ocean View" />
             <div className="preview-info">
               <h3>Maldives</h3>
               <p className="preview-desc">Crystal clear waters & white sand</p>
               <Link to="/Destination" className="preview-link">View Details →</Link>
             </div>
           </div>
           <div className="preview-card glass-panel">
             <img src="https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Swiss Alps Mountains" />
             <div className="preview-info">
               <h3>Swiss Alps</h3>
               <p className="preview-desc">Majestic peaks & scenic trails</p>
               <Link to="/Destination" className="preview-link">View Details →</Link>
             </div>
           </div>
           <div className="preview-card glass-panel">
             <img src="https://images.pexels.com/photos/532561/pexels-photo-532561.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Kyoto Japan Temple" />
             <div className="preview-info">
               <h3>Kyoto, Japan</h3>
               <p className="preview-desc">Ancient temples & cherry blossoms</p>
               <Link to="/Destination" className="preview-link">View Details →</Link>
             </div>
           </div>
        </div>
      </section>

      {/* 4. TESTIMONIALS */}
      <section className="section-container">
        <div className="section-header">
          <h2 className="section-title-md">What Travelers Say</h2>
          <p className="section-subtitle">Real experiences from real travelers</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card glass-panel">
              <p className="quote">"{t.quote}"</p>
              <div className="user-profile">
                <img src={t.image} alt={t.name} />
                <div>
                  <h4>{t.name}</h4>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. NEWSLETTER */}
      <section className="newsletter-section">
        <div className="newsletter-content glass-panel">
          <RiMailSendLine size={50} className="newsletter-icon" />
          <h2>Subscribe to our Newsletter</h2>
          <p>Get the latest travel deals and updates directly to your inbox.</p>
          
          {/* Success/Error Message */}
          {newsletterMessage.text && (
            <div className={`newsletter-message ${newsletterMessage.type}`}>
              {newsletterMessage.type === 'success' ? (
                <RiCheckLine size={20} />
              ) : (
                <RiCloseLine size={20} />
              )}
              <span>{newsletterMessage.text}</span>
            </div>
          )}
          
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              required
              aria-label="Email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              disabled={newsletterLoading}
            />
            <button type="submit" disabled={newsletterLoading}>
              {newsletterLoading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Home;
