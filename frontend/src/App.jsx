import React, { useState, useEffect } from "react";
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Users,
  Package,
  AlertTriangle,
  Activity,
  Map as MapIcon,
  Zap,
  Clock,
  CheckCircle2,
  Mic,
} from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from "react-leaflet";

const ALL_ZONES = [
  { id: 1, name: "Zone A", area: "Lucknow Center", urgency: 5, lat: 26.8467, lng: 80.9462, items: "50 Food Packets" },
  { id: 2, name: "Zone B", area: "Gomti Nagar", urgency: 2, lat: 26.8530, lng: 80.9850, items: "15 Blankets" },
  { id: 3, name: "Zone C", area: "Chinhat", urgency: 4, lat: 26.8700, lng: 81.0000, items: "20 Medicine Kits" },
  { id: 4, name: "Zone D", area: "Alambagh", urgency: 3, lat: 26.8190, lng: 80.9060, items: "30 Water Bottles" },
  { id: 5, name: "Zone E", area: "Indira Nagar", urgency: 5, lat: 26.8780, lng: 80.9990, items: "40 Food Packets" },
  { id: 6, name: "Zone F", area: "Hazratganj", urgency: 4, lat: 26.8500, lng: 80.9350, items: "25 Medicine Kits" },
  { id: 7, name: "Zone G", area: "Charbagh", urgency: 3, lat: 26.8310, lng: 80.9220, items: "20 Blankets" },
  { id: 8, name: "Zone H", area: "Mahanagar", urgency: 2, lat: 26.8705, lng: 80.9600, items: "10 Food Packets" },
  { id: 9, name: "Zone I", area: "Kursi Road", urgency: 4, lat: 26.9000, lng: 80.9500, items: "35 Water Bottles" },
  { id: 10, name: "Zone J", area: "Faizabad Road", urgency: 5, lat: 26.8800, lng: 81.0200, items: "60 Food Packets" },
  { id: 11, name: "Zone K", area: "Sitapur Road", urgency: 3, lat: 26.9200, lng: 80.9000, items: "20 Medicine Kits" },
  { id: 12, name: "Zone L", area: "Rajajipuram", urgency: 2, lat: 26.8400, lng: 80.8800, items: "15 Blankets" },
  { id: 13, name: "Zone M", area: "Ashiyana", urgency: 4, lat: 26.8000, lng: 80.9000, items: "30 Food Packets" },
  { id: 14, name: "Zone N", area: "Telibagh", urgency: 3, lat: 26.7800, lng: 80.9400, items: "20 Water Bottles" },
  { id: 15, name: "Zone O", area: "Vrindavan Yojna", urgency: 5, lat: 26.7805, lng: 80.9005, items: "50 Medicine Kits" },
  { id: 16, name: "Zone P", area: "Dubagga", urgency: 2, lat: 26.8505, lng: 80.8500, items: "20 Blankets" },
  { id: 17, name: "Zone Q", area: "Malihabad", urgency: 4, lat: 26.9200, lng: 80.7000, items: "40 Food Packets" },
  { id: 18, name: "Zone R", area: "Bakshi Ka Talab", urgency: 3, lat: 26.9700, lng: 80.8000, items: "25 Water Bottles" },
  { id: 19, name: "Zone S", area: "Airport Area", urgency: 5, lat: 26.7600, lng: 80.8800, items: "30 Medicine Kits" },
  { id: 20, name: "Zone T", area: "PGI Area", urgency: 4, lat: 26.7700, lng: 80.9200, items: "45 Food Packets" },
  { id: 21, name: "Zone V", area: "Vikas Nagar", urgency: 5, lat: 26.8920, lng: 80.9520, items: "Emergency Relief: Massive Slum Fire" },
];

function getZoneColor(urgency) {
  if (urgency >= 4) return '#ef4444';
  if (urgency === 3) return '#f97316';
  return '#eab308';
}

function getZoneLabel(urgency) {
  if (urgency >= 4) return 'Critical';
  if (urgency === 3) return 'High';
  return 'Medium';
}

function getRequestType(items = "") {
  const text = items.toLowerCase();
  if (text.includes("food") || text.includes("packet") || text.includes("meal")) return "food";
  if (text.includes("med") || text.includes("doctor") || text.includes("oxygen") || text.includes("health")) return "medical";
  if (text.includes("water") || text.includes("drink")) return "water";
  if (text.includes("shelter") || text.includes("tent") || text.includes("blanket")) return "shelter";
  return "general";
}

