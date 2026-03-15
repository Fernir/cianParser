import React, { useState } from "react";
import "./PhotoGallery.css";

const PhotoGallery = ({ photos, apartmentId }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  if (!photos || photos.length === 0) {
    return (
      <div className="gallery-empty">
        <span className="no-photo-icon">📷</span>
        <p>Нет фотографий</p>
      </div>
    );
  }

  const photoUrls = photos.map((p) => `http://localhost:8000${p}`);

  const nextPhoto = () => {
    setSelectedIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setSelectedIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="photo-gallery">
      <div className="main-photo-container">
        <img
          src={photoUrls[selectedIndex]}
          alt={`Фото ${selectedIndex + 1}`}
          className="main-photo"
          onClick={() => setFullscreen(true)}
        />

        {photos.length > 1 && (
          <>
            <button className="gallery-nav prev" onClick={prevPhoto}>
              ‹
            </button>
            <button className="gallery-nav next" onClick={nextPhoto}>
              ›
            </button>
          </>
        )}

        <div className="photo-counter">
          {selectedIndex + 1} / {photos.length}
        </div>
      </div>

      {photos.length > 1 && (
        <div className="photo-thumbnails">
          {photos.map((photo, index) => (
            <div
              key={index}
              className={`thumbnail ${selectedIndex === index ? "active" : ""}`}
              onClick={() => setSelectedIndex(index)}
            >
              <img
                src={`http://localhost:8000${photo}`}
                alt={`thumb ${index + 1}`}
              />
            </div>
          ))}
        </div>
      )}

      {fullscreen && (
        <div
          className="fullscreen-gallery"
          onClick={() => setFullscreen(false)}
        >
          <img src={photoUrls[selectedIndex]} alt="fullscreen" />
          <button className="close-fullscreen">×</button>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
