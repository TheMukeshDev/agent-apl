from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os

# Initialize FastAPI App
app = FastAPI(
    title="SportSphere AI Backend",
    description="Agentic sports infrastructure discovery and booking platform API",
    version="0.1.0"
)

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # TODO: Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Schemas ---

class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = "anonymous"

class ChatResponse(BaseModel):
    response: str
    suggested_venues: List[dict]
    booking_intent_detected: bool
    extracted_parameters: dict

class BookingRequest(BaseModel):
    venue_id: str
    slot: str
    user_id: str

# --- Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Welcome to the SportSphere AI API. Lucknow Sports Discovery Agent active."}

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_agent(payload: ChatRequest):
    """
    TODO: Integrations planned for Phase 3:
    1. Initialize the Google Gemini API client with GEMINI_API_KEY.
    2. Define system instructions for the SportSphere AI Agent (behavior, scope limited to Lucknow).
    3. Register tool functions:
       - `list_venues(sport, area)` -> Query database
       - `check_slot_availability(venue_id, slot)` -> Verify in database
       - `book_slot(venue_id, user_id, slot)` -> Record booking
    4. Call the model with user query & allow it to execute tools dynamically.
    5. Return the agent conversation and any parsed/structured visual elements.
    """
    
    user_message = payload.message.lower()
    
    # Mock fallback logic for initial demo
    mock_extracted_params = {
        "sport": "badminton" if "badminton" in user_message else "unknown",
        "location": "gomti nagar" if "gomti" in user_message or "gomtinagar" in user_message else "lucknow",
        "time": "evening" if "evening" in user_message or "night" in user_message else "anytime"
    }
    
    # Mock venue lists based on inputs
    mock_venues = []
    if "badminton" in user_message:
        mock_venues = [
            {
                "id": "v-001",
                "name": "Gomti Nagar Badminton Arena",
                "sport": "Badminton",
                "area": "Gomti Nagar",
                "price_per_hour": 350.0,
                "rating": 4.7,
                "coordinates": {"lat": 26.8549, "lng": 80.9992}
            },
            {
                "id": "v-002",
                "name": "Aliganj Sports Club",
                "sport": "Badminton",
                "area": "Aliganj",
                "price_per_hour": 300.0,
                "rating": 4.5,
                "coordinates": {"lat": 26.8929, "lng": 80.9413}
            }
        ]

    is_booking_intent = "book" in user_message or "reserve" in user_message

    return ChatResponse(
        response=f"Hi there! I detected you're looking for sports spaces in Lucknow. Here is what I found for '{user_message}':",
        suggested_venues=mock_venues,
        booking_intent_detected=is_booking_intent,
        extracted_parameters=mock_extracted_params
    )

@app.get("/api/venues")
async def get_venues(sport: Optional[str] = None, area: Optional[str] = None):
    """
    TODO: Integrations planned for Phase 2:
    - Establish connection to Supabase or Firebase client.
    - Query the 'venues' table.
    - Filter by sport and location area.
    """
    return {
        "status": "success",
        "venues": [
            {
                "id": "v-001",
                "name": "Gomti Nagar Badminton Arena",
                "sport": "Badminton",
                "area": "Gomti Nagar",
                "available_slots": ["06:00 PM - 07:00 PM", "07:00 PM - 08:00 PM"]
            }
        ]
    }

@app.post("/api/bookings")
async def create_booking(booking: BookingRequest):
    """
    TODO: Integrations planned for Phase 5:
    - Check lock on slot availability to prevent double-booking.
    - Write record into the 'bookings' table.
    - Dispatch mock booking confirmation SMS/Email.
    """
    return {
        "status": "confirmed",
        "booking_id": "b-9999",
        "venue_id": booking.venue_id,
        "slot": booking.slot,
        "message": f"Successfully reserved slot {booking.slot}!"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
