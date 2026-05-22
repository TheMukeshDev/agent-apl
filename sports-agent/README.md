# SportSphere AI
**Agentic Sports Infrastructure Discovery & Booking Platform for Lucknow**

---

## 👥 Team Information
- **Team Name:** `[Insert Team Name Here]`
- **Team Members / GitHub Handles:**
  - `[Member 1 Name]` - [@username1](https://github.com/username1)
  - `[Member 2 Name]` - [@username2](https://github.com/username2)
  - `[Member 3 Name]` - [@username3](https://github.com/username3)

---

## 📝 Project Description
SportSphere AI is an agentic sports infrastructure discovery and booking platform tailored for Lucknow. By leveraging advanced language models and geospatial search, it allows sports enthusiasts to interact with an AI agent in natural language to find, compare, and instantly book athletic facilities. The platform streamlines the booking experience, moving away from fragmented forms to a conversational, unified sports concierge.

---

## 🎯 Problem Statement
Lucknow's sports facilities—ranging from badminton courts and cricket turf nets to swimming pools—are highly fragmented. Users face difficulties in checking real-time availability, identifying locations near them, comparing pricing, and coordinating bookings across separate platforms. There is a lack of a centralized, intelligent orchestrator that can parse natural language preferences (e.g., *"Find me an indoor badminton court near Gomti Nagar open after 8 PM"*), match them against real-time availability, and coordinate reservation/payment pipelines seamlessly.

---

## ✨ Planned Features
- **Conversational AI Booking Assistant:** Natural language interface using Google's Gemini API to interpret query intent, location, time, and budget preferences.
- **Geospatial Discovery:** Google Maps API integration to display facilities dynamically with route optimization.
- **Real-Time Booking & Scheduling:** Dynamic slot booking with backend validation and instant confirmation.
- **Agentic Recommendations:** Smart suggestions based on sport type, user history, crowd metrics, and weather conditions.
- **Unified Payment Interface (UPI) Flow:** Mock or sandbox UPI payment flow for booking checkout.

---

## 💻 Tech Stack
- **Frontend:** React.js, Tailwind CSS, Lucide React (icons), React Query.
- **Backend:** FastAPI (Python), Uvicorn.
- **Database:** Supabase (PostgreSQL) / Firebase Firestore.
- **AI/LLM Stack:** Google Gemini 1.5 Pro / Flash via Gemini API, LangChain/LangGraph.
- **APIs:** Google Maps Platform (Maps & Places API).

---

## 🤖 AI Tools Used
- **ChatGPT:** `[Explain how ChatGPT was used, e.g., for initial brainstorming/scaffolding/copywriting]`
- **Gemini:** `[Explain how Gemini was used, e.g., code generation, agent design feedback]`
- **GitHub Copilot:** `[Explain how Copilot was used, e.g., autocomplete, boilerplate code]`

---

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd sports-agent/backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables (create `.env`):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   MAPS_API_KEY=your_google_maps_api_key
   ```
5. Run the development server:
   ```bash
   uvicorn app:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd sports-agent/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the React development server:
   ```bash
   npm run dev
   ```

---

## ⚠️ Known Limitations
- **API Rate Limits:** Gemini API and Google Maps APIs are subject to free-tier rate restrictions.
- **Mock Booking Confirmation:** Direct integration with actual venue slot reservation systems is simulated via database updates.
- **Lucknow Centricity:** The database seeds and maps filters are initially localized to Lucknow venues only (e.g., Gomti Nagar, Aliganj, Hazratganj).

---

## 🗺️ Development Roadmap

- [ ] **Phase 1: Project Initiation & Setup (Current)** - Folder structure setup, basic schemas, configuration.
- [ ] **Phase 2: Core Frontend & Database Schema** - React components, Tailwind styling, Supabase tables for venues and bookings.
- [ ] **Phase 3: Agent Integration (Gemini)** - Agent flow with LangChain/LangGraph, context window design, routing intents.
- [ ] **Phase 4: Maps & Location Search** - Embedding Google Maps, displaying markers, calculating distance metrics.
- [ ] **Phase 5: End-to-End Booking Pipeline** - Chat interface trigger for reservations, state updates, validation.
- [ ] **Phase 6: Deployment & Polish** - Hosting frontend on Vercel, backend on Google Cloud Run, performance tuning.
