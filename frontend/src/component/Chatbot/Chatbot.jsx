import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiRobot2Fill, RiCloseLine, RiSendPlaneFill, RiMapPinLine } from 'react-icons/ri';
import { FaPlane, FaMountain, FaUmbrellaBeach, FaLandmark, FaPray } from 'react-icons/fa';
import { authenticatedFetch, isAuthenticated, refreshAccessToken } from '../../utils/authUtils';
import './Chatbot.css';

// Destination data for recommendations
const destinations = [
  { title: "Taj Mahal", price: 5000, location: "Agra", category: "monument", mood: ["romantic", "historic", "peaceful"], keywords: ["love", "monument", "wonder", "marble", "agra", "india"] },
  { title: "Harmandir Sahib", price: 1500, location: "Amritsar", category: "religious", mood: ["spiritual", "peaceful", "calm"], keywords: ["temple", "golden", "sikh", "spiritual", "prayer", "peace"] },
  { title: "Gateway of India", price: 1200, location: "Mumbai", category: "monument", mood: ["historic", "urban"], keywords: ["mumbai", "monument", "sea", "historic", "city"] },
  { title: "Manikarnika Ghat", price: 800, location: "Varanasi", category: "religious", mood: ["spiritual", "peaceful"], keywords: ["varanasi", "ganga", "spiritual", "holy", "river"] },
  { title: "Eiffel Tower", price: 15000, location: "Paris", category: "monument", mood: ["romantic", "adventure"], keywords: ["paris", "france", "romantic", "love", "europe", "tower"] },
  { title: "Buckingham Palace", price: 12000, location: "London", category: "cultural", mood: ["historic", "royal"], keywords: ["london", "uk", "royal", "queen", "palace", "historic"] },
  { title: "Sacré-Cœur", price: 8000, location: "Paris", category: "religious", mood: ["spiritual", "peaceful", "romantic"], keywords: ["paris", "church", "spiritual", "france", "beautiful"] },
  { title: "Sydney Opera House", price: 15000, location: "Sydney", category: "cultural", mood: ["artistic", "urban"], keywords: ["australia", "opera", "art", "modern", "sydney"] },
  { title: "Colosseum", price: 5000, location: "Rome", category: "monument", mood: ["historic", "adventure"], keywords: ["rome", "italy", "gladiator", "ancient", "historic"] },
  { title: "Coonoor", price: 5000, location: "Tamil Nadu", category: "nature", mood: ["peaceful", "relaxing", "nature"], keywords: ["hills", "tea", "nature", "peaceful", "green", "south india"] },
  { title: "Great Wall of China", price: 12000, location: "Beijing", category: "monument", mood: ["adventure", "historic"], keywords: ["china", "wall", "ancient", "hiking", "historic", "wonder"] },
  { title: "Machu Picchu", price: 10000, location: "Peru", category: "nature", mood: ["adventure", "mysterious"], keywords: ["peru", "inca", "mountains", "ancient", "hiking", "adventure"] },
  { title: "Neuschwanstein Castle", price: 14000, location: "Germany", category: "cultural", mood: ["romantic", "fairytale"], keywords: ["germany", "castle", "fairytale", "romantic", "disney", "beautiful"] },
  { title: "Bali", price: 14000, location: "Indonesia", category: "nature", mood: ["relaxing", "peaceful", "romantic", "adventure"], keywords: ["beach", "indonesia", "tropical", "relax", "honeymoon", "nature", "spa"] },
];

// Mood keywords mapping
const moodKeywords = {
  romantic: ["love", "romantic", "honeymoon", "couple", "anniversary", "partner", "valentine"],
  adventure: ["adventure", "exciting", "thrill", "explore", "hiking", "trekking", "adrenaline"],
  peaceful: ["peace", "peaceful", "calm", "quiet", "relax", "meditation", "serene", "tranquil"],
  spiritual: ["spiritual", "temple", "church", "prayer", "holy", "religious", "divine", "sacred"],
  nature: ["nature", "green", "mountains", "beach", "forest", "hills", "natural", "scenic"],
  historic: ["history", "historic", "ancient", "old", "heritage", "monument", "ruins"],
  relaxing: ["relax", "relaxing", "vacation", "holiday", "rest", "chill", "spa", "unwind"],
  cultural: ["culture", "cultural", "art", "museum", "traditional", "local", "authentic"]
};

