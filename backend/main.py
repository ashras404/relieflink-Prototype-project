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

# Our temporary database (Now with GPS!)
# db_requests = [
#     {"id": 1, "location": "Zone A (Lucknow Center)", "urgency": 5, "shortage": 8, "distance_km": 15, "items": "50 Food Packets", "lat": 26.8467, "lng": 80.9462},
#     {"id": 2, "location": "Zone B (Gomti Nagar)", "urgency": 2, "shortage": 4, "distance_km": 5, "items": "15 Blankets", "lat": 26.8530, "lng": 80.9850},
#     {"id": 3, "location": "Zone C (Chinhat)", "urgency": 4, "shortage": 9, "distance_km": 60, "items": "20 Medicine Kits", "lat": 26.8700, "lng": 81.0000}
# ]
db_requests = [
    {"id": 1, "location": "Zone A (Lucknow Center)", "urgency": 5, "shortage": 8, "distance_km": 15, "items": "50 Food Packets", "lat": 26.8467, "lng": 80.9462},
    {"id": 2, "location": "Zone B (Gomti Nagar)", "urgency": 2, "shortage": 4, "distance_km": 5, "items": "15 Blankets", "lat": 26.8530, "lng": 80.9850},
    {"id": 3, "location": "Zone C (Chinhat)", "urgency": 4, "shortage": 9, "distance_km": 60, "items": "20 Medicine Kits", "lat": 26.8700, "lng": 81.0000},

    {"id": 4, "location": "Zone D (Alambagh)", "urgency": 3, "shortage": 6, "distance_km": 10, "items": "30 Water Bottles", "lat": 26.8190, "lng": 80.9060},
    {"id": 5, "location": "Zone E (Indira Nagar)", "urgency": 5, "shortage": 7, "distance_km": 12, "items": "40 Food Packets", "lat": 26.8780, "lng": 80.9990},
    {"id": 6, "location": "Zone F (Hazratganj)", "urgency": 4, "shortage": 5, "distance_km": 3, "items": "25 Medicine Kits", "lat": 26.8500, "lng": 80.9350},

    {"id": 7, "location": "Zone G (Charbagh)", "urgency": 3, "shortage": 8, "distance_km": 7, "items": "20 Blankets", "lat": 26.8310, "lng": 80.9220},
    {"id": 8, "location": "Zone H (Mahanagar)", "urgency": 2, "shortage": 3, "distance_km": 6, "items": "10 Food Packets", "lat": 26.8705, "lng": 80.9600},
    {"id": 9, "location": "Zone I (Kursi Road)", "urgency": 4, "shortage": 9, "distance_km": 18, "items": "35 Water Bottles", "lat": 26.9000, "lng": 80.9500},

    {"id": 10, "location": "Zone J (Faizabad Road)", "urgency": 5, "shortage": 10, "distance_km": 25, "items": "60 Food Packets", "lat": 26.8800, "lng": 81.0200},
    {"id": 11, "location": "Zone K (Sitapur Road)", "urgency": 3, "shortage": 6, "distance_km": 20, "items": "20 Medicine Kits", "lat": 26.9200, "lng": 80.9000},
    {"id": 12, "location": "Zone L (Rajajipuram)", "urgency": 2, "shortage": 5, "distance_km": 11, "items": "15 Blankets", "lat": 26.8400, "lng": 80.8800},

    {"id": 13, "location": "Zone M (Ashiyana)", "urgency": 4, "shortage": 7, "distance_km": 14, "items": "30 Food Packets", "lat": 26.8000, "lng": 80.9000},
    {"id": 14, "location": "Zone N (Telibagh)", "urgency": 3, "shortage": 4, "distance_km": 9, "items": "20 Water Bottles", "lat": 26.7800, "lng": 80.9400},
    {"id": 15, "location": "Zone O (Vrindavan Yojna)", "urgency": 5, "shortage": 8, "distance_km": 16, "items": "50 Medicine Kits", "lat": 26.7805, "lng": 80.9005},

    {"id": 16, "location": "Zone P (Dubagga)", "urgency": 2, "shortage": 6, "distance_km": 13, "items": "20 Blankets", "lat": 26.8505, "lng": 80.8500},
    {"id": 17, "location": "Zone Q (Malihabad)", "urgency": 4, "shortage": 9, "distance_km": 35, "items": "40 Food Packets", "lat": 26.9200, "lng": 80.7000},
    {"id": 18, "location": "Zone R (Bakshi Ka Talab)", "urgency": 3, "shortage": 7, "distance_km": 28, "items": "25 Water Bottles", "lat": 26.9700, "lng": 80.8000},

    {"id": 19, "location": "Zone S (Airport Area)", "urgency": 5, "shortage": 6, "distance_km": 22, "items": "30 Medicine Kits", "lat": 26.7600, "lng": 80.8800},
    {"id": 20, "location": "Zone T (PGI Area)", "urgency": 4, "shortage": 8, "distance_km": 17, "items": "45 Food Packets", "lat": 26.7700, "lng": 80.9200}
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