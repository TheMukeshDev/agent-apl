# SportSphere AI Gemini Service
# Natural Language Parameter Extraction

import os
import json
import re
try:
    import google.generativeai as genai
    HAS_GEMINI_SDK = True
except ImportError:
    genai = None
    HAS_GEMINI_SDK = False
from config import settings

GEMINI_API_KEY = settings.GEMINI_API_KEY

if GEMINI_API_KEY and HAS_GEMINI_SDK:
    genai.configure(api_key=GEMINI_API_KEY)

# TODO: Future Integration:
# - LangGraph agents: Refactor to a full LangGraph agent workflow with state memory and tool routing.

def clean_json_response(text: str) -> str:
    """Removes markdown code blocks and other formatting from LLM response."""
    text = text.strip()
    # Strip ```json ... ```
    if text.startswith("```"):
        lines = text.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    return text

def fallback_parser(query: str) -> dict:
    """Simple regex/keyword based parser to extract query parameters if Gemini API is unavailable."""
    query_lower = query.lower()
    
    # 1. Sport extraction
    sport = None
    if "badminton" in query_lower:
        sport = "Badminton"
    elif "football" in query_lower or "soccer" in query_lower or "turf" in query_lower:
        sport = "Football"
    elif "swim" in query_lower or "pool" in query_lower:
        sport = "Swimming"
    elif "kabaddi" in query_lower:
        sport = "Kabaddi"
        
    # 2. Location extraction
    location = None
    if "gomti" in query_lower or "gomtinagar" in query_lower:
        location = "Gomti Nagar"
    elif "chinhat" in query_lower:
        location = "Chinhat"
    elif "aliganj" in query_lower:
        location = "Aliganj"
    elif "hazratganj" in query_lower:
        location = "Hazratganj"
        
    # 3. Budget extraction (looks for numbers, optionally preceded by ₹, rs, or under/below)
    budget = None
    budget_match = re.search(r'(?:under|below|rs\.?|₹)\s*(\d+)', query_lower)
    if budget_match:
        budget = float(budget_match.group(1))
    else:
        # Fallback to look for any number near budget keywords
        nums = re.findall(r'\b\d{2,4}\b', query_lower)
        if nums:
            # Let's check if the user said "budget" or "price" or "rupees"
            if any(k in query_lower for k in ["rs", "₹", "rupee", "budget", "under", "cheap", "cost"]):
                budget = float(nums[0])
                
    # 4. Skill extraction
    skill = None
    if "begin" in query_lower or "newbie" in query_lower or "easy" in query_lower:
        skill = "Beginner"
    elif "inter" in query_lower or "mid" in query_lower:
        skill = "Intermediate"
    elif "advance" in query_lower or "pro" in query_lower:
        skill = "Advanced"
        
    return {
        "sport": sport,
        "budget": budget,
        "skill": skill,
        "location": location,
        "source": "fallback_parser"
    }

def generate_recommendation(query: str) -> dict:
    """
    Extracts search parameters from a natural language query using Google's Gemini API.
    If the API key is not configured or an error occurs, falls back to keyword matching.
    """
    if not GEMINI_API_KEY or not HAS_GEMINI_SDK:
        print("[Gemini Service] GEMINI_API_KEY not found or google-generativeai package not installed. Using fallback keyword parser.")
        return fallback_parser(query)
        
    prompt = f"""
    You are an AI booking concierge for SportSphere AI in Lucknow. Your task is to analyze the user's search query and extract parameters in JSON format.
    
    Extract the following variables:
    1. "sport": The sport mentioned (e.g. "Badminton", "Football", "Swimming", "Kabaddi"). Capitalize the first letter.
    2. "budget": The maximum price the user is willing to pay per hour as a number (e.g., 200, 300). Convert any expressions like "under ₹200" or "below 200 rupees" into a numeric value.
    3. "skill": The player's skill level if mentioned (e.g. "Beginner", "Intermediate", "Advanced"). Capitalize the first letter.
    4. "location": The specific locality or neighborhood in Lucknow (e.g. "Gomti Nagar", "Chinhat", "Aliganj"). Format properly.

    User query: "{query}"

    Respond ONLY with a valid JSON object matching this schema. Use null for any fields that cannot be extracted. Do not add markdown blocks like ```json or any explanation.

    Format:
    {{
        "sport": "SportName" or null,
        "budget": 200 or null,
        "skill": "Beginner" or null,
        "location": "LocalityName" or null
    }}
    """
    
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        text = clean_json_response(response.text)
        
        parsed = json.loads(text)
        # Ensure correct schema
        result = {
            "sport": parsed.get("sport"),
            "budget": float(parsed["budget"]) if parsed.get("budget") is not None else None,
            "skill": parsed.get("skill"),
            "location": parsed.get("location"),
            "source": "gemini_api"
        }
        return result
    except Exception as e:
        print(f"[Gemini Service] Gemini API exception: {e}. Falling back to keyword parser.")
        return fallback_parser(query)