// Chatbot responses - comprehensive conversational patterns
const responses = {
  greeting: [
    "Hello! 👋 I'm Yoli, your AI travel companion! How can I help you today?",
    "Hi there! ✈️ Welcome to Yoliday! Ask me about destinations, flights, or deals!",
    "Hey! 🌍 Ready for an adventure? I can help with travel planning, flights, and bookings!"
  ],
  casualChat: [
    "I'm doing great, thanks for asking! 😊 How about you? Planning any trips?",
    "All good here! ✨ I'm ready to help you find your dream destination. What are you looking for?",
    "Feeling travel-ready as always! 🌴 What kind of trip are you dreaming about?"
  ],
  askMood: [
    "How are you feeling? Are you looking for adventure, relaxation, or something romantic? 💭",
    "What's your mood? Tell me if you want something peaceful, exciting, or spiritual! 🤔",
    "What kind of experience are you looking for? I'll suggest the perfect destination! 🎯"
  ],
  notUnderstood: [
    "I'd love to help! Try asking me things like:\n• 'Best time to visit Bali'\n• 'Flights from Delhi to Maldives'\n• 'Any deals under 15000?'\n• 'I want a beach vacation'",
    "Not sure I got that! 🤔 Here's what I can do:\n✈️ Flight Search\n📅 Best Time to Visit\n💰 Deals & Discounts\n🌍 Destination Recommendations",
    "Let me help you better! Ask about:\n• Destinations (romantic, adventure, peaceful)\n• Flights & deals\n• Best time to travel"
  ],
  whatCanDo: [
    "🤖 **I'm Yoli, your AI Travel Assistant!**\n\nHere's what I can help with:\n\n🌍 **Destinations** - 'I want a beach vacation'\n📅 **Best Time** - 'When to visit Paris?'\n✈️ **Flights** - 'Flights Delhi to Bali'\n💰 **Deals** - 'Any deals under 15000?'\n📝 **Bookings** - Just select a destination!\n\nTry asking me anything! 🌟"
  ],
  askBooking: "Would you like me to book this destination for you? Just say 'yes' or 'book it'! 📝",
  askDetails: "Great choice! To complete your booking, I'll need some details. Please provide:\n\n1. Your full name\n2. Email address\n3. Contact number\n4. Number of days",
  bookingConfirmed: "🎉 Awesome! Your booking request has been submitted! You'll receive a confirmation email shortly. Have an amazing trip! ✈️",
  goodbye: ["Have a wonderful trip! 🌟 Come back anytime!", "Safe travels! ✈️ See you soon!", "Goodbye! 🌍 Happy exploring!"],
  thanks: [
    "You're welcome! 😊 Let me know if you need anything else!",
    "Happy to help! ✨ Any other travel questions?",
    "Anytime! 🌟 Feel free to ask about more destinations!"
  ]
};

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState(null);
  const [bookingStep, setBookingStep] = useState(null);
  const [bookingData, setBookingData] = useState({});
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
      addBotMessage(greeting);
    }
  }, [isOpen]);

  const addBotMessage = (text, destinations = null, isBookingPrompt = false) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text, 
        destinations,
        isBookingPrompt,
        timestamp: new Date() 
      }]);
      setIsTyping(false);
    }, 500 + Math.random() * 500);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { type: 'user', text, timestamp: new Date() }]);
  };

  // Detect mood from user input
  const detectMood = (text) => {
    const lowerText = text.toLowerCase();
    const detectedMoods = [];

    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          if (!detectedMoods.includes(mood)) {
            detectedMoods.push(mood);
          }
        }
      }
    }

    return detectedMoods;
  };

  // Find matching destinations based on mood
  const findDestinations = (text) => {
    const lowerText = text.toLowerCase();
    const moods = detectMood(text);
    
    let matches = [];

    // First, check for direct keyword matches
    destinations.forEach(dest => {
      let score = 0;
      
      // Check location/title match
      if (lowerText.includes(dest.title.toLowerCase()) || 
          lowerText.includes(dest.location.toLowerCase())) {
        score += 10;
      }

      // Check keyword matches
      dest.keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) score += 2;
      });

      // Check mood matches
      moods.forEach(mood => {
        if (dest.mood.includes(mood)) score += 3;
      });

      if (score > 0) {
        matches.push({ ...dest, score });
      }
    });

    // Sort by score and return top 3
    matches.sort((a, b) => b.score - a.score);
    return matches.slice(0, 3);
  };

  // Handle booking confirmation
  const handleBookingSubmit = async (destination, userData) => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        addBotMessage("To complete your booking, please log in first. Would you like me to take you to the login page? Type 'login' to go there.");
        return;
      }

      const bookingPayload = {
        fullname: userData.name,
        contact: userData.contact,
        email: userData.email,
        destination: destination.title,
        price: destination.price,
        days: parseInt(userData.days) || 1,
        totalCost: destination.price * (parseInt(userData.days) || 1)
      };

      // Use authenticatedFetch for automatic token refresh
      const response = await authenticatedFetch('http://localhost:5000/api/booking/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingPayload)
      });

      const data = await response.json();

      if (response.ok) {
        addBotMessage("🎉 Booking confirmed! A confirmation email has been sent to your registered email address. Have an amazing trip! ✈️");
        setCurrentSuggestion(null);
        setBookingStep(null);
        setBookingData({});
      } else if (response.status === 401) {
        // Token expired and couldn't refresh - prompt login
        addBotMessage("Your session has expired. Please log in again to complete your booking. Type 'login' to go to the login page.");
      } else if (data.code === 'DUPLICATE_BOOKING') {
        // User already has a booking for this destination
        addBotMessage(`⚠️ You already have a booking for ${destination.title}! You cannot book the same destination twice. Would you like to explore other destinations?`);
        setCurrentSuggestion(null);
        setBookingStep(null);
        setBookingData({});
      } else {
        addBotMessage(`Oops! ${data.message || 'Something went wrong with the booking.'} Please try again.`);
      }
    } catch (error) {
      console.error('Booking error:', error);
      if (error.message.includes('token') || error.message.includes('refresh')) {
        addBotMessage("Your session has expired. Please log in again. Type 'login' to go to the login page.");
      } else {
        addBotMessage("I couldn't complete the booking right now. Would you like to try the booking page instead?");
      }
    }
  };

  // Parse booking details from user input
  const parseBookingDetails = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const data = { ...bookingData };

    // Try to extract name
    const nameMatch = text.match(/(?:name[:\s]*)?([A-Za-z\s]{2,50})/i);
    if (nameMatch && !data.name) {
      data.name = nameMatch[1].trim();
    }

    // Try to extract email
    const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      data.email = emailMatch[1];
    }

    // Try to extract phone
    const phoneMatch = text.match(/(?:phone|contact|mobile)?[:\s]*([6-9]\d{9})/);
    if (phoneMatch) {
      data.contact = phoneMatch[1];
    }

    // Try to extract days
    const daysMatch = text.match(/(\d+)\s*(?:day|days)/i);
    if (daysMatch) {
      data.days = daysMatch[1];
    }

    return data;
  };

  // Handle send message
  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    addUserMessage(userText);
    setInput('');

    const lowerText = userText.toLowerCase();

    // Check for greetings
    if (/^(hi|hello|hey|hola|namaste|good morning|good evening|good afternoon)/i.test(lowerText)) {
      addBotMessage(responses.greeting[Math.floor(Math.random() * responses.greeting.length)]);
      return;
    }

    // Check for casual chat - "what's up", "how are you", etc
    if (/^(what'?s up|wassup|whats up|how are you|how's it going|how you doing|sup|hows it)/i.test(lowerText)) {
      addBotMessage(responses.casualChat[Math.floor(Math.random() * responses.casualChat.length)]);
      return;
    }

    // Check for "fine", "good", "okay" responses
    if (/^(i'?m fine|i'?m good|i'?m okay|fine|good|great|awesome|amazing|not bad|doing well)/i.test(lowerText)) {
      addBotMessage("That's great to hear! 😊 So, where would you like to travel? I can help with:\n\n✈️ Flight search\n🌍 Destination recommendations\n📅 Best time to visit\n💰 Deals & discounts\n\nJust ask me anything!");
      return;
    }

    // Check for thanks
    if (/^(thanks|thank you|thx|ty|thank)/i.test(lowerText)) {
      addBotMessage(responses.thanks[Math.floor(Math.random() * responses.thanks.length)]);
      return;
    }

    // Check for goodbye
    if (/^(bye|goodbye|see you|exit|quit|cya|later)/i.test(lowerText)) {
      addBotMessage(responses.goodbye[Math.floor(Math.random() * responses.goodbye.length)]);
      return;
    }

    // Handle "who are you", "what are you", "your name"
    if (/who are you|what are you|your name|tell me about you/i.test(lowerText)) {
      addBotMessage("🤖 I'm **Yoli**, your AI Travel Assistant!\n\nI work for Yoliday Travel, and I can help you with:\n• Finding perfect destinations\n• Checking best travel times\n• Searching flights\n• Finding deals\n\nHow can I help you today?");
      return;
    }

    // Handle "what can you do" / "help"
    if (/what can you|help me|capabilities|features|how to use|what do you do|commands/i.test(lowerText)) {
      addBotMessage(responses.whatCanDo[0]);
      return;
    }

    // Handle login request
    if (/^(login|sign in|signin)/i.test(lowerText)) {
      addBotMessage("Taking you to the login page... 🔐");
      setTimeout(() => {
        navigate('/login');
        setIsOpen(false);
      }, 1000);
      return;
    }

    // Handle booking flow
    if (bookingStep === 'awaiting_details') {
      const parsedData = parseBookingDetails(userText);
      setBookingData(parsedData);

      if (parsedData.name && parsedData.email && parsedData.contact && parsedData.days) {
        addBotMessage(`Perfect! Here's your booking summary:\n\n📍 Destination: ${currentSuggestion.title}\n👤 Name: ${parsedData.name}\n📧 Email: ${parsedData.email}\n📱 Contact: ${parsedData.contact}\n📅 Days: ${parsedData.days}\n💰 Total: ₹${(currentSuggestion.price * parseInt(parsedData.days)).toLocaleString('en-IN')}\n\nShall I confirm this booking? (yes/no)`);
        setBookingStep('confirm');
      } else {
        const missing = [];
        if (!parsedData.name) missing.push("name");
        if (!parsedData.email) missing.push("email");
        if (!parsedData.contact) missing.push("contact number");
        if (!parsedData.days) missing.push("number of days");
        addBotMessage(`I still need your ${missing.join(", ")}. Please provide these details.`);
      }
      return;
    }

    // Handle booking confirmation
    if (bookingStep === 'confirm') {
      if (/^(yes|confirm|book|proceed|ok|sure)/i.test(lowerText)) {
        handleBookingSubmit(currentSuggestion, bookingData);
      } else if (/^(no|cancel|stop|back)/i.test(lowerText)) {
        addBotMessage("No problem! Feel free to explore other destinations or ask me for more suggestions. 🌍");
        setBookingStep(null);
        setCurrentSuggestion(null);
        setBookingData({});
      } else {
        addBotMessage("Please confirm with 'yes' to proceed or 'no' to cancel.");
      }
      return;
    }

    // Check if user wants to book current suggestion
    if (currentSuggestion && /^(yes|book|sure|ok|proceed)/i.test(lowerText)) {
      addBotMessage(responses.askDetails);
      setBookingStep('awaiting_details');
      return;
    }

    // ===== AI TRAVEL ASSISTANT FEATURES =====
    
    // Handle "best time to visit" queries
    if (/when.*(?:best|good|ideal).*(?:visit|go|travel)|best time.*(?:to|for)/i.test(lowerText)) {
      const destMatch = lowerText.match(/(?:visit|go to|travel to|for)\s+(.+?)(?:\?|$|in\s)/i);
      const monthMatch = lowerText.match(/in\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i);
      
      if (destMatch) {
        const destination = destMatch[1].trim();
        const month = monthMatch ? monthMatch[1] : null;
        
        addBotMessage(`🔍 Checking the best time to visit ${destination}...`);
        
        try {
          const response = await fetch('http://localhost:5001/api/best-time', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ destination, month })
          });
          const data = await response.json();
          
          if (data.success) {
            let message = `🌍 **${data.destination}**\n\n`;
            message += `📅 **Best months:** ${data.best_months.join(', ')}\n`;
            message += `⚠️ **Avoid:** ${data.avoid_months.join(', ')}\n\n`;
            
            if (data.month_analysis) {
              const analysis = data.month_analysis;
              message += `**${analysis.month} Analysis:**\n`;
              message += `${analysis.weather.description}\n`;
              message += `💰 Prices: ${analysis.pricing.level} (~₹${analysis.pricing.estimated_price.toLocaleString()})\n`;
              message += `👥 ${analysis.crowds.description}\n\n`;
            }
            
            message += `💡 ${data.recommendation}`;
            addBotMessage(message);
          } else {
            addBotMessage(`I couldn't find information about ${destination}. Try another destination name!`);
          }
        } catch (error) {
          addBotMessage(`Sorry, the AI service isn't available right now. Please try again later.`);
        }
        return;
      }
    }

    // Handle flight search queries - only trigger when user specifies from/to
    // Must have explicit "from X to Y" pattern for flight searches
    const flightRouteMatch = lowerText.match(/(?:flight|flights|fly|flying).*from\s+(.+?)\s+to\s+(.+?)(?:\s+(?:on|in|for)|$)/i) ||
                             lowerText.match(/from\s+(.+?)\s+to\s+(.+?).*(?:flight|flights)/i);
    
    if (flightRouteMatch) {
      const dateMatch = lowerText.match(/(?:on|in|for)\s+(\w+\s+\d+|\d{4}-\d{2}-\d{2}|\w+)/i);
      
      const fromCity = flightRouteMatch[1].trim();
      const toCity = flightRouteMatch[2].trim();
      
      // Default to 30 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 30);
      const date = defaultDate.toISOString().split('T')[0];
      
      addBotMessage(`✈️ Searching flights from ${fromCity} to ${toCity}...`);
      
      try {
        const response = await fetch('http://localhost:5001/api/flights/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: fromCity, to: toCity, date })
        });
        const data = await response.json();
        
        if (data.success && data.flights.length > 0) {
          let message = `✈️ **${data.route}**\n📅 ${data.date}\n\n`;
          message += `Found ${data.flights.length} flights:\n\n`;
          
          data.flights.slice(0, 3).forEach((flight, i) => {
            const badges = [];
            if (flight.is_cheapest) badges.push('💰 CHEAPEST');
            if (flight.is_fastest) badges.push('⚡ FASTEST');
            
            message += `**${i + 1}. ${flight.airline}**\n`;
            message += `   ₹${flight.price.toLocaleString()} | ${flight.duration} | ${flight.stops} stops\n`;
            message += `   ${flight.departure} → ${flight.arrival}`;
            if (badges.length) message += ` ${badges.join(' ')}`;
            message += '\n\n';
          });
          
          message += `📈 ${data.price_trend.advice}\n`;
          if (data.booking_tip) message += `💡 ${data.booking_tip}`;
          
          addBotMessage(message);
        } else {
          addBotMessage(`Sorry, I couldn't find flights from ${fromCity} to ${toCity}. Please check the city names.`);
        }
      } catch (error) {
        addBotMessage(`Flight search service is unavailable. Please try again later.`);
      }
      return;
    }

    // Handle deals queries - be specific, don't match "budget vacation" etc.
    // Only trigger on explicit deal/discount requests like "any deals?" or "show me deals"
    if (/(?:show|find|get|any|search|looking for).*(?:deal|deals|offer|offers|discount|discounts)|(?:deal|deals|offer|offers|discount).*(?:available|now|today)?$/i.test(lowerText)) {
      const budgetMatch = lowerText.match(/(?:under|below|less than|within)\s*₹?\s*(\d+)/i);
      const destMatch = lowerText.match(/(?:to|for)\s+(.+?)(?:\s+under|\s+below|$)/i);
      
      const maxBudget = budgetMatch ? parseInt(budgetMatch[1]) : null;
      const destination = destMatch ? destMatch[1].trim() : null;
      
      addBotMessage(`🏷️ Looking for the best deals...`);
      
      try {
        const params = new URLSearchParams();
        if (maxBudget) params.append('max_budget', maxBudget);
        if (destination) params.append('destination', destination);
        
        const response = await fetch(`http://localhost:5001/api/deals?${params}`);
        const data = await response.json();
        
        if (data.success && data.deals.length > 0) {
          let message = `🔥 **Hot Deals Found!**\n\n`;
          
          data.deals.slice(0, 4).forEach((deal, i) => {
            message += `**${i + 1}. ${deal.destination}** (${deal.airline})\n`;
            message += `   ~~₹${deal.original_price.toLocaleString()}~~ → **₹${deal.deal_price.toLocaleString()}** (${deal.discount_percent}% OFF)\n`;
            if (deal.promo_code) message += `   🎟️ Code: **${deal.promo_code}**\n`;
            message += `   ⏰ Valid until: ${deal.valid_until} | ${deal.seats_left} seats left\n\n`;
          });
          
          addBotMessage(message);
        } else {
          addBotMessage(`No deals found matching your criteria. Try broadening your search!`);
        }
      } catch (error) {
        addBotMessage(`Deals service is unavailable. Please try again later.`);
      }
      return;
    }

    // Handle help / what can you do
    if (/(?:help|what can you|capabilities|features|what do you)/i.test(lowerText)) {
      const helpMessage = `🤖 **I'm Yoli, your AI Travel Assistant!**\n\nHere's what I can help you with:\n\n` +
        `🌍 **Destination Recommendations**\n   "I want a romantic beach vacation"\n\n` +
        `📅 **Best Time to Visit**\n   "When is the best time to visit Bali?"\n\n` +
        `✈️ **Flight Search**\n   "Find flights from Delhi to Maldives"\n\n` +
        `💰 **Deals & Discounts**\n   "Any deals under 15000?"\n\n` +
        `📝 **Booking**\n   Select a destination and I'll help you book!\n\n` +
        `Just ask me anything about travel! 🌟`;
      addBotMessage(helpMessage);
      return;
    }

    // ===== INTELLIGENT AI DESTINATION SEARCH =====
    // Use AI backend for smart destination recommendations
    addBotMessage("🔍 Let me find the perfect destinations for you...");
    
    try {
      const response = await fetch('http://localhost:5001/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userText, top_n: 5 })
      });
      const data = await response.json();
      
      if (data.success && data.recommendations && data.recommendations.length > 0) {
        const recommendations = data.recommendations.slice(0, 3);
        
        // Format destinations for display
        const formattedDests = recommendations.map(dest => ({
          title: dest.title,
          location: dest.location || dest.country,
          price: dest.price,
          category: dest.category,
          mood: dest.moods || [],
          description: dest.description,
          score: dest.score
        }));
        
        setCurrentSuggestion(formattedDests[0]);
        
        let message = `🎯 Based on your query, here are my top picks:\n\n`;
        formattedDests.forEach((dest, i) => {
          const matchScore = Math.round((dest.score || 0.8) * 100);
          message += `**${i + 1}. ${dest.title}**\n`;
          message += `   📍 ${dest.location} | ₹${dest.price?.toLocaleString() || 'N/A'}/day\n`;
          message += `   🎯 Match: ${matchScore}%\n\n`;
        });
        message += `Ready to book? Visit our **Booking** page to complete your reservation! 🎫`;
        
        addBotMessage(message, formattedDests, true);
      } else {
        // Fallback to local search
        const matchedDests = findDestinations(userText);
        if (matchedDests.length > 0) {
          setCurrentSuggestion(matchedDests[0]);
          addBotMessage(`Based on your preferences, here are some options:`, matchedDests, true);
        } else {
          addBotMessage(responses.notUnderstood[Math.floor(Math.random() * responses.notUnderstood.length)]);
        }
      }
    } catch (error) {
      // AI server not available, use local fallback
      const matchedDests = findDestinations(userText);
      if (matchedDests.length > 0) {
        setCurrentSuggestion(matchedDests[0]);
        addBotMessage(`Here are some destinations you might like:`, matchedDests, true);
      } else {
        addBotMessage("I'd love to help! The AI service is starting up. Try asking about:\n\n• Specific places: 'Tell me about Shimla'\n• Moods: 'I want a peaceful vacation'\n• Activities: 'Beach vacation'\n• Flights: 'Flights from Delhi to Goa'");
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDestinationClick = (dest) => {
    setCurrentSuggestion(dest);
    addUserMessage(`I want to book ${dest.title}`);
    addBotMessage(`Excellent choice! 🌟 ${dest.title} in ${dest.location} is amazing!\n\n💰 Price: ₹${dest.price.toLocaleString('en-IN')}/day\n\n${responses.askBooking}`);
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'monument': return <FaLandmark />;
      case 'nature': return <FaMountain />;
      case 'religious': return <FaPray />;
      case 'cultural': return <FaUmbrellaBeach />;
      default: return <FaPlane />;
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button 
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Chat"
      >
        {isOpen ? <RiCloseLine size={28} /> : <RiRobot2Fill size={28} />}
      </button>

      {/* Chat Window */}
      <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <div className="header-info">
            <RiRobot2Fill className="bot-avatar" />
            <div>
              <h3>Yoli - AI Travel Assistant</h3>
              <span className="status">Online • Ready to help</span>
            </div>
          </div>
          <button className="close-btn" onClick={() => setIsOpen(false)}>
            <RiCloseLine size={24} />
          </button>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              {msg.type === 'bot' && <RiRobot2Fill className="msg-avatar" />}
              <div className="message-content">
                <p dangerouslySetInnerHTML={{ 
                  __html: msg.text
                    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                    .replace(/~~(.+?)~~/g, '<del>$1</del>')
                    .replace(/\n/g, '<br/>')
                }} />
                
                {/* Destination Cards */}
                {msg.destinations && (
                  <div className="destination-suggestions">
                    {msg.destinations.map((dest, i) => (
                      <div 
                        key={i} 
                        className="suggestion-card"
                        onClick={() => handleDestinationClick(dest)}
                      >
                        <div className="suggestion-icon">
                          {getCategoryIcon(dest.category)}
                        </div>
                        <div className="suggestion-info">
                          <h4>{dest.title}</h4>
                          <span><RiMapPinLine /> {dest.location}</span>
                          <span className="price">₹{dest.price.toLocaleString('en-IN')}/day</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message bot">
              <RiRobot2Fill className="msg-avatar" />
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="chatbot-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tell me about your dream trip..."
            aria-label="Chat input"
          />
          <button onClick={handleSend} aria-label="Send message">
            <RiSendPlaneFill size={20} />
          </button>
        </div>
      </div>
    </>
  );
}

export default Chatbot;
