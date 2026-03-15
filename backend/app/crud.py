from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, or_
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from . import models, schemas
import json
import logging

logger = logging.getLogger(__name__)

def get_apartment(db: Session, apartment_id: int):
    """Получить квартиру по ID"""
    return db.query(models.Apartment).filter(models.Apartment.id == apartment_id).first()


def get_apartment_by_url(db: Session, url: str):
    """Получить квартиру по URL"""
    return db.query(models.Apartment).filter(models.Apartment.url == url).first()

def get_apartment_by_cian_id(db: Session, cian_id: str):
    """Получить квартиру по ID CIAN"""
    return db.query(models.Apartment).filter(models.Apartment.cian_id == cian_id).first()

from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, or_
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from . import models, schemas
import json
import logging

logger = logging.getLogger(__name__)

def get_apartments(
    db: Session, 
    skip: int = 0, 
    limit: int = 10,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    rooms: Optional[List[int]] = None,
    district: Optional[str] = None,
    underground: Optional[str] = None,
    author_type: Optional[str] = None,
    min_area: Optional[float] = None,
    max_area: Optional[float] = None,
    has_photo: Optional[bool] = None,
    active_only: bool = True,
    sort_by: str = "parsed_date",
    sort_order: str = "desc"
):
    """
    Получить список квартир с фильтрацией и пагинацией
    """
    # Отладка входящих параметров
    logger.info("=" * 60)
    logger.info("ЗАПРОС КВАРТИР С ПАРАМЕТРАМИ:")
    logger.info(f"  skip: {skip}")
    logger.info(f"  limit: {limit}")
    logger.info(f"  min_price: {min_price}")
    logger.info(f"  max_price: {max_price}")
    logger.info(f"  rooms: {rooms}")
    logger.info(f"  district: '{district}'")
    logger.info(f"  underground: '{underground}'")
    logger.info(f"  author_type: '{author_type}'")
    logger.info(f"  min_area: {min_area}")
    logger.info(f"  max_area: {max_area}")
    logger.info(f"  has_photo: {has_photo}")
    logger.info(f"  active_only: {active_only}")
    logger.info(f"  sort_by: {sort_by}")
    logger.info(f"  sort_order: {sort_order}")
    logger.info("=" * 60)
    
    # Начинаем запрос
    query = db.query(models.Apartment)
    
    # Собираем условия фильтрации
    filters = []
    
    if active_only:
        filters.append(models.Apartment.is_active == True)
        logger.info("✅ Фильтр: только активные")
    
    if min_price is not None:
        filters.append(models.Apartment.price >= min_price)
        logger.info(f"✅ Фильтр: цена >= {min_price}")
    
    if max_price is not None:
        filters.append(models.Apartment.price <= max_price)
        logger.info(f"✅ Фильтр: цена <= {max_price}")
    
    if rooms:
        filters.append(models.Apartment.rooms_count.in_(rooms))
        logger.info(f"✅ Фильтр: комнаты {rooms}")
    
    if district:
        filters.append(models.Apartment.district.ilike(f"%{district}%"))
        logger.info(f"✅ Фильтр: район содержит '{district}'")
    
    if underground:
        filters.append(models.Apartment.underground.ilike(f"%{underground}%"))
        logger.info(f"✅ Фильтр: метро содержит '{underground}'")
    
    if author_type:
        filters.append(models.Apartment.author_type == author_type)
        logger.info(f"✅ Фильтр: тип автора '{author_type}'")
    
    if min_area is not None:
        filters.append(models.Apartment.total_meters >= min_area)
        logger.info(f"✅ Фильтр: площадь >= {min_area}")
    
    if max_area is not None:
        filters.append(models.Apartment.total_meters <= max_area)
        logger.info(f"✅ Фильтр: площадь <= {max_area}")
    
    if has_photo is not None:
        if has_photo:
            filters.append(models.Apartment.photo_paths.isnot(None))
            logger.info("✅ Фильтр: только с фото")
        else:
            filters.append(models.Apartment.photo_paths.is_(None))
            logger.info("✅ Фильтр: только без фото")
    
    # Применяем все фильтры
    if filters:
        query = query.filter(and_(*filters))
        logger.info(f"✅ Применено {len(filters)} фильтров")
    
    # Логируем SQL запрос (для отладки)
    logger.debug(f"SQL запрос: {query}")
    
    # Считаем общее количество ДО пагинации
    total = query.count()
    logger.info(f"📊 Найдено всего: {total} квартир")
    
    # Применяем сортировку
    if sort_by == "price_asc":
        query = query.order_by(models.Apartment.price.asc())
        logger.info("✅ Сортировка: по возрастанию цены")
    elif sort_by == "price_desc":
        query = query.order_by(models.Apartment.price.desc())
        logger.info("✅ Сортировка: по убыванию цены")
    elif sort_by == "area_asc":
        query = query.order_by(models.Apartment.total_meters.asc())
        logger.info("✅ Сортировка: по возрастанию площади")
    elif sort_by == "area_desc":
        query = query.order_by(models.Apartment.total_meters.desc())
        logger.info("✅ Сортировка: по убыванию площади")
    elif sort_by == "date_asc":
        query = query.order_by(models.Apartment.parsed_date.asc())
        logger.info("✅ Сортировка: сначала старые")
    elif sort_by == "date_desc":
        query = query.order_by(models.Apartment.parsed_date.desc())
        logger.info("✅ Сортировка: сначала новые")
    elif hasattr(models.Apartment, sort_by):
        if sort_order == "desc":
            query = query.order_by(desc(getattr(models.Apartment, sort_by)))
            logger.info(f"✅ Сортировка: по {sort_by} (убывание)")
        else:
            query = query.order_by(getattr(models.Apartment, sort_by))
            logger.info(f"✅ Сортировка: по {sort_by} (возрастание)")
    else:
        # По умолчанию
        query = query.order_by(desc(models.Apartment.parsed_date))
        logger.info("✅ Сортировка: по умолчанию (новые)")
    
    # Применяем пагинацию
    items = query.offset(skip).limit(limit).all()
    logger.info(f"📦 Возвращается: {len(items)} квартир (с {skip} по {skip+limit})")
    
    # Для отладки покажем первые несколько ID
    if items:
        ids = [item.id for item in items[:5]]
        logger.info(f"📌 ID первых квартир: {ids}")
    
    return items, total

