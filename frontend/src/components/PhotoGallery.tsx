"use client";

import React, { useState } from "react";
import styles from "../assets/styles/PhotoGallery.module.css";

interface PhotoGalleryProps {
  photos: string[];
  apartmentId: number;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, apartmentId }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  if (!photos || photos.length === 0) {
    return (
      <div className={styles.galleryEmpty}>
        <span className={styles.noPhotoIcon}>📷</span>
        <p>Нет фотографий</p>
      </div>
    );
  }

  const photoUrls = photos.map((p) => `http://localhost:8000${p}`);

  const nextPhoto = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const openFullscreen = () => {
    setFullscreen(true);
    // Добавляем класс к body для блокировки скролла
    document.body.classList.add("fullscreen-open");
  };

  const closeFullscreen = () => {
    setFullscreen(false);
    // Убираем класс с body
    document.body.classList.remove("fullscreen-open");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      closeFullscreen();
    } else if (e.key === "ArrowRight") {
      nextPhoto();
    } else if (e.key === "ArrowLeft") {
      prevPhoto();
    }
  };

  return (
    <div className={styles.photoGallery}>
      <div className={styles.mainPhotoContainer}>
        <img
          src={photoUrls[selectedIndex]}
          alt={`Фото ${selectedIndex + 1}`}
          className={styles.mainPhoto}
          onClick={openFullscreen}
        />

        {photos.length > 1 && (
          <>
            <button
              className={`${styles.galleryNav} ${styles.prev}`}
              onClick={(e) => prevPhoto(e)}
            >
              ‹
            </button>
            <button
              className={`${styles.galleryNav} ${styles.next}`}
              onClick={(e) => nextPhoto(e)}
            >
              ›
            </button>
          </>
        )}

        <div className={styles.photoCounter}>
          {selectedIndex + 1} / {photos.length}
        </div>
      </div>

      {photos.length > 1 && (
        <div className={styles.photoThumbnails}>
          {photos.map((photo, index) => (
            <div
              key={index}
              className={`${styles.thumbnail} ${selectedIndex === index ? styles.active : ""}`}
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
          className={styles.fullscreenGallery}
          onClick={closeFullscreen}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <img
            src={photoUrls[selectedIndex]}
            alt="fullscreen"
            onClick={(e) => e.stopPropagation()}
          />

          {photos.length > 1 && (
            <>
              <button
                className={`${styles.fullscreenNav} ${styles.prev}`}
                onClick={(e) => {
                  e.stopPropagation();
                  prevPhoto();
                }}
              >
                ‹
              </button>
              <button
                className={`${styles.fullscreenNav} ${styles.next}`}
                onClick={(e) => {
                  e.stopPropagation();
                  nextPhoto();
                }}
              >
                ›
              </button>
            </>
          )}

          <div className={styles.fullscreenCounter}>
            {selectedIndex + 1} / {photos.length}
          </div>

          <button
            className={styles.closeFullscreen}
            onClick={(e) => {
              e.stopPropagation();
              closeFullscreen();
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
