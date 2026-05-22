from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os

from agents import DiscoveryAgent, RecommendationAgent, BookingAgent, CancellationAgent, VENUES_DATABASE

# Initialize FastAPI App
app = FastAPI(
    title="SportSphere AI Backend",
    description="Agentic sports infrastructure discovery and booking platform API for Lucknow",
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

# Initialize Agent Instances
discovery_agent = DiscoveryAgent()
recommendation_agent = RecommendationAgent()
booking_agent = BookingAgent()
cancellation_agent = CancellationAgent()

# --- Data Schemas ---

class RecommendRequest(BaseModel):
    sport: Optional[str] = None
    budget: Optional[float] = None
    skill: Optional[str] = None
    location: Optional[str] = None

class BookRequest(BaseModel):
    venue_id: str
    date: str
    time_slot: str
    user_name: Optional[str] = "Anonymous"

class CancelRequest(BaseModel):
    booking_id: str

class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = "anonymous"

class ChatResponse(BaseModel):
    response: str
    suggested_venues: List[dict]
    booking_intent_detected: bool
    extracted_parameters: dict

# --- Endpoints ---

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Welcome to the SportSphere AI API. Lucknow Sports Discovery Agent active."
    }

@app.get("/venues")
async def get_venues(
    sport: Optional[str] = None, 
    location: Optional[str] = None, 
    budget: Optional[float] = None, 
    skill: Optional[str] = None
):
    """
    Get and filter venues in Lucknow.
    """
    venues = discovery_agent.find_venues(
        sport=sport, 
        budget=budget, 
        skill=skill, 
        location=location
    )
    return {
        "status": "success",
        "count": len(venues),
        "venues": venues
    }

@app.post("/recommend")
async def get_recommendations(req: RecommendRequest):
    """
    Find and rank venues based on user preferences using a multi-criteria agent.
    """
    # 1. Discovery
    venues = discovery_agent.find_venues(
        sport=req.sport, 
        budget=req.budget, 
        skill=req.skill, 
        location=req.location
    )
    
    # If no exact match found, fall back to all venues for scoring
    if not venues:
        venues = VENUES_DATABASE
        
    # 2. Recommendation Scoring
    recommended_venues = recommendation_agent.recommend(
        venues, 
        sport=req.sport, 
        budget=req.budget, 
        skill=req.skill, 
        location=req.location
    )
    
    return {
        "status": "success",
        "count": len(recommended_venues),
        "venues": recommended_venues
    }

@app.post("/book")
async def book_slot(req: BookRequest):
    """
    Book a slot at a venue. Managed in-memory.
    """
    result = booking_agent.book_slot(
        venue_id=req.venue_id,
        date=req.date,
        time_slot=req.time_slot,
        user_name=req.user_name
    )
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    return result

@app.post("/cancel")
async def cancel_booking(req: CancelRequest):
    """
    Cancel an existing booking. Managed in-memory.
    """
    result = cancellation_agent.cancel_booking(booking_id=req.booking_id)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    return result

# Maintain chat route for backward compatibility / LLM agent chat support
@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_agent(payload: ChatRequest):
    user_message = payload.message.lower()
    
    # Simple fallback parser
    sport = "Badminton" if "badminton" in user_message else ("Football" if "football" in user_message else ("Swimming" if "swimming" in user_message else None))
    location = "Gomti Nagar" if "gomti" in user_message else ("Chinhat" if "chinhat" in user_message else ("Aliganj" if "aliganj" in user_message else None))
    budget = 200.0 if "cheap" in user_message or "budget" in user_message or "200" in user_message else None
    
    venues = discovery_agent.find_venues(sport=sport, location=location, budget=budget)
    recommended = recommendation_agent.recommend(venues if venues else VENUES_DATABASE, sport=sport, location=location, budget=budget)
    
    is_booking_intent = any(keyword in user_message for keyword in ["book", "reserve", "slot", "confirm"])
    
    return ChatResponse(
        response=f"I've scanned the Lucknow sports grid for you. Here is my current assessment:",
        suggested_venues=recommended[:2],
        booking_intent_detected=is_booking_intent,
        extracted_parameters={
            "sport": sport or "any",
            "location": location or "any",
            "budget": budget or "any"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
