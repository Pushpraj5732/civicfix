import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { getComplaints } from "../services/complaintApi";
import { useTheme } from "../context/ThemeContext";

export default function CivicHeatMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const heatLayerRef = useRef(null);
  const tileLayerRef = useRef(null);

  const { theme } = useTheme();
  const [issueType, setIssueType] = useState("ALL");
  const [complaints, setComplaints] = useState([]);

  // Fetch complaints
  useEffect(() => {
    getComplaints()
      .then((res) => setComplaints(res.data))
      .catch(() => {});
  }, []);

  // Init map
  useEffect(() => {
    if (mapInstanceRef.current) return;

    mapInstanceRef.current = L.map("heatmap", {
      scrollWheelZoom: true,
    }).setView([22.5565, 72.955], 13);

    // Add initial tile layer
    const tileUrl =
      theme === "dark"
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution: "© OpenStreetMap © CARTO",
    }).addTo(mapInstanceRef.current);

    // Detect user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          mapInstanceRef.current.setView([latitude, longitude], 14);
          L.circleMarker([latitude, longitude], {
            radius: 8,
            color: "#10b981",
            fillColor: "#10b981",
            fillOpacity: 0.8,
          })
            .addTo(mapInstanceRef.current)
            .bindPopup("📍 You are here")
            .openPopup();
        },
        () => {},
      );
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Switch tile layer on theme change
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const tileUrl =
      theme === "dark"
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution: "© OpenStreetMap © CARTO",
    }).addTo(mapInstanceRef.current);
  }, [theme]);

  // Update heat layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (heatLayerRef.current) {
      mapInstanceRef.current.removeLayer(heatLayerRef.current);
    }

    const filtered =
      issueType === "ALL"
        ? complaints
        : complaints.filter((c) => c.issueType === issueType);

    const heatData = filtered
      .filter((c) => c.latitude && c.longitude)
      .map((c) => [c.latitude, c.longitude, 0.7]);

    if (heatData.length > 0) {
      heatLayerRef.current = L.heatLayer(heatData, {
        radius: 30,
        blur: 20,
        maxZoom: 13,
        gradient: {
          0.2: "#10b981",
          0.5: "#f59e0b",
          0.8: "#ef4444",
        },
      }).addTo(mapInstanceRef.current);
    }
  }, [issueType, complaints]);

  return (
    <div className="glass-card p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-heading">
            🗺️ Issue Heat Map
          </h3>
          <p className="text-muted text-sm">Real-time civic issue density</p>
        </div>
        <select
          value={issueType}
          onChange={(e) => setIssueType(e.target.value)}
          className="input-field w-auto text-sm py-2"
        >
          <option value="ALL">All Issues</option>
          <option value="ROAD">Road</option>
          <option value="GARBAGE">Garbage</option>
          <option value="DRAINAGE">Drainage</option>
          <option value="STREET_LIGHT">Street Light</option>
        </select>
      </div>

      {/* Legend */}
      <div className="flex gap-6 text-sm mb-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-muted">Low</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-muted">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-muted">High</span>
        </div>
      </div>

      <div
        id="heatmap"
        className="w-full h-[400px] rounded-xl overflow-hidden border border-gray-200 dark:border-white/10"
        style={{ zIndex: 0 }}
      />
    </div>
  );
}