export default function App() {
  const [requestInput, setRequestInput] = useState("");
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isAssigning, setIsAssigning] = useState(false);

  // Profile images paths
  const IMG_VOL_1 = "/vol_1.png"; // Male
  const IMG_VOL_2 = "/vol_2.png"; // Female
  const IMG_VOL_3 = "/vol_3.png"; // Male
  const IMG_VOL_4 = "/vol_4.png"; // Female

  // --- Embedded priority scoring ---
  function calculatePriorityScore(urgency, shortage, distance) {
    const urgencyScore = urgency * 0.5;
    const shortageScore = shortage * 0.3;
    const distanceScore = ((100 - distance) / 100) * 10 * 0.2;
    return Math.round((urgencyScore + shortageScore + distanceScore) * 100) / 100;
  }

  // --- Mock data updated to match image style ---
  const FALLBACK_REQUESTS = [
    { id: 1, location: "Area A", title: "Food Distribution", urgency: 5, shortage: 100, distance_km: 15, items: "5000 units needed", lat: 26.8467, lng: 80.9462, type: 'food' },
    { id: 2, location: "Area B", title: "Medical Help", urgency: 4, shortage: 16, distance_km: 5, items: "8 oxygen tanks needed", lat: 26.8530, lng: 80.9850, type: 'medical' },
    { id: 3, location: "Area C", title: "Shelter Material", urgency: 3, shortage: 5, distance_km: 60, items: "20 tent kits needed", lat: 26.8700, lng: 81.0000, type: 'shelter' },
    { id: 4, location: "Area D", title: "Water Supply", urgency: 2, shortage: 2, distance_km: 10, items: "100 cases needed", lat: 26.8190, lng: 80.9060, type: 'water' },
  ];

  const FALLBACK_VOLUNTEERS = ALL_ZONES.flatMap((zone, zIdx) => 
    Array.from({ length: 30 }).map((_, vIdx) => ({
      id: zIdx * 30 + vIdx + 1,
      name: `${["Aarav", "Vihaan", "Aditya", "Saiya", "Ananya", "Ishani", "Priya", "Arjun"][vIdx % 8]} ${["Sharma", "Singh", "Verma", "Patel", "Mishra", "Kumar"][vIdx % 6]}`,
      role: ["Relief", "Disaster", "Medical", "Logistics", "Rescue"][vIdx % 5],
      rating: Math.floor(Math.random() * 2) + 3,
      status: ["Available", "Active", "En Route"][vIdx % 3],
      zone: zone.name,
      img: (zIdx * 30 + vIdx) % 2 === 0 ? IMG_VOL_1 : IMG_VOL_2
    }))
  );

  const [urgentNeeds, setUrgentNeeds] = useState(FALLBACK_REQUESTS);
  const [volunteers, setVolunteers] = useState(FALLBACK_VOLUNTEERS);
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, name: "Rajesh Kumar", action: "Delivered", detail: "50 Food Packets Area B", time: "2m ago", img: IMG_VOL_1 }, // Male
    { id: 2, name: "Neha Sharma", action: "Delivered", detail: "Medicines to Area C", time: "15m ago", img: IMG_VOL_2 }, // Female
    { id: 3, name: "Dr. Antta Patel", action: "Completed", detail: "Assigned medical kits - Area B", time: "1h ago", img: IMG_VOL_4 }, // Female
  ]);

  useEffect(() => {
    fetch("http://localhost:8000/api/urgent-needs")
      .then(res => res.json())
      .then(data => setUrgentNeeds(data))
      .catch(() => {});
    fetch('http://localhost:8000/api/volunteers')
      .then(res => res.json())
      .then(data => setVolunteers(data))
      .catch(() => {});
  }, []);

  const handleAssignAutomatically = () => {
    setIsAssigning(true);
    fetch("http://localhost:8000/api/allocate", { method: "POST" })
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          fetch('http://localhost:8000/api/volunteers').then(res => res.json()).then(setVolunteers);
          fetch('http://localhost:8000/api/urgent-needs').then(res => res.json()).then(setUrgentNeeds);
          setRecentActivity(prev => [{ id: Date.now(), name: "System", action: "Auto-Allocated", detail: data.message, time: "Just now", img: IMG_VOL_1 }, ...prev]);
          setActiveTab("Insights");
        }
      })
      .finally(() => setIsAssigning(false));
  };

  const [isListening, setIsListening] = useState(false);

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-IN'; // Optimized for Indian English
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setRequestInput(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleSubmitRequest = () => {
    if (!requestInput.trim()) return;
    const randomZone = ALL_ZONES[Math.floor(Math.random() * ALL_ZONES.length)];
    fetch("http://localhost:8000/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: requestInput, location: randomZone.name, lat: randomZone.lat, lng: randomZone.lng })
    }).then(() => fetch("http://localhost:8000/api/urgent-needs").then(res => res.json()).then(setUrgentNeeds));
    setRequestInput("");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans pb-10">
      {/* Header */}
      <header className="bg-white px-8 py-4 shadow-sm border-b border-slate-100 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2 text-[#0ea5e9] font-bold text-2xl">
          <div className="bg-[#0ea5e9] text-white p-1.5 rounded-full">
            <MapPin size={22} fill="white" />
          </div>
          <span className="text-slate-800 tracking-tight">
            Relief<span className="text-[#0ea5e9]">Link</span>
          </span>
        </div>

        <nav className="hidden md:flex gap-10 text-[13px] font-bold text-slate-400">
          {["Home", "Dashboard", "Active Zones", "Volunteers Fleet", "Insights", "API"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`transition-colors ${activeTab === tab ? "text-[#0ea5e9]" : "hover:text-slate-600"}`}>
              {tab}
            </button>
          ))}
        </nav>

        <button 
          onClick={handleAssignAutomatically}
          disabled={isAssigning}
          className="bg-[#1d4ed8] text-white px-6 py-2.5 rounded-lg text-[13px] font-bold transition-all hover:bg-[#1e40af] shadow-md active:scale-95 disabled:opacity-50">
          {isAssigning ? 'Processing...' : 'Assign Automatically'}
        </button>
      </header>

      <main className="max-w-[1100px] mx-auto pt-10 px-4 space-y-10">
        {activeTab === "Home" && (
          <div className="py-20 text-center space-y-10">
            <div className="space-y-4">
              <h1 className="text-6xl font-black text-slate-800 tracking-tighter">
                Smart Relief <span className="text-[#0ea5e9]">Logistics</span>
              </h1>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
                AI-driven resource allocation for disaster management. Connect volunteers, 
                track supplies, and save lives with real-time data.
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <button onClick={() => setActiveTab("Dashboard")} className="bg-[#1d4ed8] text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-[#1e40af] transition-all hover:-translate-y-1">
                Open Dashboard
              </button>
              <button onClick={() => setActiveTab("Active Zones")} className="bg-white text-slate-800 border-2 border-slate-100 px-10 py-4 rounded-2xl font-bold text-lg shadow-sm hover:bg-slate-50 transition-all">
                View Active Zones
              </button>
            </div>
            <div className="pt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {[
                { title: "AI Powered", desc: "Automated priority scoring based on urgency and shortages.", icon: <Zap /> },
                { title: "Live Tracking", desc: "Real-time geographic mapping of disaster zones and hubs.", icon: <MapIcon /> },
                { title: "Smart Fleet", desc: "Dynamic volunteer dispatching and task management.", icon: <Users /> }
              ].map((feat, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="text-[#0ea5e9]">{feat.icon}</div>
                  <h3 className="text-xl font-bold text-slate-800">{feat.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Dashboard" && (
          <>
            {/* Add Request Section */}
            <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Add Request</h2>
                <button 
                  onClick={handleSubmitRequest}
                  className="bg-[#1d4ed8] text-white px-8 py-2.5 rounded-lg text-sm font-bold transition-all hover:bg-[#1e40af] shadow-md">
                  Add Request
                </button>
              </div>
              <div className="relative group">
                <input
                  type="text"
                  value={requestInput}
                  onChange={(e) => setRequestInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitRequest()}
                  placeholder={isListening ? "Listening... Speak now" : "Urgent: Need 50 food packets for flood victims in Area A"}
                  className={`w-full bg-[#f1f5f9] border-none text-slate-700 outline-none px-6 py-4 rounded-xl text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-[#0ea5e9] transition-all ${isListening ? 'ring-2 ring-red-400 placeholder:text-red-400' : ''}`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                  <button 
                    onClick={handleVoiceInput}
                    className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-400 hover:text-[#0ea5e9] hover:bg-blue-50'}`}>
                    <Mic size={20} fill={isListening ? "currentColor" : "none"} />
                  </button>
                  <button className="text-slate-400 hover:text-slate-600">
                    <Zap size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Middle Row: Urgent Needs & Volunteers Fleet */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Urgent Needs */}
              <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col overflow-hidden h-[450px]">
                <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="font-black text-lg text-slate-800">Urgent Needs</h3>
                  <button className="text-[11px] font-bold text-slate-400 flex items-center gap-1 hover:text-[#0ea5e9] transition-colors">
                    Expand <Zap size={10} className="rotate-90" />
                  </button>
                </div>
                <div className="p-4 space-y-4 overflow-y-auto flex-1">
                  {urgentNeeds.map((req) => {
                    const reqType = req.type || getRequestType(req.items);
                    return (
                      <div key={req.id} className="p-4 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 flex justify-between items-center group cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-lg ${
                            reqType === 'food' ? 'bg-orange-100 text-orange-600' :
                            reqType === 'medical' ? 'bg-blue-100 text-blue-600' :
                            reqType === 'shelter' ? 'bg-red-100 text-red-600' :
                            reqType === 'water' ? 'bg-cyan-100 text-cyan-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                            {reqType === 'food' ? <Package size={20} /> : 
                             reqType === 'medical' ? <Activity size={20} /> :
                             reqType === 'shelter' ? <MapPin size={20} /> : 
                             reqType === 'water' ? <Zap size={20} /> : <Zap size={20} />}
                          </div>
                          <div>
                            <h4 className="text-[13px] font-bold text-slate-800 group-hover:text-[#0ea5e9] transition-colors">
                              {req.title || "Request"}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-medium">{req.location.split(' (')[0]}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${req.urgency >= 4 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                            {req.urgency >= 4 ? 'CRITICAL' : 'HIGH'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Volunteers Fleet */}
              <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col overflow-hidden h-[450px]">
                <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="font-black text-lg text-slate-800">Volunteers Fleet</h3>
                  <button className="text-[11px] font-bold text-slate-400 flex items-center gap-1 hover:text-[#0ea5e9] transition-colors">
                    Manage Fleet <Zap size={10} className="rotate-90" />
                  </button>
                </div>
                <div className="p-4 space-y-4 overflow-y-auto flex-1">
                  {volunteers.slice(0, 15).map((vol) => (
                    <div key={vol.id} className="p-3 rounded-xl flex justify-between items-center hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                      <div className="flex items-center gap-3">
                        <img src={vol.img || IMG_VOL_1} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100" alt="" />
                        <div>
                          <h4 className="text-[13px] font-bold text-slate-800">{vol.name}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{vol.role}</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-1 rounded-full ${
                        vol.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {vol.status}
                      </span>
                    </div>
                  ))}
                  <button onClick={() => setActiveTab("Volunteers Fleet")} className="w-full py-3 text-xs font-bold text-[#4f46e5] bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
                    View Entire Fleet ({volunteers.length})
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Row: Live Map & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Live Map */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative">
                <div className="absolute top-4 left-4 z-[1000] bg-white px-4 py-2 rounded-xl shadow-md border border-slate-100">
                  <h3 className="text-xs font-black text-slate-800 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    Live Map
                  </h3>
                </div>
                <MapContainer center={[26.8600, 80.9200]} zoom={11} style={{ height: '400px', width: '100%' }} scrollWheelZoom={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {ALL_ZONES.map((zone) => (
                    <CircleMarker key={zone.id} center={[zone.lat, zone.lng]} radius={zone.urgency >= 4 ? 20 : 12} pathOptions={{ 
                      color: zone.urgency >= 4 ? '#ef4444' : '#0ea5e9',
                      fillColor: zone.urgency >= 4 ? '#ef4444' : '#0ea5e9',
                      fillOpacity: 0.2
                    }}>
                      <Tooltip permanent direction="top" className="map-tooltip">
                        <span className="font-bold text-[10px]">{zone.name}</span>
                      </Tooltip>
                    </CircleMarker>
                  ))}
                </MapContainer>
                {/* Map Overlays */}
                <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
                  <div className="bg-white p-2 rounded-lg shadow-md border border-slate-100 flex items-center gap-2">
                    <Zap size={14} className="text-blue-600" />
                    <span className="text-[11px] font-bold">24 Active Zones</span>
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 z-[1000] bg-white px-4 py-2 rounded-full shadow-md border border-slate-100 flex items-center gap-4 text-[10px] font-bold text-slate-500">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Critical</div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Stable</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col">
                <div className="px-6 py-5 border-b border-slate-50">
                  <h3 className="font-black text-lg text-slate-800">Recent Activity</h3>
                </div>
                <div className="p-4 space-y-6">
                  {recentActivity.map((act) => (
                    <div key={act.id} className="flex gap-4 group">
                      <img src={act.img} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-50 mt-1" alt="" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-[13px] font-bold text-slate-800 leading-tight">
                            {act.name} <span className="text-slate-400 font-medium">{act.action}</span>
                          </h4>
                          <span className="text-[10px] text-slate-300 font-bold whitespace-nowrap">{act.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-1">{act.detail}</p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Legend/Status at bottom */}
                  <div className="mt-6 pt-6 border-t border-slate-50 space-y-2">
                    <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest mb-3">Recent Highlights</p>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="w-3/4 h-full bg-blue-400"></div></div>
                      <span className="text-[11px] text-slate-500 font-medium">Food Distribution - 85%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="w-1/2 h-full bg-indigo-400"></div></div>
                      <span className="text-[11px] text-slate-500 font-medium">Medical Assistance - 42%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "Active Zones" && (
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
            <h2 className="text-2xl font-black text-slate-800 mb-8">Active Zones Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ALL_ZONES.map((zone) => (
                <div key={zone.id} className="p-6 border border-slate-100 rounded-2xl bg-slate-50 flex flex-col gap-4 shadow-sm group hover:border-[#0ea5e9] transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-slate-800 text-lg">{zone.name}</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{zone.area}</p>
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${
                      zone.urgency >= 4 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {getZoneLabel(zone.urgency)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600 font-medium">Resources: <span className="text-slate-800 font-bold">{zone.items}</span></p>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#0ea5e9] h-full" style={{ width: `${(zone.urgency / 5) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                    <button className="text-xs font-bold text-[#0ea5e9] hover:underline flex items-center gap-1">
                      <MapPin size={12} /> View on Map
                    </button>
                    <button className="bg-white border border-slate-200 text-slate-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors">
                      Edit Zone
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Volunteers Fleet" && (
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
            <h2 className="text-2xl font-black text-slate-800 mb-8">Volunteers Fleet Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {volunteers.map((vol) => (
                <div key={vol.id} className="p-6 border border-slate-100 rounded-2xl bg-slate-50 flex flex-col gap-4 shadow-sm group hover:border-[#0ea5e9] transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <img src={vol.img || IMG_VOL_1} className="w-14 h-14 rounded-full object-cover ring-4 ring-white" alt="" />
                      <div>
                        <p className="font-bold text-slate-800 text-lg">{vol.name}</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{vol.role}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${
                      vol.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {vol.status}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                    <div className="flex gap-1 text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Zap key={i} size={12} fill={i < (vol.rating || 4) ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <button className="text-sm font-bold text-[#0ea5e9] hover:underline">View Profile</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Insights" && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
              <h2 className="text-2xl font-black text-slate-800 mb-2">Relief Operations Insights</h2>
              <p className="text-slate-400 mb-8 font-medium">Real-time data from the field.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 shadow-sm">
                  <h4 className="text-blue-800 font-bold mb-1 text-sm uppercase tracking-widest">Most Requested</h4>
                  <p className="text-3xl font-black text-blue-600">Food Units</p>
                  <p className="text-xs text-blue-600/70 mt-2 font-bold tracking-tight">↑ 12% increase since last hour</p>
                </div>
                <div className="bg-orange-50/50 rounded-2xl p-6 border border-orange-100 shadow-sm">
                  <h4 className="text-orange-800 font-bold mb-1 text-sm uppercase tracking-widest">Efficiency</h4>
                  <p className="text-3xl font-black text-orange-600">94.2%</p>
                  <p className="text-xs text-orange-600/70 mt-2 font-bold tracking-tight">AI Allocation accuracy</p>
                </div>
                <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100 shadow-sm">
                  <h4 className="text-emerald-800 font-bold mb-1 text-sm uppercase tracking-widest">Avg Response</h4>
                  <p className="text-3xl font-black text-emerald-600">8.5 min</p>
                  <p className="text-xs text-emerald-600/70 mt-2 font-bold tracking-tight">Request to dispatch time</p>
                </div>
              </div>
              
              <h3 className="font-black text-xl text-slate-800 mb-6">Resource Distribution</h3>
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-blue-500" style={{ width: '45%' }}></div>
                <div className="h-full bg-orange-500" style={{ width: '25%' }}></div>
                <div className="h-full bg-indigo-500" style={{ width: '20%' }}></div>
                <div className="h-full bg-red-500" style={{ width: '10%' }}></div>
              </div>
              <div className="flex gap-6 mt-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Food (45%)</div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Water (25%)</div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Medical (20%)</div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><div className="w-2 h-2 rounded-full bg-red-500"></div> Shelter (10%)</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "API" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 mb-2">API & AI Allocation Model</h2>
                  <p className="text-slate-400 font-medium uppercase text-xs tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 
                    Backend Status: http://localhost:8000
                  </p>
                </div>
                <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Algorithm Version</p>
                  <p className="text-sm font-bold text-slate-700">v2.4.0-Stable</p>
                </div>
              </div>

              {/* Algorithm Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white mb-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <Activity size={120} />
                </div>
                <div className="relative z-10 space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-3">
                    <Zap className="text-yellow-400" fill="currentColor" /> 
                    Weighted Priority Scoring Model
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-2">Urgency Weight</p>
                      <p className="text-2xl font-black">50%</p>
                      <p className="text-[10px] text-slate-300 mt-1 italic">Based on severity of incident</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-2">Shortage Weight</p>
                      <p className="text-2xl font-black">30%</p>
                      <p className="text-[10px] text-slate-300 mt-1 italic">Inventory gap vs requirement</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-2">Proximity Weight</p>
                      <p className="text-2xl font-black">20%</p>
                      <p className="text-[10px] text-slate-300 mt-1 italic">Distance from nearest hub (km)</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex items-center gap-4">
                    <p className="text-xs font-mono text-slate-300 bg-black/30 px-3 py-2 rounded-lg">
                      Score = (Urgency * 0.5) + (Shortage * 0.3) + ((100 - Distance)/100 * 10 * 0.2)
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="font-black text-xl text-slate-800 mb-6 flex items-center gap-2">
                Live Allocation Table
                <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter">Real-time Calculation</span>
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="pb-4 px-2">Zone / Area</th>
                      <th className="pb-4 px-2 text-center">Urgency</th>
                      <th className="pb-4 px-2 text-center">Shortage</th>
                      <th className="pb-4 px-2 text-center">Distance</th>
                      <th className="pb-4 px-2 text-right">Priority Score</th>
                      <th className="pb-4 px-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ALL_ZONES.map((zone) => {
                      const shortage = Math.floor(Math.random() * 8) + 2;
                      const distance = Math.floor(Math.random() * 30) + 2;
                      const score = calculatePriorityScore(zone.urgency, shortage, distance);
                      return (
                        <tr key={zone.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                          <td className="py-4 px-2">
                            <p className="text-sm font-bold text-slate-800">{zone.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{zone.area}</p>
                          </td>
                          <td className="py-4 px-2 text-center">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                              zone.urgency >= 4 ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                            }`}>
                              {zone.urgency}/5
                            </span>
                          </td>
                          <td className="py-4 px-2 text-center font-bold text-sm text-slate-700">{shortage}</td>
                          <td className="py-4 px-2 text-center font-bold text-sm text-slate-700">{distance}km</td>
                          <td className="py-4 px-2 text-right font-black text-blue-600 text-lg">
                            {score}
                          </td>
                          <td className="py-4 px-2 text-right">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                              score > 6.5 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {score > 6.5 ? 'Critical Action' : 'Stable'}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* API Endpoints Card */}
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
              <h3 className="font-black text-xl text-slate-800 mb-8 flex items-center gap-2">
                <MapPin className="text-blue-500" />
                API Endpoints Reference
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { method: "GET", path: "/api/volunteers", desc: "Retrieve full fleet of 630 volunteers with status and zone data." },
                  { method: "GET", path: "/api/urgent-needs", desc: "Get AI-sorted list of current relief requests with priority scores." },
                  { method: "POST", path: "/api/requests", desc: "Submit a new relief request with NLP processing for urgency." },
                  { method: "POST", path: "/api/allocate", desc: "Trigger the AI Auto-Assignment engine to dispatch available fleet." },
                  { method: "GET", path: "/", desc: "Health check and system status report." }
                ].map((api, i) => (
                  <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/10 transition-all group">
                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg w-16 text-center ${
                        api.method === 'GET' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {api.method}
                      </span>
                      <div>
                        <p className="text-sm font-mono font-bold text-slate-700">{api.path}</p>
                        <p className="text-xs text-slate-400 font-medium">{api.desc}</p>
                      </div>
                    </div>
                    <button className="mt-4 md:mt-0 text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-blue-500 transition-colors">
                      View JSON Schema
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .clip-triangle {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
        .map-tooltip {
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
          border-radius: 6px !important;
          padding: 2px 8px !important;
        }
        .leaflet-container {
          background: #f8fafc !important;
        }
      `}</style>
    </div>
  );
}
