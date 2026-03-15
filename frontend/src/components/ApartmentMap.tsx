"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "../assets/styles/ApartmentMap.module.css";

interface ApartmentMapProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  price?: number;
}

// Фикс для иконок в Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const ApartmentMap: React.FC<ApartmentMapProps> = ({
  latitude,
  longitude,
  address,
  price,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!latitude || !longitude || !mapRef.current) return;

    if (!mapInstanceRef.current) {
      // Отключаем атрибуцию при создании карты
      const map = L.map(mapRef.current, {
        attributionControl: false,
      }).setView([latitude, longitude], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Добавляем свою атрибуцию без флага
      L.control
        .attribution({
          prefix: false,
        })
        .addTo(map)
        .addAttribution(
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        );

      const marker = L.marker([latitude, longitude]).addTo(map);

      if (address || price) {
        const popupContent = `
          <div style="text-align: center; padding: 8px;">
            ${address ? `<strong>${address}</strong><br/>` : ""}
            ${price ? `${price.toLocaleString("ru-RU")} ₽/мес` : ""}
          </div>
        `;
        marker.bindPopup(popupContent);
      }

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([latitude, longitude], 15);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, address, price]);

  if (!latitude || !longitude) {
    return (
      <div className={styles.mapPlaceholder}>
        <span className={styles.mapIcon}>🗺️</span>
        <p>Координаты не указаны</p>
      </div>
    );
  }

  return <div ref={mapRef} className={styles.mapContainer} />;
};

export default ApartmentMap;
