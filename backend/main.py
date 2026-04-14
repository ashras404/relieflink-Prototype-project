from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import the brain you built earlier!
from allocation_engine import calculate_priority_score

app = FastAPI()

# This is CRUCIAL: It allows your React frontend (port 5173) to talk to your Python backend (port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Our temporary database
db_requests = [
    {"id": 1, "location": "Zone A", "urgency": 5, "shortage": 8, "distance_km": 15, "items": "50 Food Packets"},
    {"id": 2, "location": "Zone B", "urgency": 2, "shortage": 4, "distance_km": 5, "items": "15 Blankets"},
    {"id": 3, "location": "Zone C", "urgency": 4, "shortage": 9, "distance_km": 60, "items": "20 Medicine Kits"}
]

@app.get("/")
def read_root():
    return {"message": "ReliefLink API is running!"}

@app.get("/api/urgent-needs")
def get_urgent_needs():
    """
    This calculates the AI score for all requests and returns the sorted list.
    """
    for req in db_requests:
        # Applying your exact math logic
        req["score"] = calculate_priority_score(req["urgency"], req["shortage"], req["distance_km"])
        
        # Convert numeric urgency to text so the frontend can color-code it
        if req["urgency"] >= 4:
            req["urgency_text"] = "Critical"
        elif req["urgency"] == 3:
            req["urgency_text"] = "High"
        else:
            req["urgency_text"] = "Medium"

    # Sort by score (highest first)
    sorted_requests = sorted(db_requests, key=lambda x: x["score"], reverse=True)
    return sorted_requests