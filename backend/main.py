from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import random

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
    {"id": 20, "location": "Zone T (PGI Area)", "urgency": 4, "shortage": 8, "distance_km": 17, "items": "45 Food Packets", "lat": 26.7700, "lng": 80.9200},
    {"id": 21, "location": "Zone V (Vikas Nagar Slum)", "urgency": 5, "shortage": 10, "distance_km": 2, "items": "Emergency Relief: Massive Slum Fire", "lat": 26.8920, "lng": 80.9520}
]

# --- VOLUNTEER DATABASE GENERATED (30 per zone) ---
db_volunteers = []
roles = ["Disaster Relief", "Medical Assistant", "Logistics Specialist", "Search & Rescue", "Relief Coordinator"]
names_first = ["Rajesh", "Neha", "Deepak", "Priya", "Vikram", "Ananya", "Sanjay", "Meera", "Arjun", "Aditi"]
names_last = ["Kumar", "Singh", "Verma", "Mishra", "Sharma", "Gupta", "Yadav", "Patel"]

vol_id = 1
# We have 21 zones (Zone A to Zone V excluding U)
zones = [f"Zone {c}" for c in "ABCDEFGHIJKLMNPQRSTV"] + ["Zone O"] # Match frontend zones
for zone_name in zones:
    for i in range(30):
        db_volunteers.append({
            "id": vol_id,
            "name": f"{random.choice(names_first)} {random.choice(names_last)}",
            "role": random.choice(roles),
            "rating": random.randint(3, 5),
            "status": random.choice(["Available", "Active", "En Route"]),
            "zone": zone_name,
            "img": f"/vol_{random.randint(1, 4)}.png"
        })
        vol_id += 1

class RequestModel(BaseModel):
    items: str
    location: str
    urgency: Optional[int] = None
    shortage: Optional[int] = None
    distance_km: Optional[int] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

@app.get("/")
def read_root():
    return {"message": "ReliefLink API is running!", "status": "Ready"}

@app.get("/api/volunteers")
def get_volunteers():
    return db_volunteers

@app.get("/api/urgent-needs")
def get_urgent_needs():
    """
    Calculates the AI score for all requests and returns the sorted list.
    """
    processed_requests = []
    for req in db_requests:
        # Applying priority math
        score = calculate_priority_score(req["urgency"], req["shortage"], req["distance_km"])
        
        # Clone to avoid mutating original db if needed, but for prototype it's fine
        req_with_score = req.copy()
        req_with_score["score"] = score
        
        if req["urgency"] >= 4:
            req_with_score["urgency_text"] = "Critical"
        elif req["urgency"] == 3:
            req_with_score["urgency_text"] = "High"
        else:
            req_with_score["urgency_text"] = "Medium"
        
        processed_requests.append(req_with_score)

    # Sort by score (highest first)
    return sorted(processed_requests, key=lambda x: x["score"], reverse=True)

@app.post("/api/requests")
def add_request(req: RequestModel):
    new_id = max([r["id"] for r in db_requests]) + 1 if db_requests else 1
    
    is_urgent = "urgent" in req.items.lower() or "fire" in req.items.lower() or "critical" in req.items.lower()
    
    new_req = {
        "id": new_id,
        "location": req.location,
        "urgency": req.urgency if req.urgency is not None else (5 if is_urgent else 3),
        "shortage": req.shortage if req.shortage is not None else random.randint(5, 10),
        "distance_km": req.distance_km if req.distance_km is not None else random.randint(2, 40),
        "items": req.items,
        "lat": req.lat if req.lat is not None else 26.8467,
        "lng": req.lng if req.lng is not None else 80.9462
    }
    db_requests.append(new_req)
    return new_req

@app.post("/api/allocate")
def run_allocation():
    """
    Backend implementation of the AI Auto-Assignment logic.
    Finds critical needs and assigns available volunteers.
    """
    # 1. Get critical needs (urgency >= 4)
    critical_needs = [r for r in db_requests if r["urgency"] >= 4]
    
    # 2. Find available volunteers
    available_vols = [v for v in db_volunteers if v["status"] == "Available"]
    
    assignments = []
    assigned_count = 0
    
    for need in critical_needs:
        if assigned_count < len(available_vols):
            vol = available_vols[assigned_count]
            vol["status"] = "Active"
            vol["zone"] = need["location"].split(" (")[0] if " (" in need["location"] else need["location"]
            
            assignments.append({
                "volunteer": vol["name"],
                "location": need["location"],
                "items": need["items"]
            })
            assigned_count += 1
            
    return {
        "status": "success",
        "assigned_count": assigned_count,
        "assignments": assignments,
        "message": f"Successfully dispatched {assigned_count} volunteers to critical zones."
    }