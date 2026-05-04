import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const universityIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const accommodationIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

function parseJsonArray(val: any): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch { return []; }
  }
  return [];
}

interface Accommodation {
  id: string;
  name: string;
  city: string;
  type: string;
  property_type?: string;
  price_per_month: number;
  latitude: number | null;
  longitude: number | null;
  travel_distance?: string;
  room_types?: any;
}

interface University {
  id: string;
  name: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
}

interface AccommodationMapProps {
  accommodations: Accommodation[];
  universities?: University[];
  onSelect?: (a: Accommodation) => void;
}

export function AccommodationMap({ accommodations, universities = [], onSelect }: AccommodationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  const mappable = accommodations.filter((a) => a.latitude && a.longitude);
  const uniMappable = universities.filter((u) => u.latitude && u.longitude);

  useEffect(() => {
    if (!mapRef.current) return;

    // Destroy previous map
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const defaultCenter: L.LatLngExpression = [3.1390, 101.6869];
    const map = L.map(mapRef.current, { scrollWheelZoom: true }).setView(defaultCenter, 12);
    mapInstance.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const allLatLngs: L.LatLng[] = [];

    // University markers
    uniMappable.forEach((u) => {
      const ll = L.latLng(u.latitude!, u.longitude!);
      allLatLngs.push(ll);
      L.marker(ll, { icon: universityIcon })
        .addTo(map)
        .bindPopup(`<div style="min-width:160px"><b style="color:#1a365d">${u.name}</b><br/><small>${u.city} • University</small></div>`);
    });

    // Accommodation markers
    mappable.forEach((a) => {
      const ll = L.latLng(a.latitude!, a.longitude!);
      allLatLngs.push(ll);
      const rooms = parseJsonArray(a.room_types);
      const popup = `
        <div style="min-width:180px">
          <b>${a.name}</b><br/>
          <small>${a.city} • ${a.type}</small><br/>
          ${a.travel_distance ? `<small>🕐 ${a.travel_distance}</small><br/>` : ""}
          ${rooms.length ? `<small>🛏 ${rooms.join(", ")}</small><br/>` : ""}
          <b style="color:#d69e2e">RM ${Number(a.price_per_month).toLocaleString()}/mo</b>
        </div>
      `;
      const marker = L.marker(ll, { icon: accommodationIcon }).addTo(map).bindPopup(popup);
      if (onSelect) {
        marker.on("click", () => onSelect(a));
      }
    });

    // Fit bounds
    if (allLatLngs.length > 1) {
      map.fitBounds(L.latLngBounds(allLatLngs), { padding: [40, 40], maxZoom: 14 });
    } else if (allLatLngs.length === 1) {
      map.setView(allLatLngs[0], 14);
    }

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [mappable.length, uniMappable.length]);

  if (mappable.length === 0 && uniMappable.length === 0) {
    return (
      <div className="h-[500px] rounded-md border bg-muted/30 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MapPin className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No locations with coordinates</p>
          <p className="text-sm">Add latitude & longitude in the admin panel to see them on the map.</p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="h-[500px] rounded-md overflow-hidden border shadow-sm z-0" />;
}
