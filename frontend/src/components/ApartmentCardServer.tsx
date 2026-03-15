import Link from "next/link";
import { Apartment } from "@/types";
import styles from "../assets/styles/ApartmentCard.module.css";

interface ApartmentCardServerProps {
  apartment: Apartment;
}

export default function ApartmentCardServer({
  apartment,
}: ApartmentCardServerProps) {
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("ru-RU").format(price);
  };

  const formatAddress = (): string => {
    const parts = [];
    if (apartment.district) parts.push(apartment.district);
    if (apartment.street) {
      let street = apartment.street;
      if (apartment.house_number) street += `, ${apartment.house_number}`;
      parts.push(street);
    }
    return parts.join(" · ");
  };

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    });
  };

  const getMetroTime = (): string | null => {
    if (!apartment.underground_time) return null;
    const match = apartment.underground_time.match(/(\d+)/);
    return match ? `${match[0]} мин` : apartment.underground_time;
  };

  const mainPhoto = apartment.main_photo
    ? `http://localhost:8000${apartment.main_photo}`
    : apartment.photo_paths
      ? `http://localhost:8000${apartment.photo_paths.split(",")[0]}`
      : "/placeholder.jpg";

  const photoCount =
    apartment.photo_count ||
    (apartment.photo_paths ? apartment.photo_paths.split(",").length : 0);
  const metroTime = getMetroTime();

  return (
    <Link href={`/apartment/${apartment.id}`} className={styles.card}>
      <div className={styles.cardImage}>
        <img
          src={mainPhoto}
          alt={`Квартира ${apartment.rooms_count} комн.`}
          loading="lazy"
        />
        {photoCount > 0 && (
          <span className={styles.photoCount}>
            <span>📸</span> {photoCount}
          </span>
        )}
        {apartment.is_urgent && (
          <span className={`${styles.badge} ${styles.urgent}`}>Срочно</span>
        )}
        {apartment.is_special && (
          <span className={`${styles.badge} ${styles.special}`}>
            Спецпредложение
          </span>
        )}
      </div>

      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <div className={styles.cardPrice}>
            {formatPrice(apartment.price)} ₽
          </div>
          {apartment.price_per_meter && apartment.price_per_meter > 0 && (
            <div className={styles.pricePerMeter}>
              {formatPrice(apartment.price_per_meter)} ₽/м²
            </div>
          )}
        </div>

        <div className={styles.cardTitle}>
          {apartment.rooms_count}-комнатная квартира
          {apartment.total_meters && ` · ${apartment.total_meters} м²`}
        </div>

        <div className={styles.cardAddress}>
          <span className={styles.addressIcon}>📍</span>
          <span className={styles.addressText}>{formatAddress()}</span>
        </div>

        {apartment.underground && (
          <div className={styles.cardMetro}>
            <span className={styles.metroIcon}>🚇</span>
            <span className={styles.metroText}>
              {apartment.underground}
              {apartment.underground_line && (
                <span
                  className={styles.metroLine}
                  style={{ backgroundColor: `#${apartment.underground_line}` }}
                />
              )}
            </span>
            {metroTime && <span className={styles.metroTime}>{metroTime}</span>}
          </div>
        )}

        <div className={styles.cardDetails}>
          {apartment.floor && apartment.floors_count && (
            <span className={styles.detailItem}>
              <span className={styles.detailIcon}>🏢</span>
              {apartment.floor}/{apartment.floors_count}
            </span>
          )}
          {apartment.living_meters && (
            <span className={styles.detailItem}>
              <span className={styles.detailIcon}>🛋️</span>
              {apartment.living_meters} м²
            </span>
          )}
          {apartment.kitchen_meters && (
            <span className={styles.detailItem}>
              <span className={styles.detailIcon}>🍳</span>
              {apartment.kitchen_meters} м²
            </span>
          )}
        </div>

        {apartment.amenities && apartment.amenities.length > 0 && (
          <div className={styles.cardAmenities}>
            {apartment.amenities.slice(0, 3).map((amenity, index) => (
              <span key={index} className={styles.amenityTag} title={amenity}>
                {amenity.length > 12 ? amenity.substring(0, 10) + "…" : amenity}
              </span>
            ))}
            {apartment.amenities.length > 3 && (
              <span className={`${styles.amenityTag} ${styles.more}`}>
                +{apartment.amenities.length - 3}
              </span>
            )}
          </div>
        )}

        <div className={styles.cardFooter}>
          <span className={styles.cardDate}>
            <span className={styles.dateIcon}>📅</span>
            {formatDate(apartment.parsed_date)}
          </span>
          {apartment.author_type && (
            <span
              className={`${styles.authorBadge} ${
                apartment.author_type === "Собственник"
                  ? styles.owner
                  : styles.agency
              }`}
            >
              {apartment.author_type}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
