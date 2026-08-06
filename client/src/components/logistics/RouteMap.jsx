import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom SVG Pins for Pickup (Green) and Dropoff (Kraft/Brown)
const createCustomIcon = (type, number) => {
  const isPickup = type === 'PICKUP';
  const bgColor = isPickup ? '#5C6E45' : '#8C6D46';
  const label = isPickup ? `P${number}` : `D${number}`;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${bgColor};
        color: #F7F5F0;
        font-family: monospace;
        font-weight: bold;
        font-size: 11px;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #F7F5F0;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
      ">
        ${label}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

// Component to auto-fit map bounds dynamically
const AutoFitBounds = ({ points }) => {
  const map = useMap();
  React.useEffect(() => {
    if (points && points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [points, map]);
  return null;
};

export const RouteMap = ({ jobs = [], stops = [] }) => {
  const activeJobs = jobs.length > 0 ? jobs : stops;
  const defaultCenter = [40.7230, -73.9985]; // NYC SoHo / Lower Manhattan

  // Extract all points (Producers + Consumers)
  const routePoints = [];
  const markersList = [];

  activeJobs.forEach((job, idx) => {
    const ws = job.match?.wasteStream || {};
    const rn = job.match?.resourceNeed || {};

    const prodLat = ws.producer?.lat || 40.7230 + (idx * 0.003);
    const prodLng = ws.producer?.lng || -73.9985 - (idx * 0.004);

    const consLat = rn.consumer?.lat || 40.7265 + (idx * 0.002);
    const consLng = rn.consumer?.lng || -74.0062 + (idx * 0.003);

    // Add Producer pickup stop
    routePoints.push([prodLat, prodLng]);
    markersList.push({
      id: `${job.id}-p`,
      type: 'PICKUP',
      number: idx + 1,
      pos: [prodLat, prodLng],
      orgName: ws.producer?.orgName || 'GreenBean Cafe & Bakery',
      address: ws.producer?.address || '142 Mercer St, NY',
      material: `${ws.wasteType} (${ws.quantity || 45}kg)`,
      status: job.status || 'PENDING',
    });

    // Add Consumer dropoff stop
    routePoints.push([consLat, consLng]);
    markersList.push({
      id: `${job.id}-d`,
      type: 'DROPOFF',
      number: idx + 1,
      pos: [consLat, consLng],
      orgName: rn.consumer?.orgName || 'Mycelium Magic Mushrooms',
      address: rn.consumer?.address || '88 Broad St, NY',
      material: `${ws.wasteType} Intake`,
      status: job.status || 'PENDING',
    });
  });

  return (
    <div className="w-full h-[450px] rounded-xl overflow-hidden border border-loam/15 shadow-md relative z-0">
      <MapContainer
        center={routePoints[0] || defaultCenter}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {routePoints.length > 0 && <AutoFitBounds points={routePoints} />}

        {/* Animated Polyline Path connecting all stops */}
        {routePoints.length > 1 && (
          <Polyline
            positions={routePoints}
            color="#5C6E45"
            weight={4}
            opacity={0.8}
            dashArray="8, 12"
          />
        )}

        {/* Markers */}
        {markersList.map((m) => (
          <Marker
            key={m.id}
            position={m.pos}
            icon={createCustomIcon(m.type, m.number)}
          >
            <Popup>
              <div className="font-mono text-xs space-y-1 p-1">
                <div className={`font-bold ${m.type === 'PICKUP' ? 'text-moss' : 'text-kraft-deep'}`}>
                  {m.type === 'PICKUP' ? '📍 Pickup Stop' : '🏁 Dropoff Target'} #{m.number}
                </div>
                <div><strong>Organization:</strong> {m.orgName}</div>
                <div><strong>Address:</strong> {m.address}</div>
                <div><strong>Material:</strong> {m.material}</div>
                <div><strong>Job Status:</strong> <span className="uppercase font-bold">{m.status}</span></div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
