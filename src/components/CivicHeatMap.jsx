import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

export default function CivicHeatMap() {
  const mapRef = useRef(null);
  const heatLayerRef = useRef(null);

  const [issueType, setIssueType] = useState("ALL");

  // 🔹 MOCK DATA (later from backend)
  const complaints = [
    { lat: 22.7196, lng: 75.8577, issueType: "ROAD", intensity: 0.9 },
    { lat: 22.725, lng: 75.865, issueType: "GARBAGE", intensity: 0.8 },
    { lat: 22.735, lng: 75.845, issueType: "DRAINAGE", intensity: 0.6 },
    { lat: 22.71, lng: 75.88, issueType: "ROAD", intensity: 0.7 },
    { lat: 22.70, lng: 75.83, issueType: "STREET_LIGHT", intensity: 0.3 },
    { lat: 22.72, lng: 75.84, issueType: "GARBAGE", intensity: 0.4 },
  ];
const detectUserLocation = () => {
  if (!navigator.geolocation) {
    console.warn("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      // Move map to user location
      mapRef.current.setView([latitude, longitude], 14);

      // Optional marker
      L.circleMarker([latitude, longitude], {
        radius: 8,
        color: "blue",
        fillColor: "blue",
        fillOpacity: 0.8,
      })
        .addTo(mapRef.current)
        .bindPopup("You are here")
        .openPopup();
    },
    (error) => {
      console.warn("Location access denied, using default city view");
    }
  );
};
const getAreaSummary = () => {
  // 🔹 MOCK SUMMARY (later from backend)
  return {
    total: Math.floor(Math.random() * 20) + 5,
    pending: Math.floor(Math.random() * 10) + 3,
    resolved: Math.floor(Math.random() * 10) + 1,
  };
};

  // 🔹 INIT MAP (RUNS ONCE)
useEffect(() => {
  mapRef.current = L.map("heatmap").setView([22.7196, 75.8577], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(mapRef.current);

  detectUserLocation();

  const onMapClick = (e) => {
    const { lat, lng } = e.latlng;
    const summary = getAreaSummary();

    const popupContent = `
      <div style="font-size:14px">
        <b>📍 Nearby Area</b><br/><br/>
        Total complaints: <b>${summary.total}</b><br/>
        Pending: <b>${summary.pending}</b><br/>
        Resolved: <b>${summary.resolved}</b><br/><br/>
        <button
          style="
            background:#16a34a;
            color:white;
            border:none;
            padding:6px 10px;
            border-radius:6px;
            cursor:pointer;
          "
        >
          Report issue here
        </button>
      </div>
    `;

    L.popup()
      .setLatLng([lat, lng])
      .setContent(popupContent)
      .openOn(mapRef.current);
  };

  mapRef.current.on("click", onMapClick);

  return () => {
    mapRef.current.off("click", onMapClick);
    mapRef.current.remove();
  };
}, []);



  // 🔹 UPDATE HEAT MAP WHEN FILTER CHANGES
  useEffect(() => {
    if (!mapRef.current) return;

    // remove old heat layer
    if (heatLayerRef.current) {
      mapRef.current.removeLayer(heatLayerRef.current);
    }

    const filtered = issueType === "ALL"
      ? complaints
      : complaints.filter(c => c.issueType === issueType);

    const heatData = filtered.map(c => [
      c.lat,
      c.lng,
      c.intensity,
    ]);

    heatLayerRef.current = L.heatLayer(heatData, {
      radius: 30,
      blur: 20,
      maxZoom: 13,
      gradient: {
        0.2: "green",
        0.5: "yellow",
        0.8: "red",
      },
    }).addTo(mapRef.current);

  }, [issueType]);

  return (
    <div className="bg-white rounded-xl shadow p-5 mt-10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          Area Cleanliness Heat Map
        </h3>
        
        {/* FILTER */}
        <select
          value={issueType}
          onChange={(e) => setIssueType(e.target.value)}
          className="border rounded px-3 py-1 text-sm"
        >
          <option value="ALL">All Issues</option>
          <option value="ROAD">Road</option>
          <option value="GARBAGE">Garbage</option>
          <option value="DRAINAGE">Drainage</option>
          <option value="STREET_LIGHT">Street Light</option>
        </select>
      </div>
      {/* LEGEND */}
<div className="flex gap-4 text-sm mb-4">
  <div className="flex items-center gap-2">
    <span className="w-4 h-4 rounded-full bg-green-500"></span>
    <span>Clean</span>
  </div>

  <div className="flex items-center gap-2">
    <span className="w-4 h-4 rounded-full bg-yellow-400"></span>
    <span>Moderate</span>
  </div>

  <div className="flex items-center gap-2">
    <span className="w-4 h-4 rounded-full bg-red-500"></span>
    <span>Critical</span>
  </div>
</div>


      <div
        id="heatmap"
        className="w-full h-[400px] rounded-lg"
      />
    </div>
  );
}
