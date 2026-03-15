import logging
import time
from typing import Optional, Tuple
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter
from geopy.exc import GeocoderTimedOut, GeocoderUnavailable

logger = logging.getLogger(__name__)

class Geocoder:
    """
    Класс для получения координат по адресу
    """
    
    def __init__(self):
        self.cache = {}  # Простой кэш
        self.last_request = 0
        self.min_delay = 1.0  # Минимальная задержка между запросами
        
        # Инициализируем геокодер Nominatim (OpenStreetMap)
        try:
            self.geolocator = Nominatim(user_agent="cian_parser", timeout=10)
            self.geocode = RateLimiter(self.geolocator.geocode, min_delay_seconds=1)
            logger.info("✅ Геокодер инициализирован")
        except Exception as e:
            logger.error(f"❌ Ошибка инициализации геокодера: {e}")
            self.geolocator = None
    
    def _wait_if_needed(self):
        """Ждет если нужно для соблюдения лимитов"""
        now = time.time()
        time_since_last = now - self.last_request
        if time_since_last < self.min_delay:
            time.sleep(self.min_delay - time_since_last)
        self.last_request = time.time()
    
    def get_coordinates(self, address: str) -> Optional[Tuple[float, float]]:
        """
        Получает координаты по адресу
        
        Args:
            address: адрес для геокодинга
        
        Returns:
            (latitude, longitude) или None
        """
        if not address or not self.geolocator:
            return None
        
        # Проверяем кэш
        cache_key = address.lower().strip()
        if cache_key in self.cache:
            logger.info(f"📦 Из кэша: {address}")
            return self.cache[cache_key]
        
        try:
            self._wait_if_needed()
            location = self.geolocator.geocode(address)
            
            if location:
                coords = (location.latitude, location.longitude)
                logger.info(f"✅ Найдены координаты: {address} -> {coords[0]}, {coords[1]}")
                self.cache[cache_key] = coords
                return coords
            else:
                logger.warning(f"⚠️ Не найдены координаты для: {address}")
                
        except GeocoderTimedOut:
            logger.warning(f"⏱️ Таймаут: {address}")
        except GeocoderUnavailable:
            logger.warning(f"🔴 Геокодер недоступен")
        except Exception as e:
            logger.error(f"❌ Ошибка геокодинга: {e}")
        
        return None
    
    def format_address(self, apartment_data: dict) -> str:
        """
        Форматирует адрес из данных квартиры
        """
        parts = []
        
        # Город (по умолчанию Москва)
        if apartment_data.get('city'):
            parts.append(apartment_data['city'])
        else:
            parts.append("Москва")
        
        # Район
        if apartment_data.get('district'):
            # Убираем лишние слова из района
            district = apartment_data['district']
            district = district.replace('район', '').replace('р-н', '').strip()
            parts.append(district)
        
        # Улица
        if apartment_data.get('street'):
            street = apartment_data['street']
            # Приводим к нормальному виду
            street = street.replace('улица', 'ул.').replace('проспект', 'пр-т')
            parts.append(street)
        
        # Номер дома
        house_parts = []
        if apartment_data.get('house_number'):
            house_parts.append(apartment_data['house_number'])
        if apartment_data.get('building'):
            house_parts.append(f"к{apartment_data['building']}")
        if apartment_data.get('litter'):
            house_parts.append(f"стр{apartment_data['litter']}")
        
        if house_parts:
            parts.append(" ".join(house_parts))
        
        return ", ".join(parts)