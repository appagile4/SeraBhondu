"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  MapPin,
  Crosshair,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Navigation,
  Copy,
  Check,
} from "lucide-react";

// Known coordinates fallback lookup for Bangladesh locations
const CITY_COORDINATES_MAP: Record<string, { lat: number; lng: number }> = {
  dhaka: { lat: 23.8103, lng: 90.4125 },
  chattogram: { lat: 22.3569, lng: 91.7832 },
  sylhet: { lat: 24.8949, lng: 91.8687 },
  rajshahi: { lat: 24.3636, lng: 88.6241 },
  khulna: { lat: 22.8456, lng: 89.5403 },
  barishal: { lat: 22.7010, lng: 90.3535 },
  rangpur: { lat: 25.7439, lng: 89.2752 },
  mymensingh: { lat: 24.7471, lng: 90.4203 },
  gazipur: { lat: 23.9999, lng: 90.4203 },
  narayanganj: { lat: 23.6238, lng: 90.5000 },
  cumilla: { lat: 23.4682, lng: 91.1788 },
  bogura: { lat: 24.8465, lng: 89.3777 },
  "cox's bazar": { lat: 21.4272, lng: 92.0058 },
  coxsbazar: { lat: 21.4272, lng: 92.0058 },
  // Common Dhaka & major divisional neighbourhoods
  gulshan: { lat: 23.7925, lng: 90.4078 },
  banani: { lat: 23.7937, lng: 90.4066 },
  dhanmondi: { lat: 23.7461, lng: 90.3742 },
  mirpur: { lat: 23.8223, lng: 90.3654 },
  uttara: { lat: 23.8759, lng: 90.3795 },
  motijheel: { lat: 23.7330, lng: 90.4172 },
  mohakhali: { lat: 23.7781, lng: 90.3995 },
  bashundhara: { lat: 23.8191, lng: 90.4326 },
  agrabad: { lat: 22.3250, lng: 91.8150 },
  nasirabad: { lat: 22.3667, lng: 91.8167 },
  gEC: { lat: 22.3585, lng: 91.8215 },
};

interface LocationMapPickerProps {
  latitude: number | null;
  longitude: number | null;
  state: string;
  city: string;
  area: string;
  pincode: string;
  onCoordinatesChange: (lat: number, lng: number) => void;
  onAddressDetected?: (address: { area?: string; city?: string; state?: string }) => void;
}

