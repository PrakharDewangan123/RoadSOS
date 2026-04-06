
import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, Share2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { toast } from "sonner";

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom marker creator
const createIcon = (color: string, emoji: string) =>
  L.divIcon({
    className: "",
    html: `<div style="
      background:${color};
      width:36px;height:36px;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      display:flex;align-items:center;justify-content:center;
      color:white;font-size:18px;">
      <div style="transform:rotate(45deg)">${emoji}</div>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });

// Icons
const userIcon = createIcon("#8B5CF6", "📍");
const hospitalIcon = createIcon("#EF4444", "🏥");
const policeIcon = createIcon("#3B82F6", "🚔");
const repairIcon = createIcon("#F59E0B", "🔧");

interface Service {
  id: string;
  name: string;
  type: "hospital" | "police" | "repair";
  lat: number;
  lng: number;
}

// Demo services
const SERVICES: Service[] = [
  {
    id: "1",
    name: "Hospital",
    type: "hospital",
    lat: 22.110751,
    lng: 82.141167,
  },
  {
    id: "2",
    name: "Police Station",
    type: "police",
    lat: 22.118632,
    lng: 82.140602,
  },
  {
    id: "3",
    name: "Vehicle Repair",
    type: "repair",
    lat: 22.111916,
    lng: 82.136505,
  },
];

interface SafeMapProps {
  onLocationShare?: (loc: [number, number]) => void;
}

export function SafeMap({ onLocationShare }: SafeMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // INIT MAP
  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current).setView([22.1287, 82.1376], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  // ADD SERVICES (runs once after map loads)
  useEffect(() => {
    if (!mapRef.current) return;

    SERVICES.forEach((s) => {
      let icon = hospitalIcon;
      if (s.type === "police") icon = policeIcon;
      if (s.type === "repair") icon = repairIcon;

      L.marker([s.lat, s.lng], { icon })
        .addTo(mapRef.current!)
        .bindPopup(`
          <b>${s.name}</b><br/>
          <button style="padding:6px 10px;background:#2563eb;color:white;border:none;border-radius:6px;cursor:pointer"
            onclick="window.open('https://maps.google.com/search/${s.type}+near+me')">
            🚑 Get Directions
          </button>
        `);
    });
  }, []);

  // GET USER LOCATION
  const getLocation = () => {
    if (!mapRef.current) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];

        setUserLocation(loc);

        mapRef.current!.setView(loc, 14);

        // REMOVE OLD MARKER
        if (userMarkerRef.current) {
          userMarkerRef.current.remove();
        }

        // ADD NEW MARKER
        userMarkerRef.current = L.marker(loc, { icon: userIcon })
          .addTo(mapRef.current!)
          .bindPopup("📍 You are here")
          .openPopup();

        toast.success("Location updated");
      },
      () => {
        toast.error("Location permission denied");
      }
    );
  };

  // SHARE LOCATION
  const shareLocation = () => {
    if (!userLocation) {
      toast.error("Get location first");
      return;
    }

    const link = `https://maps.google.com/?q=${userLocation[0]},${userLocation[1]}`;

    navigator.clipboard.writeText(link);

    toast.success("Location copied!");

    onLocationShare?.(userLocation);
  };

  return (
    <div className="space-y-4 pb-28">
      <Card className="p-4 flex gap-2 flex-wrap">
        <Button onClick={getLocation}>
          <Navigation className="mr-2 h-4 w-4" />
          Get Location
        </Button>

        <Button onClick={shareLocation} className="bg-purple-600 text-white">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </Card>

      <div
        ref={containerRef}
        style={{
          height: "400px",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      />

      <Card className="p-4">
        <h3 className="font-semibold">Emergency Services</h3>
        <p className="text-sm text-gray-600">
          Hospitals, police stations and repair services near you
        </p>
      </Card>
    </div>
  );
}