def create_apartment(db: Session, apartment: Dict[str, Any]):
    """Создать новую квартиру"""
    db_apartment = models.Apartment(**apartment)
    db.add(db_apartment)
    db.commit()
    db.refresh(db_apartment)
    return db_apartment

def update_apartment(db: Session, apartment_id: int, apartment_update: Dict[str, Any]):
    """Обновить квартиру"""
    db_apartment = db.query(models.Apartment).filter(models.Apartment.id == apartment_id).first()
    if db_apartment:
        for key, value in apartment_update.items():
            if hasattr(db_apartment, key) and value is not None:
                setattr(db_apartment, key, value)
        db.commit()
        db.refresh(db_apartment)
    return db_apartment

def create_or_update_apartment(db: Session, apartment_data: Dict[str, Any]) -> tuple:
    """
    Создать или обновить квартиру
    """
    # Проверяем по URL или CIAN ID
    url = apartment_data.get('url')
    cian_id = apartment_data.get('cian_id')
    
    if not url and not cian_id:
        raise ValueError("URL или CIAN ID обязателен")
    
    existing = None
    if url:
        existing = db.query(models.Apartment).filter(models.Apartment.url == url).first()
    if not existing and cian_id:
        existing = db.query(models.Apartment).filter(models.Apartment.cian_id == cian_id).first()
    
    if existing:
        # Обновляем существующую
        for key, value in apartment_data.items():
            if hasattr(existing, key) and value is not None:
                setattr(existing, key, value)
        
        existing.last_check_date = datetime.now()
        existing.is_active = True
        
        db.commit()
        db.refresh(existing)
        
        logger.debug(f"Обновлена квартира ID={existing.id}, URL={url}")
        return existing, False
    else:
        # Создаем новую
        new_apartment = models.Apartment(**apartment_data)
        db.add(new_apartment)
        db.commit()
        db.refresh(new_apartment)
        
        logger.debug(f"Создана новая квартира ID={new_apartment.id}, URL={url}")
        return new_apartment, True

def mark_inactive_apartments(db: Session, days: int = 7):
    """
    Помечает как неактивные объявления, которые не обновлялись более N дней
    """
    cutoff_date = datetime.now() - timedelta(days=days)
    
    updated = db.query(models.Apartment).filter(
        models.Apartment.last_check_date < cutoff_date,
        models.Apartment.is_active == True
    ).update({"is_active": False})
    
    db.commit()
    return updated

def delete_old_photos(db: Session):
    """
    Удаляет информацию о фото для неактивных квартир
    """
    updated = db.query(models.Apartment).filter(
        models.Apartment.is_active == False,
        models.Apartment.photo_paths.isnot(None)
    ).update({"photo_paths": None, "photo_count": 0})
    
    db.commit()
    return updated

def get_statistics(db: Session):
    """Получить статистику по базе"""
    total = db.query(models.Apartment).count()
    active = db.query(models.Apartment).filter(models.Apartment.is_active == True).count()
    
    # Средняя цена по активным
    avg_price = db.query(models.Apartment).filter(
        models.Apartment.is_active == True
    ).with_entities(models.Apartment.price).all()
    
    if avg_price:
        avg_price = sum(p[0] for p in avg_price) / len(avg_price)
    else:
        avg_price = 0
    
    # Количество квартир с фото
    with_photo = db.query(models.Apartment).filter(
        models.Apartment.photo_paths.isnot(None)
    ).count()
    
    # Распределение по комнатам
    rooms_dist = {}
    for i in range(1, 5):
        count = db.query(models.Apartment).filter(
            models.Apartment.rooms_count == i,
            models.Apartment.is_active == True
        ).count()
        if count > 0:
            rooms_dist[f"{i}_room"] = count
    
    return {
        "total_apartments": total,
        "active_apartments": active,
        "average_price": round(avg_price, 2),
        "with_photo": with_photo,
        "rooms_distribution": rooms_dist,
        "last_update": db.query(models.Apartment).order_by(desc(models.Apartment.parsed_date)).first()
    }