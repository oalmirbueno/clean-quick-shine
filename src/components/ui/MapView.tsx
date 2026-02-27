import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons (Leaflet bug with bundlers)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapMarker {
  lat: number;
  lng: number;
  label?: string;
  color?: "blue" | "green" | "red" | "orange";
  popup?: string;
}

interface MapViewProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  onMapClick?: (lat: number, lng: number) => void;
  draggableMarker?: boolean;
  onMarkerDrag?: (lat: number, lng: number) => void;
  showUserLocation?: boolean;
  className?: string;
  height?: string;
}

const markerColors: Record<string, string> = {
  blue: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  green: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  red: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  orange: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
};

export function MapView({
  center = { lat: -25.4284, lng: -49.2733 },
  zoom = 13,
  markers = [],
  onMapClick,
  draggableMarker = false,
  onMarkerDrag,
  showUserLocation = false,
  className = "",
  height = "300px",
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const userMarker = useRef<L.Marker | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    markersLayer.current = L.layerGroup().addTo(map);

    if (onMapClick) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    mapInstance.current = map;

    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update center
  useEffect(() => {
    if (mapInstance.current && center) {
      mapInstance.current.setView([center.lat, center.lng], zoom);
    }
  }, [center.lat, center.lng, zoom]);

  // Update markers
  useEffect(() => {
    if (!markersLayer.current) return;
    markersLayer.current.clearLayers();

    markers.forEach((m) => {
      const icon = m.color
        ? L.icon({
            iconUrl: markerColors[m.color] || markerColors.blue,
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          })
        : new L.Icon.Default();

      const marker = L.marker([m.lat, m.lng], {
        icon,
        draggable: draggableMarker,
      });

      if (m.popup || m.label) {
        marker.bindPopup(m.popup || m.label || "");
      }

      if (draggableMarker && onMarkerDrag) {
        marker.on("dragend", (e) => {
          const pos = e.target.getLatLng();
          onMarkerDrag(pos.lat, pos.lng);
        });
      }

      markersLayer.current!.addLayer(marker);
    });
  }, [markers, draggableMarker]);

  // User location
  useEffect(() => {
    if (!showUserLocation || !mapInstance.current) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);

        if (userMarker.current) {
          userMarker.current.setLatLng([loc.lat, loc.lng]);
        } else {
          const icon = L.divIcon({
            html: '<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 6px rgba(0,0,0,0.3)"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
            className: "",
          });
          userMarker.current = L.marker([loc.lat, loc.lng], { icon })
            .addTo(mapInstance.current!);
        }
      },
      (err) => console.warn("Geolocation error:", err),
      { enableHighAccuracy: true }
    );
  }, [showUserLocation]);

  return (
    <div
      ref={mapRef}
      className={`rounded-xl overflow-hidden ${className}`}
      style={{ height, width: "100%" }}
    />
  );
}
