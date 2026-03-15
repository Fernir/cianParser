import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./ApartmentMap.css";

const ApartmentStaticMap = ({ latitude, longitude, address, price }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!latitude || !longitude || !mapRef.current) return;

    if (!mapInstanceRef.current) {
      // Отключаем атрибуцию при создании карты
      const map = L.map(mapRef.current, {
        attributionControl: false, // ← ВАЖНО: отключаем атрибуцию
      }).setView([latitude, longitude], 15);

      // Добавляем свои тилы
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        // Можно вообще убрать атрибуцию
        // attribution: 'Map data © OpenStreetMap'
      }).addTo(map);

      // Если хотите добавить свою атрибуцию (без флага)
      // L.control.attribution({ prefix: false }).addTo(map);

      // Добавляем маркер
      const marker = L.marker([latitude, longitude]).addTo(map);

      if (address || price) {
        marker.bindPopup(`
          <div style="text-align: center; padding: 5px;">
            ${address ? `<strong>${address}</strong><br/>` : ""}
            ${price ? `${price.toLocaleString("ru-RU")} ₽/мес` : ""}
          </div>
        `);
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
      <div className="map-placeholder">
        <span className="map-icon">🗺️</span>
        <p>Координаты не указаны</p>
      </div>
    );
  }

  return <div ref={mapRef} className="map-container" />;
};

export default ApartmentStaticMap;
