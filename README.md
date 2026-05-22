# SportSphere AI
**Agentic Sports Infrastructure Discovery & Booking Platform for Lucknow**

SportSphere AI is an intelligent sports concierge designed to solve sports facility fragmentation in Lucknow. Users can interact with the platform in plain English, and a backend multi-agent system discovers, ranks, and coordinates slot bookings in real-time.

---

## 👥 Team Information (Team GEEROH)
- **Team Name:** `GEEROH`
- **Team Members:**
  1. **Mukesh Kumar** - Full Stack & LLM Orchestration
  2. **Deepa Tiwari** - Agent Architecture & Backend API
  3. **Aryaman Patel** - Frontend UI/UX Design

---

## 🎯 Problem Statement
Lucknow's sports spaces—ranging from badminton courts in Gomti Nagar to turf nets in Chinhat—are highly fragmented. Users struggle with:
1. Fragmented discovery across multiple WhatsApp groups, calls, and websites.
2. Inefficient coordinate mapping for local neighborhoods.
3. Complex booking and reservation systems.

SportSphere AI provides a single chat interface and interactive map to solve this by coordinating specialized agents on the backend (Discovery, Recommendation, Booking, and Cancellation).

---

## 🏗️ Technical Architecture
Refer to [architecture.md](file:///c:/Users/mukes/OneDrive/Documents/coding/agent-apl/architecture.md) for detail.
- **Natural Language Parsing**: Google Gemini (gemini-1.5-flash) acts as the intent classifier and parameter extractor.
- **Lightweight Agentic Core**:
  - *Discovery Agent*: Filters sports venues based on sport, budget, location, and skill.
  - *Recommendation Agent*: Multi-criteria scoring algorithm based on affordability, location distance, and skill match.
  - *Booking Agent*: Automates reservation validation and slot locking.
  - *Cancellation Agent*: Processes slot release commands safely.
- **State Layer**: In-memory database stores active bookings dynamically during development.

---

## ✨ Features Built
- [x] **Conversational Discovery**: Express search preferences in natural language (e.g., *"Find beginner badminton under ₹200 near Gomti Nagar"*).
- [x] **Lightweight Agent Core**: Multi-agent orchestration layer ranking facilities.
- [x] **Interactive Neighborhood Maps**: Coordinates grid representing Gomti Nagar, Chinhat, and Aliganj with clickable markers.
- [x] **Instant Booking Flow**: Confirm slots with immediate receipt generation.
- [x] **Immediate Cancellations**: Cancel scheduled slots on the fly with immediate server updates.

---

## 💻 Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Lucide React (Icons).
- **Backend**: FastAPI (Python), Uvicorn.
- **AI Stack**: Google Generative AI (Gemini SDK), python-dotenv.

---

## 🤖 AI Tools Used
- **ChatGPT**: Used for initial brainstorming, requirements gathering, and copywriting/marketing guidelines.
- **Gemini**: Used for creating the multi-criteria agent scoring logic and debugging FastAPI route handlers.
- **GitHub Copilot**: Used for autocompleting JSX structure, Tailwind layout grids, and interactive SVG mapping assets.

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- Python 3.10+

### Backend Setup
1. Open a terminal in the project directory.
2. Navigate to the backend folder:
   ```bash
   cd backend
   ```
3. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
4. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Create `.env` file from the sample:
   ```bash
   cp .env.example .env
   # Or on Windows PowerShell:
   copy .env.example .env
   ```
6. Add your Google Gemini API Key inside `.env`:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```
7. Start the FastAPI backend server:
   ```bash
   uvicorn app:app --reload --port 8000
   ```

### Frontend Setup
1. In a new terminal, from the root folder `agent-apl`:
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the displayed URL (usually `http://localhost:5173`) in your browser.

---

## ⚠️ Known Limitations
- **Volatile Storage**: Bookings are stored in-memory in the FastAPI application and clear upon server restart.
- **Mock Maps Key**: The tactical maps container coordinates are pre-configured locally.
- **Postpaid Checkout**: Slot reservations do not include a live payment gateway integration.

---

## 🗺️ Future Scope
- **LangGraph Multi-Agent Orchestration**: Maintain complex dialog memories and automated slot negotiation.
- **Supabase Integration**: Permanent PostgreSQL storage for user accounts, booking records, and venue metadata.
- **Real-Time Map SDKs**: Integrate Google Maps API Loader to fetch actual travel times and traffic conditions.

---

## 📸 Screenshots
*(Visuals showing the interface, interactive neighborhood maps, and live chat dialogs)*
![SportSphere AI Dashboard](file:///c:/Users/mukes/OneDrive/Documents/coding/agent-apl/docs/dashboard_mockup.png)
