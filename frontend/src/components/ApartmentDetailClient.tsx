"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Apartment } from "@/types";
import PhotoGallery from "@/components/PhotoGallery";
import ApartmentPrice from "@/components/ApartmentPrice";
import ApartmentSpecs from "@/components/ApartmentSpecs";
import ApartmentLocation from "@/components/ApartmentLocation";
import ApartmentTerms from "@/components/ApartmentTerms";
import ApartmentAuthor from "@/components/ApartmentAuthor";
import ApartmentAmenities from "@/components/ApartmentAmenities";
import ApartmentMeta from "@/components/ApartmentMeta";
import styles from "../app/apartment/[id]/page.module.css";

// Динамический импорт карты с отключением SSR
const ApartmentMap = dynamic(() => import("@/components/ApartmentMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "250px",
        background: "var(--hover-bg)",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-muted)",
      }}
    >
      Загрузка карты...
    </div>
  ),
});

interface ApartmentDetailClientProps {
  apartment: Apartment;
  theme?: string;
}

export default function ApartmentDetailClient({
  apartment,
  theme = "light",
}: ApartmentDetailClientProps) {
  const photos = apartment.photo_paths ? apartment.photo_paths.split(",") : [];
  const fullAddress = [
    apartment.district,
    apartment.street,
    apartment.house_number,
    apartment.building && `корп. ${apartment.building}`,
    apartment.litter && `стр. ${apartment.litter}`,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Link href="/" className={styles.backLink}>
          ← Назад
        </Link>

        <div className={styles.grid}>
          <div className={styles.leftColumn}>
            <PhotoGallery photos={photos} apartmentId={apartment.id} />

            {apartment.description && (
              <div className={styles.description}>
                <h2 className={styles.descriptionTitle}>Описание</h2>
                <p className={styles.descriptionText}>
                  {apartment.description}
                </p>
              </div>
            )}
          </div>

          <div className={styles.rightColumn}>
            <h1 className={styles.title}>
              {apartment.rooms_count}-комнатная квартира
              {apartment.total_meters && `, ${apartment.total_meters} м²`}
            </h1>

            <ApartmentPrice
              price={apartment.price}
              pricePerMeter={apartment.price_per_meter}
            />

            <ApartmentLocation apartment={apartment} />
            <ApartmentSpecs apartment={apartment} />

            <ApartmentMap
              latitude={apartment.latitude ?? undefined}
              longitude={apartment.longitude ?? undefined}
              address={fullAddress}
              price={apartment.price}
            />

            <ApartmentTerms apartment={apartment} />
            <ApartmentAmenities amenities={apartment.amenities ?? undefined} />
            <ApartmentAuthor apartment={apartment} />
            <ApartmentMeta apartment={apartment} />

            <a
              href={apartment.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.originalLink}
            >
              Открыть на CIAN.ru
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
