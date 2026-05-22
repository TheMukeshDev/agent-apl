# SportSphere AI Agents
# Lightweight Agentic Workflow for Lucknow Sports Discovery & Booking

import uuid

# Mock Database
VENUES_DATABASE = [
    {
        "id": "v-1",
        "name": "Gomti Nagar Badminton Court",
        "sport": "Badminton",
        "price": 150,
        "skill": "Beginner",
        "location": "Gomti Nagar"
    },
    {
        "id": "v-2",
        "name": "Chinhat Football Turf",
        "sport": "Football",
        "price": 300,
        "skill": "Intermediate",
        "location": "Chinhat"
    },
    {
        "id": "v-3",
        "name": "Lucknow Swimming Center",
        "sport": "Swimming",
        "price": 250,
        "skill": "Beginner",
        "location": "Aliganj"
    }
]

# In-Memory Bookings Store
BOOKINGS_DB = {}

# TODO: Future Integrations:
# - Gemini API: Use LLM function calling to route natural language requests to these agents.
# - LangChain/LangGraph: Build a multi-agent graph with specialized states and routers.
# - Database Integration: Replace these in-memory structures with Supabase/PostgreSQL.


class DiscoveryAgent:
    """Agent responsible for querying and filtering sports venues based on basic criteria."""
    
    def find_venues(self, sport=None, budget=None, skill=None, location=None):
        results = VENUES_DATABASE
        
        if sport:
            results = [v for v in results if v["sport"].lower() == sport.lower()]
            
        if location:
            results = [v for v in results if location.lower() in v["location"].lower()]
            
        if budget is not None:
            try:
                max_budget = float(budget)
                results = [v for v in results if v["price"] <= max_budget]
            except ValueError:
                pass
                
        if skill:
            results = [v for v in results if skill.lower() in v["skill"].lower() or v["skill"].lower() == "all levels"]
            
        return results


class RecommendationAgent:
    """Agent that ranks venues using a multi-criteria scoring algorithm (affordability, distance/location, skill match)."""
    
    def recommend(self, venues, sport=None, budget=None, skill=None, location=None):
        scored_venues = []
        
        for venue in venues:
            # 1. Affordability Score (0 to 1)
            affordability_score = 1.0
            if budget is not None:
                try:
                    max_budget = float(budget)
                    if venue["price"] <= max_budget:
                        # Perfect match or below budget
                        affordability_score = 1.0
                    else:
                        # Over budget, penalize proportionally
                        affordability_score = max(0.0, 1.0 - ((venue["price"] - max_budget) / max_budget))
                except ValueError:
                    pass
            
            # 2. Location/Distance Match Score (0 to 1)
            location_score = 1.0
            if location:
                if location.lower() in venue["location"].lower():
                    location_score = 1.0
                else:
                    # Non-matching location in Lucknow receives a penalty but isn't excluded completely
                    location_score = 0.3
            
            # 3. Skill Match Score (0 to 1)
            skill_score = 1.0
            if skill:
                v_skill = venue["skill"].lower()
                req_skill = skill.lower()
                if req_skill == v_skill or v_skill == "all levels":
                    skill_score = 1.0
                elif (req_skill == "beginner" and v_skill == "intermediate") or (req_skill == "intermediate" and v_skill == "beginner"):
                    skill_score = 0.6
                else:
                    skill_score = 0.2
            
            # Overall Score out of 100
            total_score = (affordability_score * 0.4 + location_score * 0.3 + skill_score * 0.3) * 100
            
            # Add score metadata to the venue dict copy
            venue_copy = dict(venue)
            venue_copy["score"] = round(total_score, 1)
            venue_copy["scoring_details"] = {
                "affordability": round(affordability_score * 100, 1),
                "location": round(location_score * 100, 1),
                "skill": round(skill_score * 100, 1)
            }
            scored_venues.append(venue_copy)
            
        # Sort venues by total score in descending order
        scored_venues.sort(key=lambda x: x["score"], reverse=True)
        return scored_venues


class BookingAgent:
    """Agent responsible for confirming a booking slot and writing it to memory."""
    
    def book_slot(self, venue_id, date, time_slot, user_name="Anonymous"):
        # Find venue name
        venue = next((v for v in VENUES_DATABASE if v["id"] == venue_id), None)
        if not venue:
            # Fallback if venue_name is passed instead of id
            venue = next((v for v in VENUES_DATABASE if v["name"].lower() == venue_id.lower()), None)
            
        if not venue:
            return {"success": False, "message": "Venue not found"}
            
        booking_id = f"SS-{uuid.uuid4().hex[:6].upper()}"
        booking = {
            "booking_id": booking_id,
            "venue_id": venue["id"],
            "venue_name": venue["name"],
            "sport": venue["sport"],
            "price": venue["price"],
            "location": venue["location"],
            "date": date,
            "time_slot": time_slot,
            "user_name": user_name,
            "status": "Confirmed"
        }
        
        BOOKINGS_DB[booking_id] = booking
        return {
            "success": True,
            "booking_id": booking_id,
            "booking": booking,
            "message": f"Booking successfully confirmed for {venue['name']} on {date} at {time_slot}."
        }


class CancellationAgent:
    """Agent responsible for canceling a booking from memory."""
    
    def cancel_booking(self, booking_id):
        if booking_id in BOOKINGS_DB:
            booking = BOOKINGS_DB[booking_id]
            booking["status"] = "Cancelled"
            # Keep record in DB but change status
            return {
                "success": True,
                "booking_id": booking_id,
                "message": f"Booking {booking_id} for {booking['venue_name']} has been successfully cancelled."
            }
        return {"success": False, "message": "Booking reference not found"}