export function LocationMapPicker({
  latitude,
  longitude,
  state,
  city,
  area,
  pincode,
  onCoordinatesChange,
  onAddressDetected,
}: LocationMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  const [isMapReady, setIsMapReady] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectStatus, setDetectStatus] = useState<string | null>(null);
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Default coordinate fallback (Dhaka center)
  const currentLat = latitude ?? 23.8103;
  const currentLng = longitude ?? 90.4125;

  // Initialize Leaflet Map on Client
  useEffect(() => {
    let isMounted = true;

    async function initLeaflet() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      try {
        // Dynamically import Leaflet and CSS
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");

        if (!isMounted || !mapContainerRef.current) return;
        leafletRef.current = L;

        // Custom KhojoBangla Pin SVG Icon
        const customPinIcon = L.divIcon({
          className: "khojobangla-map-marker",
          html: `
            <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: grab;">
              <div style="position: absolute; bottom: 2px; width: 14px; height: 5px; background: rgba(0,0,0,0.35); border-radius: 50%; filter: blur(1.5px);"></div>
              <div style="width: 34px; height: 34px; border-radius: 50% 50% 50% 0; background: linear-gradient(135deg, #E30613 0%, #C00510 100%); transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(227,6,19,0.45); border: 2.5px solid white;">
                <div style="width: 10px; height: 10px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
              </div>
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 36],
          popupAnchor: [0, -36],
        });

        // Initialize map instance if not already initialized
        if (!mapInstanceRef.current) {
          const map = L.map(mapContainerRef.current, {
            center: [currentLat, currentLng],
            zoom: 14,
            zoomControl: false,
          });

          // Add standard zoom control at top-right
          L.control.zoom({ position: "topright" }).addTo(map);

          // Add OpenStreetMap tile layer
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
          }).addTo(map);

          // Add draggable marker
          const marker = L.marker([currentLat, currentLng], {
            icon: customPinIcon,
            draggable: true,
          }).addTo(map);

          marker.bindPopup(`
            <div style="font-family: inherit; font-size: 12px; padding: 2px;">
              <strong style="color: #014923;">Exact Ad Location</strong><br/>
              <span style="color: #64748B;">Drag pin or click map to fine-tune</span>
            </div>
          `);

          // Update coords on marker drag
          marker.on("dragend", () => {
            const pos = marker.getLatLng();
            onCoordinatesChange(
              parseFloat(pos.lat.toFixed(6)),
              parseFloat(pos.lng.toFixed(6))
            );
          });

          // Update coords on map click
          map.on("click", (e: any) => {
            const { lat, lng } = e.latlng;
            marker.setLatLng([lat, lng]);
            onCoordinatesChange(
              parseFloat(lat.toFixed(6)),
              parseFloat(lng.toFixed(6))
            );
          });

          mapInstanceRef.current = map;
          markerInstanceRef.current = marker;
          setIsMapReady(true);
        }
      } catch (err) {
        console.error("Failed to initialize Leaflet map:", err);
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
      }
    };
  }, []);

  // Sync external coordinates with marker & map view
  useEffect(() => {
    if (
      isMapReady &&
      mapInstanceRef.current &&
      markerInstanceRef.current &&
      latitude !== null &&
      longitude !== null
    ) {
      const currentPos = markerInstanceRef.current.getLatLng();
      if (
        Math.abs(currentPos.lat - latitude) > 0.0001 ||
        Math.abs(currentPos.lng - longitude) > 0.0001
      ) {
        markerInstanceRef.current.setLatLng([latitude, longitude]);
        mapInstanceRef.current.panTo([latitude, longitude], { animate: true });
      }
    }
  }, [latitude, longitude, isMapReady]);

  // Detect location from filled address details (Nominatim + Lookup fallback)
  const detectLocationFromAddress = useCallback(
    async (showFeedback = true) => {
      if (!city && !area && !state) {
        if (showFeedback) {
          setDetectStatus("Please select a City or enter an Area first.");
          setTimeout(() => setDetectStatus(null), 3500);
        }
        return;
      }

      setIsDetecting(true);
      if (showFeedback) setDetectStatus("Locating address on map...");

      try {
        // Query OpenStreetMap Nominatim
        const addressParts = [area, city, state, pincode].filter(Boolean);
        const query = addressParts.join(", ") + ", Nepal";

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&limit=1`,
          {
            headers: {
              "Accept-Language": "en",
            },
          }
        );

        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          const newLat = parseFloat(parseFloat(data[0].lat).toFixed(6));
          const newLng = parseFloat(parseFloat(data[0].lon).toFixed(6));

          onCoordinatesChange(newLat, newLng);

          if (mapInstanceRef.current && markerInstanceRef.current) {
            markerInstanceRef.current.setLatLng([newLat, newLng]);
            mapInstanceRef.current.flyTo([newLat, newLng], 15, { duration: 1.2 });
          }

          if (showFeedback) {
            setDetectStatus(`Detected: ${data[0].display_name.split(",").slice(0, 2).join(",")}`);
            setTimeout(() => setDetectStatus(null), 4000);
          }
          setIsDetecting(false);
          return;
        }

        // Fallback: Check local coordinates dictionary
        const areaKey = area.trim().toLowerCase();
        const cityKey = city.trim().toLowerCase();

        const match =
          CITY_COORDINATES_MAP[areaKey] ||
          CITY_COORDINATES_MAP[cityKey] ||
          CITY_COORDINATES_MAP[cityKey.replace(/\s*\(.*\)/, "")];

        if (match) {
          onCoordinatesChange(match.lat, match.lng);

          if (mapInstanceRef.current && markerInstanceRef.current) {
            markerInstanceRef.current.setLatLng([match.lat, match.lng]);
            mapInstanceRef.current.flyTo([match.lat, match.lng], 14, { duration: 1 });
          }

          if (showFeedback) {
            setDetectStatus(`Located in ${city} via coordinates registry.`);
            setTimeout(() => setDetectStatus(null), 3500);
          }
        } else {
          if (showFeedback) {
            setDetectStatus("Address not found on geocoder; pinned at current city center.");
            setTimeout(() => setDetectStatus(null), 3500);
          }
        }
      } catch (err) {
        console.warn("Geocoding failed, using local coordinates table:", err);
        const cityKey = city.trim().toLowerCase();
        const match = CITY_COORDINATES_MAP[cityKey];
        if (match) {
          onCoordinatesChange(match.lat, match.lng);
          if (mapInstanceRef.current && markerInstanceRef.current) {
            markerInstanceRef.current.setLatLng([match.lat, match.lng]);
            mapInstanceRef.current.flyTo([match.lat, match.lng], 14);
          }
        }
        if (showFeedback) {
          setDetectStatus("Geocoding service busy. Pinned to city center.");
          setTimeout(() => setDetectStatus(null), 3000);
        }
      } finally {
        setIsDetecting(false);
      }
    },
    [city, area, state, pincode, onCoordinatesChange]
  );

  // Auto-detect GPS location via browser Geolocation API
  const handleUseCurrentGPS = () => {
    if (!navigator.geolocation) {
      setDetectStatus("Geolocation is not supported by your browser.");
      setTimeout(() => setDetectStatus(null), 3500);
      return;
    }

    setIsDetecting(true);
    setDetectStatus("Acquiring GPS coordinates...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));

        onCoordinatesChange(lat, lng);

        if (mapInstanceRef.current && markerInstanceRef.current) {
          markerInstanceRef.current.setLatLng([lat, lng]);
          mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
        }

        // Reverse geocode to suggest area/city
        try {
          const revRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const revData = await revRes.json();
          if (revData && revData.address && onAddressDetected) {
            onAddressDetected({
              area: revData.address.suburb || revData.address.neighbourhood || revData.address.road || "",
              city: revData.address.city || revData.address.town || revData.address.county || "",
              state: revData.address.state || "",
            });
          }
        } catch {
          // Ignore reverse geocode failures
        }

        setDetectStatus("GPS location acquired successfully!");
        setTimeout(() => setDetectStatus(null), 3500);
        setIsDetecting(false);
      },
      (err) => {
        setDetectStatus("GPS permission denied or unavailable. Please pick location manually.");
        setTimeout(() => setDetectStatus(null), 4000);
        setIsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Copy coordinates to clipboard
  const handleCopyCoords = () => {
    if (latitude && longitude) {
      navigator.clipboard.writeText(`${latitude}, ${longitude}`);
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 2000);
    }
  };

  const { t, language } = useLanguage();

  return (
    <div className="space-y-3 pt-3 border-t border-slate-200">
      {/* Header and Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm">
            <MapPin className="w-4 h-4 text-[#E30613]" />
            <span>{t("mapCoordinatesTitle", "ম্যাপ অবস্থান ও কোঅর্ডিনেটস")}</span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-[#014923] border border-emerald-200">
              {t("exactPinpointBadge", "সঠিক পিনপয়েন্ট")}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t("mapDragHint", "পণ্যটি সংগ্রহের সঠিক স্থান নির্দেশ করতে ম্যাপে ক্লিক করুন বা মার্কারটি টানুন")}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => detectLocationFromAddress(true)}
            disabled={isDetecting || (!city && !area)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-blue-100 text-[#014923] border border-emerald-200 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            title="Automatically locate on map using your filled City & Area"
          >
            {isDetecting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            <span>{t("detectFromAddressBtn", "ঠিকানা থেকে শনাক্ত")}</span>
          </button>

          <button
            type="button"
            onClick={handleUseCurrentGPS}
            disabled={isDetecting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-orange-100 text-[#E30613] border border-red-200 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            title="Use your phone or computer GPS location"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>{t("useMyGpsBtn", "আমার GPS ব্যবহার")}</span>
          </button>
        </div>
      </div>

      {/* Detection Status Message */}
      {detectStatus && (
        <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs flex items-center gap-2 animate-in fade-in">
          <Navigation className="w-3.5 h-3.5 text-[#014923] shrink-0 animate-pulse" />
          <span className="font-medium">{detectStatus}</span>
        </div>
      )}

      {/* Interactive Map Canvas */}
      <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-300 shadow-xs bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Overlay Helper Badge */}
        <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none bg-white/90 backdrop-blur-md border border-slate-200 px-2.5 py-1 rounded-lg shadow-xs text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>{t("interactivePinTip", "ইন্টারেক্টিভ পিন: যেকোনো জায়গায় ক্লিক করুন বা মার্কার টানুন")}</span>
        </div>
      </div>

      {/* Latitude & Longitude Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
        {/* Latitude Field */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            {t("latitudeLabel", "অক্ষাংশ (Latitude Y)")}
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              step="any"
              placeholder="e.g. 23.810300"
              value={latitude !== null ? latitude : ""}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onCoordinatesChange(isNaN(val) ? 0 : val, longitude ?? 90.4125);
              }}
              className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-[#014923] focus:ring-1 focus:ring-[#014923]"
            />
            <span className="absolute right-2.5 text-[10px] text-slate-400 font-bold uppercase pointer-events-none">
              °N
            </span>
          </div>
        </div>

        {/* Longitude Field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700">
              {t("longitudeLabel", "দ্রাঘিমাংশ (Longitude X)")}
            </label>
            {latitude && longitude && (
              <button
                type="button"
                onClick={handleCopyCoords}
                className="text-[10px] text-slate-500 hover:text-[#014923] font-semibold flex items-center gap-1 cursor-pointer"
                title="Copy coordinates"
              >
                {copiedCoords ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">{language === "bn" ? "কপি করা হয়েছে" : "Copied"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>{language === "bn" ? "কপি" : "Copy"}</span>
                  </>
                )}
              </button>
            )}
          </div>
          <div className="relative flex items-center">
            <input
              type="number"
              step="any"
              placeholder="e.g. 90.412500"
              value={longitude !== null ? longitude : ""}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onCoordinatesChange(latitude ?? 23.8103, isNaN(val) ? 0 : val);
              }}
              className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-[#014923] focus:ring-1 focus:ring-[#014923]"
            />
            <span className="absolute right-2.5 text-[10px] text-slate-400 font-bold uppercase pointer-events-none">
              °E
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

