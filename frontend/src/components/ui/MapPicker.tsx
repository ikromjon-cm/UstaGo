"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const icon = L.divIcon({
  className: "",
  html: `<svg viewBox="0 0 24 24" fill="#2563EB" stroke="white" stroke-width="2" width="32" height="32"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface MapPickerProps {
  center: [number, number];
  onLocationChange: (lat: number, lng: number) => void;
  height?: string;
}

function LocationMarker({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyToCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom());
  }, [center, map]);
  return null;
}

export function MapPicker({ center, onLocationChange, height = "300px" }: MapPickerProps) {
  return (
    <div className="rounded-[16px] overflow-hidden border border-gray-200 dark:border-gray-700">
      <MapContainer
        center={center}
        zoom={14}
        style={{ height, width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} icon={icon} />
        <LocationMarker onLocationChange={onLocationChange} />
        <FlyToCenter center={center} />
      </MapContainer>
      <div className="p-2 text-center text-xs text-gray-400 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        Click on the map to set location
      </div>
    </div>
  );
}
