import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Trophy, 
  Calendar, 
  Search, 
  X, 
  Check, 
  Eye, 
  SlidersHorizontal, 
  ArrowRight, 
  MessageSquare, 
  Shield, 
  Info, 
  CheckCircle2, 
  Activity, 
  Clock, 
  Compass, 
  Star, 
  User, 
  TrendingUp, 
  Sliders,
  DollarSign,
  AlertCircle
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:8000' 
    : '/_/backend');

// Fallback VENUES in case backend is offline during start
const FALLBACK_VENUES = [
  {
    id: "v-1",
    name: "Gomti Nagar Badminton Court",
    sport: "Badminton",
    price: 150,
    skill: "Beginner",
    location: "Gomti Nagar",
    rating: 4.8,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80",
    features: ["Indoor Wooden Court", "Synthetic Matting", "Locker Room", "Power Backup"],
    description: "A premium indoor facility featuring professional-grade wooden courts with synthetic mats. Perfect for beginners and seasoned players alike."
  },
  {
    id: "v-2",
    name: "Chinhat Football Turf",
    sport: "Football",
    price: 300,
    skill: "Intermediate",
    location: "Chinhat",
    rating: 4.6,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=600&q=80",
    features: ["FIFA Certified Turf", "Night Floodlights", "Free Parking", "Water Stations"],
    description: "FIFA-approved 7v7 artificial grass turf with high-quality floodlights. Excellent for night matches and team training sessions."
  },
  {
    id: "v-3",
    name: "Lucknow Swimming Center",
    sport: "Swimming",
    price: 250,
    skill: "Beginner",
    location: "Aliganj",
    rating: 4.9,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=600&q=80",
    features: ["Olympic-sized Pool", "Temperature Controlled", "Certified Lifeguards", "Shower Facilities"],
    description: "Clean, crystal-clear, temperature-controlled pool with dedicated lanes for training and leisure swimming. Lifeguards always on duty."
  }
];

// Helper to fill UI assets based on venue name
const getUiMetadataForVenue = (venueName) => {
  if (venueName.includes("Badminton")) {
    return {
      rating: 4.8,
      reviews: 124,
      image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80",
      features: ["Indoor Wooden Court", "Synthetic Matting", "Locker Room", "Power Backup"],
      description: "A premium indoor facility featuring professional-grade wooden courts with synthetic mats. Perfect for beginners and seasoned players alike."
    };
  } else if (venueName.includes("Football")) {
    return {
      rating: 4.6,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=600&q=80",
      features: ["FIFA Certified Turf", "Night Floodlights", "Free Parking", "Water Stations"],
      description: "FIFA-approved 7v7 artificial grass turf with high-quality floodlights. Excellent for night matches and team training sessions."
    };
  } else if (venueName.includes("Swimming")) {
    return {
      rating: 4.9,
      reviews: 156,
      image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=600&q=80",
      features: ["Olympic-sized Pool", "Temperature Controlled", "Certified Lifeguards", "Shower Facilities"],
      description: "Clean, crystal-clear, temperature-controlled pool with dedicated lanes for training and leisure swimming. Lifeguards always on duty."
    };
  }
  return {
    rating: 4.5,
    reviews: 32,
    image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80",
    features: ["Changing Room", "First Aid", "Drinking Water"],
    description: "A standard local sports space situated in the heart of Lucknow."
  };
};

