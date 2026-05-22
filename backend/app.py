from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os

from agents import DiscoveryAgent, RecommendationAgent, BookingAgent, CancellationAgent, VENUES_DATABASE
from gemini_service import generate_recommendation

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

# Maintain chat route for conversational LLM agent discovery
@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_agent(payload: ChatRequest):
    user_message = payload.message
    
    # Call Gemini parser to extract parameters
    extracted = generate_recommendation(user_message)
    
    sport = extracted.get("sport")
    location = extracted.get("location")
    budget = extracted.get("budget")
    skill = extracted.get("skill")
    source = extracted.get("source", "fallback_parser")
    
    # Discover
    venues = discovery_agent.find_venues(
        sport=sport, 
        budget=budget, 
        skill=skill, 
        location=location
    )
    
    # Fallback to general list for recommendation scoring if none found
    if not venues:
        venues = VENUES_DATABASE
        
    # Rank
    recommended = recommendation_agent.recommend(
        venues, 
        sport=sport, 
        budget=budget, 
        skill=skill, 
        location=location
    )
    
    # Build a conversational response based on extraction
    source_tag = "Gemini LLM" if source == "gemini_api" else "rule-based parser"
    
    criteria = []
    if sport: criteria.append(f"sport: {sport}")
    if location: criteria.append(f"location: {location}")
    if budget: criteria.append(f"budget under ₹{budget}")
    if skill: criteria.append(f"skill: {skill}")
    
    if criteria:
        agent_response = f"I've analyzed your query using our {source_tag}. Scanning sports venues matching {', '.join(criteria)}."
    else:
        agent_response = f"I've scanned the Lucknow sports network. Here are some options you might like:"
        
    if recommended:
        top_venue = recommended[0]
        agent_response += f" My top recommendation is **{top_venue['name']}** in {top_venue['location']} for ₹{top_venue['price']}/hr ({top_venue['skill']} level)."
        if len(recommended) > 1:
            agent_response += f" Alternatively, you can check out **{recommended[1]['name']}**."
            
    is_booking_intent = any(keyword in user_message.lower() for keyword in ["book", "reserve", "slot", "confirm"])
    if is_booking_intent and recommended:
        agent_response += " Would you like to book a slot for this venue now?"
        
    return ChatResponse(
        response=agent_response,
        suggested_venues=recommended[:3],
        booking_intent_detected=is_booking_intent,
        extracted_parameters={
            "sport": sport or "any",
            "location": location or "any",
            "budget": budget or "any",
            "skill": skill or "any"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
