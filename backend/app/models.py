from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, Index, JSON
from sqlalchemy.sql import func
from .database import Base

class Apartment(Base):
    __tablename__ = "apartments"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Основная информация
    url = Column(String(500), unique=True, index=True, nullable=False)
    cian_id = Column(String(100), unique=True, index=True)  # ID объявления на CIAN
    
    # Цена и условия
    price = Column(Integer, nullable=False)
    price_per_meter = Column(Integer)  # Цена за м²
    currency = Column(String(10), default="RUB")
    payment_period = Column(String(50), default="monthly")  # monthly, daily, yearly
    
    # Характеристики квартиры
    rooms_count = Column(Integer)
    bedrooms_count = Column(Integer)  # Количество спален
    total_meters = Column(Float)
    living_meters = Column(Float)  # Жилая площадь
    kitchen_meters = Column(Float)  # Площадь кухни
    
    # Этаж и дом
    floor = Column(Integer)
    floors_count = Column(Integer)
    building_type = Column(String(100))  # Панельный, Кирпичный, Монолитный и т.д.
    building_series = Column(String(100))  # Серия дома
    building_year = Column(Integer)  # Год постройки
    building_class = Column(String(50))  # Эконом, Комфорт, Бизнес, Элит
    ceiling_height = Column(Float)  # Высота потолков
    
    # Адрес
    region = Column(String(100))  # Регион/Область
    city = Column(String(100))  # Город
    district = Column(String(100))  # Район
    microdistrict = Column(String(100))  # Микрорайон
    street = Column(String(200))
    house_number = Column(String(50))
    building = Column(String(50))  # Корпус
    litter = Column(String(50))  # Строение
    apartment_number = Column(String(50))  # Номер квартиры
    coordinates = Column(String(100))  # "lat,lng"
    latitude = Column(Float)
    longitude = Column(Float)
    
    # Метро и транспорт
    underground = Column(String(100))
    underground_line = Column(String(100))  # Цвет ветки
    underground_time = Column(String(50))  # Время до метро
    underground_distance = Column(Integer)  # Расстояние до метро в метрах
    railway_station = Column(String(100))  # Ж/Д станция
    railway_time = Column(String(50))  # Время до ж/д
    transport_accessibility = Column(Text)  # JSON с данными о транспорте
    
    # Автор/Продавец
    author = Column(String(200))
    author_type = Column(String(50))  # Собственник, Агентство, Застройщик
    author_id = Column(String(100))
    author_phone = Column(String(100))  # Телефон(ы)
    author_agency = Column(String(200))  # Название агентства
    author_rating = Column(Float)  # Рейтинг автора
    author_deals_count = Column(Integer)  # Количество сделок
    
    # Описание и детали
    description = Column(Text)
    title = Column(String(500))
    short_description = Column(String(1000))
    
    # Ремонт и состояние
    renovation_type = Column(String(100))  # Косметический, Евро, Дизайнерский, Без ремонта
    renovation_year = Column(Integer)  # Год ремонта
    condition = Column(String(100))  # Хорошее, Среднее, Требует ремонта
    furniture = Column(String(100))  # Мебель: есть, частично, нет
    appliances = Column(String(100))  # Техника: есть, частично, нет
    
    # Удобства и особенности
    balcony = Column(String(100))  # Лоджия, Балкон, Несколько балконов
    bathroom = Column(String(100))  # Раздельный, Совмещенный, 2 с/у
    windows = Column(String(100))  # Во двор, На улицу, На 2 стороны
    view = Column(String(200))  # Вид из окон
    parking = Column(String(100))  # Парковка: есть, подземная, наземная, нет
    elevator = Column(String(100))  # Лифты: есть, грузовой/пассажирский
    garbage_chute = Column(Boolean)  # Мусоропровод
    
    # Коммунальные услуги
    utilities_included = Column(Boolean, default=False)  # Коммунальные платежи включены
    utilities_price = Column(Integer)  # Сумма коммунальных платежей
    electricity_included = Column(Boolean, default=False)
    water_included = Column(Boolean, default=False)
    heating_included = Column(Boolean, default=False)
    
    # Условия аренды
    deposit = Column(Integer)  # Залог
    commission = Column(Integer)  # Комиссия
    commission_percent = Column(Float)  # Комиссия в процентах
    prepayment = Column(Integer)  # Предоплата
    prepayment_months = Column(Integer)  # Количество месяцев предоплаты
    lease_term = Column(String(50))  # Длительность аренды: long, short, any
    children_allowed = Column(Boolean, default=True)
    pets_allowed = Column(Boolean, default=True)
    smoking_allowed = Column(Boolean, default=False)
    
    # Дополнительные характеристики (JSON поля для гибкости)
    amenities = Column(JSON)  # Список удобств: ["wifi", "tv", "fridge", "washer", "conditioner", etc]
    house_amenities = Column(JSON)  # Удобства в доме: ["playground", "parking", "security", etc]
    nearby_objects = Column(JSON)  # Объекты рядом: школы, сады, магазины
    
    # Специальные предложения
    is_special = Column(Boolean, default=False)  # Спецпредложение
    special_label = Column(String(100))  # Метка спецпредложения
    is_urgent = Column(Boolean, default=False)  # Срочно
    is_owner = Column(Boolean, default=False)  # Без посредников
    is_agent = Column(Boolean, default=False)  # От агентства
    is_builder = Column(Boolean, default=False)  # От застройщика
    
    # Дата публикации и обновления
    published_date = Column(DateTime)  # Дата публикации на сайте
    parsed_date = Column(DateTime, server_default=func.now())
    last_check_date = Column(DateTime, onupdate=func.now(), server_default=func.now())
    is_active = Column(Boolean, default=True)
    is_archived = Column(Boolean, default=False)  # Снято с продажи
    
    # Фото
    photo_paths = Column(Text)  # пути к фото через запятую
    photo_count = Column(Integer, default=0)  # Количество фото
    main_photo = Column(String(500))  # Главное фото
    
    # Видео
    video_urls = Column(Text)  # ссылки на видео через запятую
    video_count = Column(Integer, default=0)
    virtual_tour_url = Column(String(500))  # 3D тур
    
    # Статистика
    views_count = Column(Integer, default=0)  # Количество просмотров
    favorites_count = Column(Integer, default=0)  # В избранном
    
    # Технические поля
    source = Column(String(50), default="cian")  # Источник данных
    raw_data = Column(JSON)  # Сырые данные для отладки
    
    # Индексы для быстрого поиска
    __table_args__ = (
        Index('idx_price_rooms', 'price', 'rooms_count'),
        Index('idx_district_active', 'district', 'is_active'),
        Index('idx_underground', 'underground'),
        Index('idx_author_type', 'author_type'),
        Index('idx_parsed_date', 'parsed_date'),
        Index('idx_price_meters', 'price', 'total_meters'),
        Index('idx_metro_time', 'underground_time'),
    )
    
    def __repr__(self):
        return f"<Apartment {self.rooms_count}к {self.price}₽, {self.district}>"
    
    @property
    def photo_list(self):
        """Возвращает список фотографий"""
        if self.photo_paths:
            return self.photo_paths.split(',')
        return []
    
    @property
    def video_list(self):
        """Возвращает список видео"""
        if self.video_urls:
            return self.video_urls.split(',')
        return []
    
    @property
    def amenities_list(self):
        """Возвращает список удобств"""
        if self.amenities:
            return self.amenities
        return []
    
    @property
    def coord_tuple(self):
        """Возвращает координаты в виде кортежа"""
        if self.latitude and self.longitude:
            return (self.latitude, self.longitude)
        return None