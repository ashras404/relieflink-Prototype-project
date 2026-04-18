# 🌍 ReliefLink: AI-Powered Smart Supply Chain for Disaster Relief

> **Built for the 2026 Google Solution Challenge (Smart Supply Chains Track)**

ReliefLink is a full-stack, AI-driven logistics dashboard designed to solve the chaos of disaster relief resource allocation. When disaster strikes, NGOs and governments struggle with fragmented data, leading to misallocated supplies and delayed responses. ReliefLink aggregates on-ground requests and uses a custom allocation algorithm to route the right resources to the most critical zones instantly.

---

## 🚀 The Problem & Our Solution
**The Problem:** During floods, earthquakes, or crises, supply chain coordinators rely on chaotic WhatsApp groups and static spreadsheets. Critical time is lost deciding *where* to send limited resources like food, water, and medicine.
 
**The Solution:** ReliefLink acts as the "Brain" of the operation. 
1. Volunteers submit live requests from the field.
2. Our Python-based AI Engine instantly calculates a Priority Score based on urgency, current shortages, and transit distance.
3. The React dashboard visualizes these zones on a live map, allowing coordinators to dispatch resources with one click.

---

## ✨ Key Features
- **🧠 AI Allocation Engine:** Automatically sorts and prioritizes relief requests using a weighted mathematical model.
- **📊 Real-Time Dashboard:** A clean, high-visibility UI built for high-stress environments.
- **🗺️ Interactive Zoning (In Progress):** Geographic mapping of disaster zones to track hubs and critical shortage areas.
- **⚡ Fast-Action API:** Built on FastAPI to handle hundreds of concurrent requests without lag.

---

## 🛠️ Tech Stack
This project is built using a modern, decoupled Monorepo architecture:

**Frontend (The Face):**
- **React.js** (via Vite) for lightning-fast UI rendering.
- **Tailwind CSS v4** for utility-first, configuration-free styling.
- **Lucide React** for crisp, professional iconography.

**Backend (The Brain):**
- **Python 3** for data processing and logic.
- **FastAPI** for high-performance API routing and RESTful endpoints.
- **Uvicorn** as the ASGI web server.

---

## 🧮 How the AI Engine Works
Our allocation algorithm doesn't just look at "who asked first." It calculates a dynamic **Priority Score** using the following weighted parameters:

1. **Urgency Level (1-5):** How critical is the need? (e.g., Medical supplies > Blankets). *Weight: 40%*
2. **Shortage Ratio:** How many units are requested vs. how many are available? *Weight: 40%*
3. **Distance (km):** How far is the relief zone from the nearest supply hub? *Weight: 20%*

The Python engine processes these variables, normalizes the data, and returns a sorted JSON array to the React frontend in milliseconds.

---

## 💻 Local Setup & Installation
Want to run ReliefLink on your local machine? Follow these steps:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [Python](https://www.python.org/) installed on your computer.

### 1. Clone the Repository
```bash
git clone [https://github.com/ashras404/relieflink-Prototype-project.git]
cd relieflink-v2


Start the Backend (FastAPI)
Open a terminal and run:

Bash
cd backend
pip install fastapi uvicorn
uvicorn main:app --reload
The API will be available at http://localhost:8000

Start the Frontend (React)
Open a second terminal and run:

Bash
cd frontend
npm install
npm run dev
The Dashboard will be available at http://localhost:5173



