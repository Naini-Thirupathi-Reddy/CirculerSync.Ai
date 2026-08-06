import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Leaflet default icon fix
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

export const RouteMap = ({ stops = [] }) => {
  const defaultCenter = [40.7220, -73.9980]; // NYC SoHo / Lower Manhattan

  const coordinates = stops.map(stop => {
    const producer = stop.match?.wasteStream?.producer || {};
    return [producer.lat || 40.7128, producer.lng || -74.0060];
  });

  return (
    <div className="w-full h-80 rounded-lg overflow-hidden border border-loam/15 shadow-sm relative z-0">
      <MapContainer
        center={coordinates[0] || defaultCenter}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route Polyline connecting stops */}
        {coordinates.length > 1 && (
          <Polyline
            positions={coordinates}
            color="#5C6E45"
            weight={4}
            dashArray="6, 8"
          />
        )}

        {/* Marker Stops */}
        {stops.map((stop, idx) => {
          const producer = stop.match?.wasteStream?.producer || {};
          const consumer = stop.match?.resourceNeed?.consumer || {};
          const wasteStream = stop.match?.wasteStream || {};
          const lat = producer.lat || 40.7128;
          const lng = producer.lng || -74.0060;

          return (
            <Marker key={stop.id || idx} position={[lat, lng]}>
              <Popup>
                <div className="font-mono text-xs space-y-1">
                  <div className="font-bold text-moss">Stop #{stop.routeOrder || idx + 1}</div>
                  <div><strong>Producer:</strong> {producer.orgName || 'Producer'}</div>
                  <div><strong>Consumer Target:</strong> {consumer.orgName || 'Consumer'}</div>
                  <div><strong>Material:</strong> {wasteStream.wasteType} ({wasteStream.quantity}kg)</div>
                  <div><strong>Status:</strong> {stop.status}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