function App() {
  // Filter States
  const [sportFilter, setSportFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [filteredVenues, setFilteredVenues] = useState([]);
  
  // API Integration States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [myBookings, setMyBookings] = useState([]);

  // Modal States
  const [selectedVenueForDetails, setSelectedVenueForDetails] = useState(null);
  const [selectedVenueForBooking, setSelectedVenueForBooking] = useState(null);
  
  // Booking Form States
  const [bookingName, setBookingName] = useState('');
  const [bookingDate, setBookingDate] = useState('2026-05-23');
  const [bookingTimeSlot, setBookingTimeSlot] = useState('18:00 - 19:00');
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState('');

  // AI Agent Chat States
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      sender: 'agent',
      text: "👋 Welcome to SportSphere AI! I am your intelligent sports assistant. Let me know what you want to play, your budget, or your location in Lucknow.",
    },
    {
      id: 2,
      sender: 'agent',
      text: "✨ Recommended for beginners under ₹200 near Gomti Nagar: **Gomti Nagar Badminton Court** (₹150/hour, Beginner).",
      suggestionTag: "beginners-gomti"
    }
  ]);
  const [isAgentThinking, setIsAgentThinking] = useState(false);

  // Fetch initial venues on mount
  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/venues`);
      if (!response.ok) throw new Error("Could not connect to FastAPI server.");
      const data = await response.json();
      
      const mapped = data.venues.map(v => ({
        ...v,
        skillLevel: v.skill,
        ...getUiMetadataForVenue(v.name)
      }));
      setFilteredVenues(mapped);
    } catch (err) {
      console.warn("Backend unavailable, using fallback static data.", err);
      setError("FastAPI server offline. Displaying local mock arenas.");
      setFilteredVenues(FALLBACK_VENUES);
    } finally {
      setIsLoading(false);
    }
  };

  // Phase 4: Apply filters via fetch(POST /recommend)
  const handleFindVenues = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);
    setIsAgentThinking(true);

    try {
      const budgetVal = budgetFilter ? parseFloat(budgetFilter) : null;
      
      // TODO: Implement Gemini recommendations with conversational intent inside '/recommend' route
      const response = await fetch(`${API_BASE_URL}/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sport: sportFilter || null,
          budget: isNaN(budgetVal) ? null : budgetVal,
          skill: skillFilter || null,
          location: locationFilter || null
        })
      });

      if (!response.ok) throw new Error("FastAPI recommender endpoint returned an error.");
      const data = await response.json();

      const mapped = data.venues.map(v => ({
        ...v,
        skillLevel: v.skill,
        ...getUiMetadataForVenue(v.name)
      }));
      
      setFilteredVenues(mapped);

      // Conversational feedback
      const sportText = sportFilter ? `${sportFilter} courts` : 'venues';
      const locText = locationFilter ? `in ${locationFilter}` : 'anywhere in Lucknow';
      const budgetText = budgetFilter ? `under ₹${budgetFilter}/hr` : '';
      const skillText = skillFilter ? `suitable for ${skillFilter}s` : '';

      setChatHistory(prev => [
        ...prev,
        {
          id: Date.now(),
          sender: 'agent',
          text: `🔍 **Discovery & Recommendation Agent results:** Found ${mapped.length} ${sportText} ${locText} ${budgetText} ${skillText}. Ranked by affordability, distance, and skill match.`
        }
      ]);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch recommendation from server. Falling back to local search.");
      
      // Local Fallback Filter
      let results = FALLBACK_VENUES;
      if (sportFilter) {
        results = results.filter(v => v.sport.toLowerCase() === sportFilter.toLowerCase());
      }
      if (locationFilter) {
        results = results.filter(v => v.location.toLowerCase().includes(locationFilter.toLowerCase()));
      }
      if (budgetFilter) {
        results = results.filter(v => v.price <= parseInt(budgetFilter, 10));
      }
      if (skillFilter) {
        results = results.filter(v => v.skill.toLowerCase() === skillFilter.toLowerCase());
      }
      setFilteredVenues(results);
    } finally {
      setIsLoading(false);
      setIsAgentThinking(false);
    }
  };

  // Preset Agent Suggestions Click
  const handlePillClick = (type) => {
    setIsAgentThinking(true);
    setTimeout(() => {
      let textResponse = '';
      if (type === 'beginners-gomti') {
        setSportFilter('Badminton');
        setLocationFilter('Gomti Nagar');
        setBudgetFilter('200');
        setSkillFilter('Beginner');
        textResponse = "Filtered for Gomti Nagar Badminton Court. Labeled Beginner Friendly, rate ₹150/hr. Real-time booking initialized.";
      } else if (type === 'chinhat-football') {
        setSportFilter('Football');
        setLocationFilter('Chinhat');
        setBudgetFilter('300');
        setSkillFilter('Intermediate');
        textResponse = "Filtered for Football Turf in Chinhat. Labeled Intermediate, ₹300/hr. It features night floodlighting and certified turf!";
      } else if (type === 'top-swimming') {
        setSportFilter('Swimming');
        setLocationFilter('Aliganj');
        setBudgetFilter('300');
        setSkillFilter('Beginner');
        textResponse = "Loaded Lucknow Swimming Center Pool. Olympic size, ₹250/hr, with lifeguard protection.";
      }

      setChatHistory(prev => [
        ...prev,
        {
          id: Date.now(),
          sender: 'user',
          text: `Show me recommendations for ${type.replace('-', ' ')}.`
        },
        {
          id: Date.now() + 1,
          sender: 'agent',
          text: textResponse
        }
      ]);
      setIsAgentThinking(false);
    }, 300);
  };

  // Conversational AI agent search via backend (/api/chat)
  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatHistory(prev => [...prev, { id: Date.now(), sender: 'user', text: userMsg }]);
    setChatInput('');
    setIsAgentThinking(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userMsg })
      });

      if (!res.ok) throw new Error("Chat agent offline.");
      const data = await res.json();

      if (data.suggested_venues && data.suggested_venues.length > 0) {
        const mapped = data.suggested_venues.map(v => ({
          ...v,
          skillLevel: v.skill,
          ...getUiMetadataForVenue(v.name)
        }));
        setFilteredVenues(mapped);
      }

      setChatHistory(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'agent',
          text: data.response
        }
      ]);
    } catch (err) {
      console.error(err);
      // Local fallback parser in case backend is offline
      setTimeout(() => {
        const lowerInput = userMsg.toLowerCase();
        let responseText = "FastAPI backend agent is offline. I parsed your query locally, but could not retrieve Gemini recommendations.";
        
        if (lowerInput.includes('badminton') || lowerInput.includes('gomti')) {
          setSportFilter('Badminton');
          setLocationFilter('Gomti Nagar');
          setFilteredVenues(FALLBACK_VENUES.filter(v => v.id === "v-1"));
          responseText = "I've matched your request locally with **Gomti Nagar Badminton Court** (₹150/hour).";
        } else if (lowerInput.includes('football') || lowerInput.includes('chinhat')) {
          setSportFilter('Football');
          setLocationFilter('Chinhat');
          setFilteredVenues(FALLBACK_VENUES.filter(v => v.id === "v-2"));
          responseText = "I've matched your request locally with **Chinhat Football Turf** (₹300/hour).";
        } else if (lowerInput.includes('swim') || lowerInput.includes('aliganj')) {
          setSportFilter('Swimming');
          setLocationFilter('Aliganj');
          setFilteredVenues(FALLBACK_VENUES.filter(v => v.id === "v-3"));
          responseText = "I've matched your request locally with **Lucknow Swimming Center** (₹250/hour).";
        }

        setChatHistory(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'agent',
            text: responseText
          }
        ]);
      }, 500);
    } finally {
      setIsAgentThinking(false);
    }
  };

  // Open booking modal
  const openBookingModal = (venue) => {
    setSelectedVenueForBooking(venue);
    setBookingName('');
    setIsBookingConfirmed(false);
    setBookingId('');
  };

  // Phase 5: Submit booking to backend (/book)
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!bookingName.trim()) return;
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          venue_id: selectedVenueForBooking.id,
          date: bookingDate,
          time_slot: bookingTimeSlot,
          user_name: bookingName
        })
      });

      if (!response.ok) throw new Error("FastAPI booking service failed.");
      const data = await response.json();

      setBookingId(data.booking_id);
      setIsBookingConfirmed(true);
      
      // Save locally to display under active bookings
      setMyBookings(prev => [data.booking, ...prev]);

      setChatHistory(prev => [
        ...prev,
        {
          id: Date.now(),
          sender: 'agent',
          text: `🎟️ **Booking Confirmed!** Ref ID: *${data.booking_id}* for ${selectedVenueForBooking.name} on ${bookingDate} at ${bookingTimeSlot}. Postpaid payment at venue.`
        }
      ]);
    } catch (err) {
      console.error(err);
      // Fallback local booking mock
      const mockId = 'SS-' + Math.floor(100000 + Math.random() * 900000);
      setBookingId(mockId);
      setIsBookingConfirmed(true);
      
      const newMockBooking = {
        booking_id: mockId,
        venue_id: selectedVenueForBooking.id,
        venue_name: selectedVenueForBooking.name,
        sport: selectedVenueForBooking.sport,
        price: selectedVenueForBooking.price,
        location: selectedVenueForBooking.location,
        date: bookingDate,
        time_slot: bookingTimeSlot,
        user_name: bookingName,
        status: "Confirmed"
      };

      setMyBookings(prev => [newMockBooking, ...prev]);
      setError("Booking server offline. Created a local mock reservation.");
    } finally {
      setIsLoading(false);
    }
  };

  // Phase 5: Cancel booking via backend (/cancel)
  const handleCancelBooking = async (bId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: bId
        })
      });

      if (!response.ok) throw new Error("FastAPI cancellation service failed.");
      
      // Update local state status
      setMyBookings(prev => prev.map(b => b.booking_id === bId ? { ...b, status: "Cancelled" } : b));
      
      setChatHistory(prev => [
        ...prev,
        {
          id: Date.now(),
          sender: 'agent',
          text: `❌ **Booking Cancelled:** Confirmed removal of reference *${bId}*.`
        }
      ]);
    } catch (err) {
      console.error(err);
      // Fallback local cancellation
      setMyBookings(prev => prev.map(b => b.booking_id === bId ? { ...b, status: "Cancelled" } : b));
      setError("Cancellation server offline. Cancelled reservation locally.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSportFilter('');
    setBudgetFilter('');
    setSkillFilter('');
    setLocationFilter('');
    fetchVenues();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* 1. Glassmorphism Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Activity className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                SportSphere <span className="text-emerald-400">AI</span>
              </span>
              <span className="hidden md:inline-block ml-2 text-[10px] text-slate-500 uppercase tracking-widest font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                Lucknow Agent Platform
              </span>
            </div>
          </div>
          
          <nav className="flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">Home</a>
            <a href="#explore" className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">Explore</a>
            <a href="#map-section" className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">Neighborhood Map</a>
            <a href="#agent-section" className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">AI Chat</a>
          </nav>
        </div>
      </header>

      {/* Hero Section Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-12">
        
        {/* 2. Hero Header */}
        <section className="text-center relative py-6">
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <div className="w-72 h-72 bg-emerald-500/10 blur-[100px] rounded-full animate-pulse" />
            <div className="w-96 h-96 bg-teal-500/5 blur-[150px] rounded-full" />
          </div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
            Lucknow's First Agentic Arena Discovery & Booking Platform
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Discover and Book <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Sports Infrastructure
            </span> in Lucknow
          </h1>
          
          <p className="mt-4 text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-medium">
            AI-driven multi-criteria matching agent. Search dynamically, view neighborhood coordinates, and book postpaid courts instantly.
          </p>
        </section>

        {/* API Error Notification */}
        {error && (
          <div className="max-w-4xl mx-auto bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3 text-amber-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-xs hover:underline text-amber-300 font-bold">Dismiss</button>
            </div>
          </div>
        )}

        {/* 3. Search Box / Widget */}
        <section className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-5 md:p-6 rounded-3xl shadow-xl max-w-5xl mx-auto">
          <form onSubmit={handleFindVenues} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            
            {/* Sport Type */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Sport Type</label>
              <div className="relative">
                <select 
                  value={sportFilter} 
                  onChange={(e) => setSportFilter(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">All Sports</option>
                  <option value="Badminton">Badminton</option>
                  <option value="Football">Football</option>
                  <option value="Swimming">Swimming</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">▼</div>
              </div>
            </div>

            {/* Location Input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Location / Area</label>
              <div className="relative">
                <select 
                  value={locationFilter} 
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">All Locations</option>
                  <option value="Gomti Nagar">Gomti Nagar</option>
                  <option value="Chinhat">Chinhat</option>
                  <option value="Aliganj">Aliganj</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">▼</div>
              </div>
            </div>

            {/* Budget Dropdown */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Max Budget / Hr</label>
              <div className="relative">
                <select 
                  value={budgetFilter} 
                  onChange={(e) => setBudgetFilter(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Any Budget</option>
                  <option value="150">Under ₹150</option>
                  <option value="200">Under ₹200</option>
                  <option value="250">Under ₹250</option>
                  <option value="300">Under ₹300</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">▼</div>
              </div>
            </div>

            {/* Skill Level Dropdown */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Skill Level</label>
              <div className="relative">
                <select 
                  value={skillFilter} 
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Any Skill Level</option>
                  <option value="Beginner">Beginner Friendly</option>
                  <option value="Intermediate">Intermediate</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">▼</div>
              </div>
            </div>

          </form>

          {/* Action Row */}
          <div className="mt-4 pt-4 border-t border-slate-800/60 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2">
              {(sportFilter || locationFilter || budgetFilter || skillFilter) && (
                <button 
                  onClick={resetFilters}
                  type="button" 
                  className="text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition animate-in fade-in"
                >
                  Clear Filters
                </button>
              )}
            </div>
            <button
              onClick={handleFindVenues}
              disabled={isLoading}
              type="button"
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition duration-200"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Find Venues
            </button>
          </div>
        </section>

        {/* 4. Main Grid Section: Venue Cards */}
        <section id="explore" className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-900 pb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-400" />
                Featured Sports Arenas
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Showing {filteredVenues.length} locations matching your parameters
              </p>
            </div>
            <span className="text-xs text-slate-500 bg-slate-900 px-3 py-1.5 rounded border border-slate-850">
              Lucknow, UP
            </span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-400">Recommendation Agent is evaluating options...</p>
            </div>
          ) : filteredVenues.length === 0 ? (
            <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-12 text-center">
              <p className="text-slate-400">No arenas found matching those filters.</p>
              <button 
                onClick={resetFilters}
                className="mt-4 text-xs font-bold text-emerald-400 hover:underline"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredVenues.map((venue) => (
                <div 
                  key={venue.id}
                  className="group bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col h-full"
                >
                  {/* Image Header */}
                  <div className="relative h-44 overflow-hidden bg-slate-850">
                    <img 
                      src={venue.image} 
                      alt={venue.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80";
                      }}
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="bg-slate-950/80 backdrop-blur text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-md font-semibold tracking-wide">
                        {venue.sport}
                      </span>
                    </div>
                    {venue.score !== undefined && (
                      <div className="absolute bottom-3 left-3 bg-emerald-500/90 backdrop-blur text-slate-950 text-[10px] px-2 py-0.5 rounded-md font-bold border border-emerald-400/20">
                        Match Score: {venue.score}%
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur text-amber-400 text-[10px] px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 border border-amber-500/20">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {venue.rating}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base text-slate-100 group-hover:text-emerald-400 transition-colors">
                        {venue.name}
                      </h3>
                      
                      <div className="mt-2.5 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          <span>{venue.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          <span className="font-bold text-emerald-400">₹{venue.price}/hour</span>
                        </div>
                        {venue.skillLevel && (
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Trophy className="w-3.5 h-3.5 text-amber-500/80 flex-shrink-0" />
                            <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 text-[10px] text-slate-300 font-medium">
                              {venue.skillLevel}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 pt-4 border-t border-slate-800/50 grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setSelectedVenueForDetails(venue)}
                        className="py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-850 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Details
                      </button>
                      <button 
                        onClick={() => openBookingModal(venue)}
                        className="py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1 shadow-md shadow-emerald-500/5 hover:shadow-emerald-500/15"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Phase 7: Interactive Map Support */}
        <section id="map-section" className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start flex-col sm:flex-row gap-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  Lucknow Sports Map Grid
                </h3>
                <p className="text-xs text-slate-400">
                  Select coordinates to inspect nearby stadiums. Showing markers for active sports centers.
                </p>
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono bg-slate-950 border border-slate-850 px-2 py-0.5 rounded">
                // TODO: Google Maps Real-time SDK Integration
              </span>
            </div>

            {/* Futuristic Lucknow neighborhood map grid */}
            <div className="w-full h-80 rounded-2xl bg-slate-950 border border-slate-900 relative overflow-hidden flex items-center justify-center select-none shadow-inner">
              {/* Tactical grid style */}
              <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:32px_32px]" />
              
              <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-emerald-500/5 blur-[90px] rounded-full pointer-events-none" />
              <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-teal-500/5 blur-[70px] rounded-full pointer-events-none" />

              <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M -10 65 C 20 50, 45 42, 60 55 C 75 68, 85 45, 110 35" fill="none" stroke="#14b8a6" strokeWidth="1.5" strokeDasharray="4,4" />
              </svg>

              {/* Area Indicators */}
              <div className="absolute text-[10px] text-slate-600 font-mono tracking-widest uppercase" style={{ left: '20%', top: '25%' }}>Aliganj Zone</div>
              <div className="absolute text-[10px] text-slate-600 font-mono tracking-widest uppercase" style={{ left: '55%', top: '55%' }}>Gomti Nagar Zone</div>
              <div className="absolute text-[10px] text-slate-600 font-mono tracking-widest uppercase" style={{ left: '78%', top: '35%' }}>Chinhat Zone</div>
              <div className="absolute text-[9px] text-teal-500/30 font-mono tracking-wider" style={{ left: '35%', top: '53%', transform: 'rotate(-10deg)' }}>Gomti River Flow</div>

              {/* Interactive Coordinates Pins */}
              {filteredVenues.map((v) => {
                let coords = { x: 50, y: 50 }; // default
                if (v.location.includes("Gomti")) coords = { x: 62, y: 58 };
                else if (v.location.includes("Chinhat")) coords = { x: 80, y: 38 };
                else if (v.location.includes("Aliganj")) coords = { x: 25, y: 28 };

                return (
                  <button 
                    key={v.id} 
                    onClick={() => setSelectedVenueForDetails(v)}
                    className="absolute cursor-pointer group focus:outline-none z-10" 
                    style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                  >
                    {/* Ring ping */}
                    <span className="absolute inline-flex h-8 w-8 rounded-full bg-emerald-500/30 animate-ping opacity-75 -left-2.5 -top-2.5" />
                    
                    {/* Core Pin */}
                    <div className="relative w-4.5 h-4.5 bg-emerald-400 border border-slate-950 rounded-full shadow-lg shadow-emerald-500/40 group-hover:bg-teal-300 group-hover:scale-125 transition duration-200 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-slate-950 rounded-full" />
                    </div>

                    {/* Neighborhood Tooltip */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-[11px] text-white px-2.5 py-1.5 rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 flex flex-col items-center">
                      <span className="font-bold text-emerald-400">{v.name}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">₹{v.price}/hr • {v.sport} • {v.location}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Phase 5: Active Bookings Listing Section */}
        {myBookings.length > 0 && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="border-b border-slate-900 pb-4">
              <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                My Active Bookings
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Your slots reservation status in Lucknow (postpaid billing)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myBookings.map((booking) => (
                <div 
                  key={booking.booking_id}
                  className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono bg-slate-950 border border-slate-850 px-2 py-0.5 rounded text-emerald-400">
                        {booking.booking_id}
                      </span>
                      <h4 className="font-bold text-white mt-2">{booking.venue_name}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3 h-3 text-slate-500" /> {booking.location}
                      </p>
                    </div>

                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                      booking.status === 'Confirmed' 
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                        : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-800/60 font-mono text-xs">
                    <div>
                      <span className="text-slate-500 block uppercase text-[9px]">Sport</span>
                      <span className="text-slate-200">{booking.sport}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[9px]">Date</span>
                      <span className="text-slate-200">{booking.date}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[9px]">Slot</span>
                      <span className="text-slate-200 truncate">{booking.time_slot}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Total Price: <strong className="text-emerald-400 font-bold">₹{booking.price}</strong></span>
                    {booking.status === 'Confirmed' && (
                      <button 
                        onClick={() => handleCancelBooking(booking.booking_id)}
                        className="px-3 py-1.5 rounded-lg border border-rose-900/30 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 font-bold transition"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Bottom Section: AI Agent Chat Suggestions */}
        <section id="agent-section" className="bg-slate-900/40 border border-slate-800/80 rounded-3xl overflow-hidden p-6 max-w-4xl mx-auto shadow-xl relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-md">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  AI Agent Dialog System
                  <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full bg-emerald-500/5">
                    Conversational Discoverer
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Powered by Gemini LLM routing. Instruct your agent to find budgets or areas.
                </p>
              </div>

              {/* Chat Simulation Area */}
              <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4 space-y-3.5 max-h-[300px] overflow-y-auto">
                {chatHistory.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-xl p-3 text-xs md:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}>
                      {msg.sender === 'agent' && (
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1">
                          <Activity className="w-3 h-3 text-emerald-500" />
                          SportSphere Agent
                        </div>
                      )}
                      
                      <p className="whitespace-pre-line text-slate-100">
                        {msg.text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-emerald-300 font-bold">{part}</strong> : part)}
                      </p>
                      
                      {msg.suggestionTag && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          <button 
                            onClick={() => handlePillClick('beginners-gomti')}
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] px-2.5 py-1 rounded-md transition font-medium"
                          >
                            📍 Gomti Nagar Badminton Under ₹200
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isAgentThinking && (
                  <div className="flex justify-start animate-pulse">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce animate-delay-75" />
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce animate-delay-150" />
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce animate-delay-300" />
                      </div>
                      <span>Agent is optimizing search...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Pills */}
              <div className="flex flex-wrap gap-2 pt-1.5">
                <span className="text-xs text-slate-500 self-center font-medium">Quick Queries:</span>
                <button 
                  onClick={() => handlePillClick('beginners-gomti')}
                  className="bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-850 text-[11px] px-3 py-1.5 rounded-lg transition hover:border-slate-700"
                >
                  ⚡ Beginners near Gomti Nagar
                </button>
                <button 
                  onClick={() => handlePillClick('chinhat-football')}
                  className="bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-850 text-[11px] px-3 py-1.5 rounded-lg transition hover:border-slate-700"
                >
                  ⚽ Football in Chinhat
                </button>
                <button 
                  onClick={() => handlePillClick('top-swimming')}
                  className="bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-850 text-[11px] px-3 py-1.5 rounded-lg transition hover:border-slate-700"
                >
                  🏊 Pool in Lucknow
                </button>
              </div>

              {/* Chat Form */}
              <form onSubmit={handleSendChatMessage} className="flex gap-2 pt-1 border-t border-slate-800/40">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask Agent: 'Find beginner badminton under ₹200 near Gomti Nagar'"
                  className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs md:text-sm focus:outline-none focus:border-emerald-500 text-slate-100 placeholder-slate-500 transition-colors"
                />
                <button 
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs md:text-sm transition flex items-center gap-1.5 shadow-md shadow-emerald-500/10"
                >
                  Send
                </button>
              </form>

            </div>
          </div>
        </section>

      </main>

      {/* 6. Booking Modal */}
      {selectedVenueForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200"
          >
            <button 
              onClick={() => setSelectedVenueForBooking(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            {!isBookingConfirmed ? (
              <form onSubmit={handleConfirmBooking} className="space-y-4">
                <div>
                  <span className="text-[10px] text-emerald-400 uppercase font-mono tracking-widest font-semibold">
                    Reserve Slot
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {selectedVenueForBooking.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Price: <span className="font-semibold text-emerald-400">₹{selectedVenueForBooking.price}/hour</span> • {selectedVenueForBooking.location}
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-emerald-400 font-bold">AI Slot Advisor:</span> 
                    {" "}Based on scheduling records in {selectedVenueForBooking.location}, slots near {bookingTimeSlot} are optimized.
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Your Name</label>
                    <input 
                      type="text" 
                      required
                      value={bookingName}
                      onChange={(e) => setBookingName(e.target.value)}
                      placeholder="Mukesh Kumar"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 text-slate-100 placeholder-slate-650"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Select Date</label>
                      <input 
                        type="date" 
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-100 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Time Slot</label>
                      <select 
                        value={bookingTimeSlot}
                        onChange={(e) => setBookingTimeSlot(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-100 cursor-pointer"
                      >
                        <option value="06:00 AM - 07:00 AM">06:00 AM - 07:00 AM</option>
                        <option value="08:00 AM - 09:00 AM">08:00 AM - 09:00 AM</option>
                        <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                        <option value="06:00 PM - 07:00 PM">06:00 PM - 07:00 PM</option>
                        <option value="07:00 PM - 08:00 PM">07:00 PM - 08:00 PM</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                  <span>Total Amount (payable at court):</span>
                  <span className="font-extrabold text-white text-base">₹{selectedVenueForBooking.price}</span>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-sm transition"
                >
                  {isLoading ? "Validating slot..." : "Confirm Booking"}
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Booking Confirmed!</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Your sports slot is reserved on our server.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-left space-y-2 max-w-sm mx-auto font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">REF ID:</span>
                    <span className="text-emerald-400 font-bold">{bookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">VENUE:</span>
                    <span className="text-slate-300 truncate max-w-[180px]">{selectedVenueForBooking.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">DATE:</span>
                    <span className="text-slate-300">{bookingDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">TIME:</span>
                    <span className="text-slate-300">{bookingTimeSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">AMOUNT:</span>
                    <span className="text-emerald-400 font-bold">₹{selectedVenueForBooking.price} (Postpaid)</span>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedVenueForBooking(null)}
                  className="px-6 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold rounded-lg transition"
                >
                  Close Receipt
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. Details Drawer/Modal */}
      {selectedVenueForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div 
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
          >
            <button 
              onClick={() => setSelectedVenueForDetails(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition z-10 bg-slate-950/60 p-1.5 rounded-full backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Banner Image */}
            <div className="h-48 relative">
              <img 
                src={selectedVenueForDetails.image} 
                alt={selectedVenueForDetails.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="bg-emerald-500 text-slate-950 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {selectedVenueForDetails.sport}
                </span>
                <h3 className="text-xl font-bold text-white mt-1.5">{selectedVenueForDetails.name}</h3>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-350 leading-relaxed">
                {selectedVenueForDetails.description}
              </p>

              <div className="grid grid-cols-2 gap-4 border-y border-slate-800/80 py-4 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider block">Location</span>
                  <span className="text-slate-300 font-medium">{selectedVenueForDetails.location}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider block">Price per Hour</span>
                  <span className="text-emerald-400 font-bold text-sm">₹{selectedVenueForDetails.price} / hr</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider block">Skill Guideline</span>
                  <span className="text-slate-300 font-medium">{selectedVenueForDetails.skillLevel || selectedVenueForDetails.skill}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider block">Rating</span>
                  <span className="text-amber-400 font-medium flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {selectedVenueForDetails.rating} ({selectedVenueForDetails.reviews} reviews)
                  </span>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Amenities Included</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedVenueForDetails.features && selectedVenueForDetails.features.map((feature, i) => (
                    <span key={i} className="bg-slate-950 border border-slate-850 px-2.5 py-1 rounded-lg text-xs text-slate-300 flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-emerald-400" />
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800/50 flex gap-3">
                <button 
                  onClick={() => setSelectedVenueForDetails(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900 hover:bg-slate-855 text-xs font-bold text-slate-300 hover:text-white transition"
                >
                  Close Details
                </button>
                <button 
                  onClick={() => {
                    setSelectedVenueForDetails(null);
                    openBookingModal(selectedVenueForDetails);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-extrabold transition shadow-lg shadow-emerald-500/10"
                >
                  Book Slot Now
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 SportSphere AI. Lucknow sports discovery platform.</p>
          <div className="flex gap-4">
            <span className="text-[10px] border border-slate-850 px-2.5 py-1 rounded bg-slate-900 text-slate-400">
              ⚡ Powered by Gemini LLM Orchestration
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
