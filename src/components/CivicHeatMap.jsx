import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { getComplaints } from "../services/complaintApi";
import { useTheme } from "../context/ThemeContext";

// Only show complaints that are still active (not resolved/rejected)
const ACTIVE_STATUSES = ["PENDING", "APPROVED", "IN_PROGRESS"];

const ISSUE_COLORS = {
  ROAD: "#0ea5e9",
  GARBAGE: "#f59e0b",
  DRAINAGE: "#14b8a6",
  STREET_LIGHT: "#8b5cf6",
};

// Base coordinates for zones to spread out complaints anonymously
const ZONE_COORDS = {
  "North Zone": [22.60, 72.95],
  "South Zone": [22.51, 72.95],
  "East Zone": [22.55, 73.00],
  "West Zone": [22.55, 72.90],
  "Central Zone": [22.5565, 72.955]
};

// Seeded random-ish generator based on ID so markers don't jump every render
const pseudoRandom = (seedStr) => {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) hash = Math.imul(31, hash) + seedStr.charCodeAt(i) | 0;
  return ((hash >>> 0) / 4294967296) - 0.5; // returns between -0.5 and 0.5
};

export default function CivicHeatMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const heatLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const tileLayerRef = useRef(null);

  const { theme } = useTheme();
  const [issueType, setIssueType] = useState("ALL");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("heat"); // "heat" | "pins"

  // ── Fetch only ACTIVE complaints (PENDING, APPROVED, IN_PROGRESS) ─────────
  useEffect(() => {
    setLoading(true);
    // Fetch each active status in parallel, then merge
    Promise.all(
      ACTIVE_STATUSES.map((s) => getComplaints({ status: s }))
    )
      .then((responses) => {
        const all = responses.flatMap((r) => r.data);
        setComplaints(all);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Init map ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapInstanceRef.current) return;

    mapInstanceRef.current = L.map("heatmap", {
      scrollWheelZoom: true,
    }).setView([22.5565, 72.955], 13);

    const tileUrl =
      theme === "dark"
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

    tileLayerRef.current = L.tileLayer(tileUrl, {
      attribution: "© OpenStreetMap © CARTO",
    }).addTo(mapInstanceRef.current);

    // User location marker
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          mapInstanceRef.current.setView([latitude, longitude], 14);
            L.circleMarker([latitude, longitude], {
              radius: 6,
              color: "#3b82f6",
              fillColor: "#3b82f6",
              fillOpacity: 1,
            })
              .addTo(mapInstanceRef.current)
              .bindPopup("📍 Your general location")
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

  // ── Switch tile layer on theme change ─────────────────────────────────────
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

  // ── Update map layers when filters or data change ─────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const filtered = complaints.filter((c) => {
      const matchesType = issueType === "ALL" || c.issueType === issueType;
      const isActive = ACTIVE_STATUSES.includes(c.status);
      return matchesType && isActive;
    });

    // Map mapped to zone-based anonymous locations
    const mapData = filtered.map(c => {
      const baseCoord = (c.zone && ZONE_COORDS[c.zone.name]) || ZONE_COORDS["Central Zone"];
      // Create a deterministic spread around the zone center (± roughly 1km)
      const lat = baseCoord[0] + pseudoRandom(c._id + "lat") * 0.02;
      const lng = baseCoord[1] + pseudoRandom(c._id + "lng") * 0.02;
      return { ...c, lat, lng };
    });

    // ── Heat layer ─────────────────────────────────────────────────────────
    if (heatLayerRef.current) {
      mapInstanceRef.current.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    // ── Pin markers layer ──────────────────────────────────────────────────
    if (markersLayerRef.current) {
      mapInstanceRef.current.removeLayer(markersLayerRef.current);
      markersLayerRef.current = null;
    }

    if (filtered.length === 0) return;

    if (viewMode === "heat") {
      const heatData = mapData.map((c) => {
        // Weight by urgency: PENDING = highest heat, IN_PROGRESS = medium
        const weight = c.status === "PENDING" ? 1.0 : c.status === "APPROVED" ? 0.8 : 0.5;
        return [c.lat, c.lng, weight];
      });

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
    } else {
      // Pin mode: individual markers with popup info
      const group = L.layerGroup();
      mapData.forEach((c) => {
        const color = ISSUE_COLORS[c.issueType] || "#10b981";
        const statusEmoji =
          c.status === "PENDING" ? "⏳" :
          c.status === "APPROVED" ? "✅" : "🔧";

        const marker = L.circleMarker([c.lat, c.lng], {
          radius: 8,
          color,
          fillColor: color,
          fillOpacity: 0.75,
          weight: 1.5,
        });

        marker.bindPopup(`
          <div style="font-family: Inter, sans-serif; min-width: 160px;">
            <p style="font-weight: 700; margin-bottom: 4px; font-size: 13px;">
              ${statusEmoji} ${c.issueType.replace("_", " ")}
            </p>
            <p style="font-size: 12px; color: #64748b; margin-bottom: 4px; max-width: 180px;">
              ${c.description?.substring(0, 80)}${c.description?.length > 80 ? "…" : ""}
            </p>
            <p style="font-size: 11px; color: #94a3b8;">
              ${c.zone?.name ? `📍 ${c.zone.name}` : ""} • ${new Date(c.createdAt).toLocaleDateString("en-IN")}
            </p>
          </div>
        `);

        group.addLayer(marker);
      });
      markersLayerRef.current = group.addTo(mapInstanceRef.current);
    }
  }, [issueType, complaints, viewMode]);

  // Filtered count for badge
  const activeCount = complaints.filter(
    (c) => (issueType === "ALL" || c.issueType === issueType) && ACTIVE_STATUSES.includes(c.status)
  ).length;

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-heading">🗺️ Active Issue Map</h3>
            {loading ? (
              <div className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            ) : (
              <span className="text-xs bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20 px-2 py-0.5 rounded-full font-semibold">
                {activeCount} active
              </span>
            )}
          </div>
          <p className="text-muted text-sm">
            Showing pending &amp; in-progress issues only — resolved complaints are hidden
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
            <button
              onClick={() => setViewMode("heat")}
              className={`px-3 py-1.5 text-xs font-medium transition-all ${
                viewMode === "heat"
                  ? "bg-primary-500 text-white"
                  : "bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-white/10"
              }`}
            >
              🔥 Heat
            </button>
            <button
              onClick={() => setViewMode("pins")}
              className={`px-3 py-1.5 text-xs font-medium transition-all ${
                viewMode === "pins"
                  ? "bg-primary-500 text-white"
                  : "bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-white/10"
              }`}
            >
              📍 Pins
            </button>
          </div>

          {/* Issue type filter */}
          <select
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            className="input-field w-auto text-sm py-2"
          >
            <option value="ALL">All Issues</option>
            <option value="ROAD">🚗 Road</option>
            <option value="GARBAGE">🗑️ Garbage</option>
            <option value="DRAINAGE">🌊 Drainage</option>
            <option value="STREET_LIGHT">💡 Street Light</option>
          </select>
        </div>
      </div>

      {/* Status legend */}
      <div className="flex flex-wrap gap-4 text-xs mb-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span className="text-muted">Low density</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          <span className="text-muted">Medium density</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
          <span className="text-muted">High density</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-primary-600 dark:text-primary-400 font-medium">
          ✅ Resolved complaints are hidden from this map
        </div>
      </div>

      {/* Map */}
      <div
        id="heatmap"
        className="w-full h-[420px] rounded-xl overflow-hidden border border-gray-200 dark:border-white/10"
        style={{ zIndex: 0 }}
      />

      {/* Empty state overlay */}
      {!loading && activeCount === 0 && (
        <div className="mt-4 text-center py-4">
          <p className="text-muted text-sm">🎉 No active issues reported in this area</p>
        </div>
      )}
    </div>
  );
}
