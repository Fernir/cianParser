import { Link } from "react-router-dom";
import "../assets/styles/ApartmentCard.css";

const ApartmentCard = ({ apartment }) => {
  const mainPhoto = apartment.main_photo
    ? `http://localhost:8000${apartment.main_photo}`
    : apartment.photo_paths
      ? `http://localhost:8000${apartment.photo_paths.split(",")[0]}`
      : "/placeholder.jpg";

  const formatPrice = (price) => {
    return new Intl.NumberFormat("ru-RU").format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Дата неизвестна";
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    });
  };

  const getAuthorBadge = () => {
    if (apartment.is_owner) return { text: "Собственник", class: "owner" };
    if (apartment.is_agent) return { text: "Агентство", class: "agency" };
    if (apartment.is_builder) return { text: "Застройщик", class: "builder" };
    if (apartment.author_type)
      return {
        text: apartment.author_type,
        class: apartment.author_type === "Собственник" ? "owner" : "agency",
      };
    return null;
  };

  const authorBadge = getAuthorBadge();

  // Форматируем адрес
  const formatAddress = () => {
    const parts = [];
    if (apartment.district) parts.push(apartment.district);
    if (apartment.street) {
      let street = apartment.street;
      if (apartment.house_number) street += `, ${apartment.house_number}`;
      parts.push(street);
    }
    return parts.join(" · ");
  };

  // Форматируем метро
  const formatMetro = () => {
    if (!apartment.underground) return null;

    let metroText = apartment.underground;
    if (apartment.underground_time) {
      // Убираем лишние пробелы и форматируем
      const timeMatch = apartment.underground_time.match(/(\d+)/);
      if (timeMatch) {
        metroText += ` · ${timeMatch[0]} мин`;
      }
    }
    return metroText;
  };

  return (
    <Link to={`/apartment/${apartment.id}`} className="apartment-card">
      <div className="card-image">
        <img
          src={mainPhoto}
          alt={`Квартира ${apartment.rooms_count} комн.`}
          loading="lazy"
        />

        {(apartment.photo_count > 0 || apartment.photo_paths) && (
          <div className="photo-count">
            📸{" "}
            {apartment.photo_count ||
              apartment.photo_paths?.split(",").length ||
              0}
          </div>
        )}

        {apartment.is_urgent && <span className="badge urgent">Срочно</span>}
        {apartment.is_special && (
          <span className="badge special">Спецпредложение</span>
        )}
      </div>

      <div className="card-content">
        <div className="card-header">
          <div className="card-price">{formatPrice(apartment.price)} ₽/мес</div>
          {apartment.price_per_meter && (
            <div className="price-per-meter">
              {formatPrice(apartment.price_per_meter)} ₽/м²
            </div>
          )}
        </div>

        <div className="card-title">
          {apartment.rooms_count}-комнатная квартира
          {apartment.total_meters && `, ${apartment.total_meters} м²`}
        </div>

        {/* Адрес */}
        <div className="card-address">
          <span className="address-icon">📍</span>
          <span className="address-text">{formatAddress()}</span>
        </div>

        {/* Метро */}
        {formatMetro() && (
          <div className="card-metro">
            <span className="metro-icon">🚇</span>
            <span className="metro-text">{formatMetro()}</span>
            {apartment.underground_line && (
              <span
                className="metro-line"
                style={{ backgroundColor: `#${apartment.underground_line}` }}
              />
            )}
          </div>
        )}

        <div className="card-details">
          {apartment.floor && apartment.floors_count && (
            <span className="detail-item">
              <span className="detail-icon">🏢</span>
              {apartment.floor}/{apartment.floors_count} эт.
            </span>
          )}
          {apartment.living_meters && (
            <span className="detail-item">
              <span className="detail-icon">🛋️</span>
              Жилая {apartment.living_meters} м²
            </span>
          )}
          {apartment.kitchen_meters && (
            <span className="detail-item">
              <span className="detail-icon">🍳</span>
              Кухня {apartment.kitchen_meters} м²
            </span>
          )}
        </div>

        {/* Удобства */}
        {apartment.amenities && apartment.amenities.length > 0 && (
          <div className="card-amenities">
            {apartment.amenities.slice(0, 3).map((amenity, index) => {
              // Сокращаем длинные названия
              let shortName = amenity;
              if (amenity.length > 12) {
                shortName = amenity.substring(0, 10) + "…";
              }
              return (
                <span key={index} className="amenity-tag" title={amenity}>
                  {shortName}
                </span>
              );
            })}
            {apartment.amenities.length > 3 && (
              <span
                className="amenity-tag more"
                title={`Ещё ${apartment.amenities.length - 3}`}
              >
                +{apartment.amenities.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="card-footer">
          <div className="card-date">
            <span className="date-icon">📅</span>
            {formatDate(apartment.parsed_date)}
          </div>
          {authorBadge && (
            <span className={`author-badge ${authorBadge.class}`}>
              {authorBadge.text}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ApartmentCard;
