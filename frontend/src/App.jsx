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
} from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
export default function App() {
  const [requestInput, setRequestInput] = useState("");

  // 1. Create a state variable to hold your backend data
  const [urgentNeeds, setUrgentNeeds] = useState([]);

  // 2. THE CONNECTION: Fetch the AI-sorted data from Python when the page loads
  useEffect(() => {
    fetch("http://localhost:8000/api/urgent-needs")
      .then((response) => response.json())
      .then((data) => setUrgentNeeds(data))
      .catch((error) => console.error("Error fetching AI data:", error));
  }, []);

  const recentActivity = [
    {
      id: 1,
      action: "Resource allocated",
      detail: "15 Blankets to Zone B",
      status: "success",
    },
    {
      id: 2,
      action: "Volunteer assigned",
      detail: "Rahul to Zone A",
      status: "success",
    },
    {
      id: 3,
      action: "New critical alert",
      detail: "Shortage of clean water",
      status: "warning",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 font-sans pb-10">
      {/* Top Navbar */}
      <header className="bg-white px-6 py-3 shadow-sm border-b border-slate-200 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <MapPin size={20} />
          </div>
          <span className="text-slate-800 tracking-tight">
            Relief<span className="text-blue-600">Link</span>
          </span>
        </div>

        <nav className="hidden md:flex gap-8 text-sm font-semibold text-slate-400">
          <a href="#" className="text-blue-600 border-b-2 border-blue-600 pb-1">
            Dashboard
          </a>
          <a href="#" className="hover:text-slate-800 transition-colors">
            Volunteers
          </a>
          <a href="#" className="hover:text-slate-800 transition-colors">
            Insights
          </a>
          <a href="#" className="hover:text-slate-800 transition-colors">
            AI Allocation
          </a>
        </nav>

        <button className="bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all active:scale-95">
          <Zap size={16} className="fill-orange-500" /> Assign Automatically
        </button>
      </header>

      <main className="max-w-[1200px] mx-auto pt-6 px-4 space-y-6">
        {/* Add Request Bar */}
        <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
          <span className="text-slate-700 font-bold px-4 text-sm whitespace-nowrap">
            Add Request
          </span>
          <div className="flex-1 flex bg-slate-800 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all shadow-inner">
            <input
              type="text"
              value={requestInput}
              onChange={(e) => setRequestInput(e.target.value)}
              placeholder="e.g. Urgent: Need 50 food packets for flood victims"
              className="flex-1 bg-transparent text-slate-300 outline-none px-4 py-2.5 text-sm placeholder:text-slate-500"
            />
          </div>
          <button className="bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 px-6 py-2.5 rounded-lg text-sm font-bold transition-colors">
            Submit
          </button>
        </div>

        {/* Four KPI Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 group hover:border-blue-300 transition-colors cursor-pointer">
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">
              Total Requests
            </p>
            <h2 className="text-3xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">
              24
            </h2>
            <p className="text-xs text-emerald-500 font-medium mt-1">
              ↑ 3 today
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 group hover:border-blue-300 transition-colors cursor-pointer">
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">
              Resources Available
            </p>
            <h2 className="text-3xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">
              1,840
            </h2>
            <p className="text-xs text-emerald-500 font-medium mt-1">
              Units in stock
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 group hover:border-red-300 transition-colors cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">
              Critical Needs
            </p>
            <h2 className="text-3xl font-black text-red-600">6</h2>
            <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
              <AlertTriangle size={12} /> Needs immediate action
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 group hover:border-blue-300 transition-colors cursor-pointer">
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">
              Volunteers Active
            </p>
            <h2 className="text-3xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">
              12
            </h2>
            <p className="text-xs text-emerald-500 font-medium mt-1">
              ↑ 2 available now
            </p>
          </div>
        </div>

        {/* Map, AI List, and Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Map Area */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">
                Live Map — Lucknow Relief Zones
              </h3>
            </div>
            <div className="p-4 flex-1">
              
              <div className="p-4 flex-1">
    <div className="w-full h-full min-h-[350px] rounded-xl overflow-hidden relative z-0 border border-slate-200">
      <MapContainer 
  center={[26.8467, 80.9462]} 
  zoom={12} 
  style={{ height: '400px', width: '100%', zIndex: 0 }}
  scrollWheelZoom={false}
>
        {/* The clean, minimal base map */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
      {/* The clean, minimal base map */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        {/* DYNAMIC AI MARKERS */}
        {urgentNeeds.map((req) => {
          // Decide color based on AI urgency
          const isCritical = req.urgency_text === 'Critical';
          const isHigh = req.urgency_text === 'High';
          
          const markerColor = isCritical ? '#ef4444' : (isHigh ? '#f97316' : '#eab308');
          const circleSize = isCritical ? 25 : (isHigh ? 20 : 15);

          return (
            <CircleMarker 
              key={req.id}
              center={[req.lat, req.lng]} 
              radius={circleSize} 
              pathOptions={{ color: markerColor, fillColor: markerColor, fillOpacity: 0.5 }}
            >
              <Popup className="font-bold text-slate-800">
                {req.location}<br/>
                <span className="text-slate-600 text-xs font-normal">{req.items}</span><br/>
                <span className="text-xs font-black mt-1 block" style={{ color: markerColor }}>
                  {req.urgency_text.toUpperCase()} (Score: {req.score})
                </span>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  </div>
            </div>
          </div>
          {/* Right Sidebar: AI Results + Activity */}
          <div className="flex flex-col gap-6">
            {/* AI Prioritized List (Data from Python!) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Urgent Needs</h3>
                <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded">
                  AI SORTED
                </span>
              </div>
              <div className="p-4 space-y-3">
                {urgentNeeds.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">
                    Loading AI data...
                  </p>
                ) : null}

                {urgentNeeds.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 border border-slate-100 rounded-lg bg-slate-50 flex justify-between items-center hover:border-blue-200 transition-colors"
                  >
                    <div>
                      <p className="font-bold text-sm text-slate-800">
                        {req.location}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {req.items}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                          req.urgency_text === "Critical"
                            ? "bg-red-100 text-red-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {req.urgency_text}
                      </span>
                      <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-tighter">
                        Score:{" "}
                        <span className="text-blue-600 font-black text-sm">
                          {req.score}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col flex-1">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">Recent Activity</h3>
              </div>
              <div className="p-5 overflow-y-auto space-y-5">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex gap-3 items-start relative before:absolute before:left-[11px] before:top-6 before:bottom-[-20px] before:w-[2px] before:bg-slate-100 last:before:hidden"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        activity.status === "success"
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      {activity.status === "success" ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <Clock size={14} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        {activity.action}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {activity.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
