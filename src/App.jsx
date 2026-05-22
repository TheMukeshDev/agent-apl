import React, { useState } from 'react';

function App() {
  const [messages, setMessages] = useState([
    {
      sender: 'agent',
      text: "Hello! I am your SportSphere AI Assistant. Tell me what sport you want to play, your preferred location in Lucknow, and what time you'd like to book."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // TODO: Add Google Maps State and References
  // TODO: Add Supabase API client initialization

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // TODO: Connect to backend API: POST http://localhost:8000/api/chat
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: data.response,
          venues: data.suggested_venues
        }
      ]);
    } catch (error) {
      console.error('Error fetching chat response:', error);
      setMessages((prev) => [
        ...prev,
        { sender: 'agent', text: "Sorry, I'm having trouble reaching the booking server right now. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-emerald-400">SportSphere AI</h1>
          <p className="text-xs text-slate-400">Lucknow Sports Infrastructure Discovery & Booking</p>
        </div>
        <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-medium border border-emerald-500/20">
          Hackathon Dev Mode
        </span>
      </header>

      {/* Main Layout Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-hidden">
        
        {/* Left Panel: Chat Interface */}
        <section className="flex flex-col bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden h-[calc(100vh-140px)]">
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3.5 ${
                  msg.sender === 'user' 
                    ? 'bg-emerald-600 text-white rounded-br-none' 
                    : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                }`}>
                  <p className="text-sm">{msg.text}</p>
                  
                  {/* Suggested Venues Cards */}
                  {msg.venues && msg.venues.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.venues.map((venue) => (
                        <div key={venue.id} className="bg-slate-900/80 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-xs text-emerald-300">{venue.name}</h4>
                            <p className="text-[11px] text-slate-400">{venue.area} • ₹{venue.price_per_hour}/hr</p>
                          </div>
                          <button 
                            onClick={() => alert(`TODO: Implement checkout dialog for ${venue.name}`)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded transition"
                          >
                            Book Slot
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-xs text-slate-500 animate-pulse">Agent is thinking...</div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-850 bg-slate-900/60 flex gap-2">
            <input 
              type="text" 
              placeholder="Ask the Agent (e.g. 'Show badminton courts near Hazratganj')" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 text-slate-100 placeholder-slate-500"
            />
            <button 
              type="submit" 
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-lg font-semibold text-sm transition"
            >
              Send
            </button>
          </form>
        </section>

        {/* Right Panel: Interactive Discovery Map */}
        <section className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[calc(100vh-140px)] relative justify-center items-center">
          {/* TODO: Integrate @googlemaps/js-api-loader and load active map */}
          <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl font-bold animate-pulse">
              📍
            </div>
            <div>
              <h3 className="font-semibold text-slate-200">Interactive Map View</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Google Maps API integration will load a custom map centered on Lucknow, displaying markers for active sports venues matching your query parameters.
              </p>
            </div>
            <div className="text-xs bg-slate-800 px-3 py-1.5 rounded border border-slate-700 text-slate-400">
              Pending MAPS_API_KEY Config
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

export default App;
