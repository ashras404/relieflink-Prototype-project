# allocation_engine.py

def calculate_priority_score(urgency, shortage_level, distance):
    """
    Calculates the priority of a request.
    Higher score = Higher priority.
    """
    # Weights define how important each factor is (you can tweak these later)
    WEIGHT_URGENCY = 0.5    # 50% importance
    WEIGHT_SHORTAGE = 0.3   # 30% importance
    WEIGHT_DISTANCE = 0.2   # 20% importance (closer is better, so we invert distance later)

    # 1. Normalize Urgency (Assuming 1=Low, 5=Critical)
    urgency_score = urgency * WEIGHT_URGENCY

    # 2. Normalize Shortage (Assuming 0 to 10 scale, 10 being critical shortage)
    shortage_score = shortage_level * WEIGHT_SHORTAGE

    # 3. Normalize Distance (Assuming closer gets higher score. e.g., 100km max range)
    # If distance is 10km, score is higher than if distance is 90km
    max_distance = 100 
    distance_score = ((max_distance - distance) / max_distance) * 10 * WEIGHT_DISTANCE

    # Final Score
    total_score = urgency_score + shortage_score + distance_score
    return round(total_score, 2)

# --- Let's test it with dummy data ---
if __name__ == "__main__":
    requests = [
        {"id": 1, "location": "Zone A", "urgency": 5, "shortage": 8, "distance_km": 15},
        {"id": 2, "location": "Zone B", "urgency": 2, "shortage": 4, "distance_km": 5},
        {"id": 3, "location": "Zone C", "urgency": 4, "shortage": 9, "distance_km": 60}
    ]

    print("--- ReliefLink AI Allocation Test ---")
    for req in requests:
        score = calculate_priority_score(req["urgency"], req["shortage"], req["distance_km"])
        req["priority_score"] = score
        
    # Sort the requests from highest score to lowest
    sorted_requests = sorted(requests, key=lambda x: x["priority_score"], reverse=True)

    for req in sorted_requests:
        print(f"Location: {req['location']} | Score: {req['priority_score']} (Urgency: {req['urgency']})")