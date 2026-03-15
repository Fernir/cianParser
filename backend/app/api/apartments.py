from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional, List
from .. import crud, schemas
from ..database import get_db
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/apartments", tags=["apartments"])

@router.get("/", response_model=schemas.PaginatedResponse)
async def read_apartments(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Номер страницы"),
    per_page: int = Query(12, ge=1, le=100, description="Элементов на странице"),
    min_price: Optional[int] = Query(None, ge=0, description="Мин. цена"),
    max_price: Optional[int] = Query(None, ge=0, description="Макс. цена"),
    rooms: Optional[str] = Query(None, description="Комнатность (1,2,3 через запятую)"),
    district: Optional[str] = Query(None, description="Район"),
    underground: Optional[str] = Query(None, description="Метро"),
    author_type: Optional[str] = Query(None, description="Тип автора"),
    min_area: Optional[float] = Query(None, ge=0, description="Мин. площадь"),
    max_area: Optional[float] = Query(None, ge=0, description="Макс. площадь"),
    has_photo: Optional[bool] = Query(None, description="Только с фото"),
    active_only: bool = Query(True, description="Только активные"),
    sort_by: str = Query("date_desc", pattern="^(price_asc|price_desc|area_asc|area_desc|date_asc|date_desc|parsed_date|price|rooms_count|total_meters)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$")
):
    """
    Получить список квартир с пагинацией и фильтрацией
    """
    # Отладка
    logger.info(f"🔍 API запрос: page={page}, per_page={per_page}")
    logger.info(f"🔍 Параметры: min_price={min_price}, max_price={max_price}, rooms={rooms}")
    
    # Парсим комнаты из строки
    rooms_list = None
    if rooms:
        try:
            rooms_list = [int(r.strip()) for r in rooms.split(",")]
            logger.info(f"✅ Комнаты: {rooms_list}")
        except ValueError:
            logger.error(f"❌ Неверный формат rooms: {rooms}")
            raise HTTPException(status_code=400, detail="Неверный формат параметра rooms")
    
    skip = (page - 1) * per_page
    
    items, total = crud.get_apartments(
        db, 
        skip=skip, 
        limit=per_page,
        min_price=min_price,
        max_price=max_price,
        rooms=rooms_list,
        district=district,
        underground=underground,
        author_type=author_type,
        min_area=min_area,
        max_area=max_area,
        has_photo=has_photo,
        active_only=active_only,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    pages = (total + per_page - 1) // per_page if total > 0 else 1
    
    response = {
        "items": items,
        "total": total,
        "page": page,
        "pages": pages,
        "per_page": per_page
    }
    
    logger.info(f"✅ Ответ: {len(items)} квартир из {total}")
    
    return response

@router.get("/{apartment_id}", response_model=schemas.ApartmentResponse)
async def read_apartment(
    apartment_id: int, 
    db: Session = Depends(get_db)
):
    """
    Получить детальную информацию о конкретной квартире
    """
    apartment = crud.get_apartment(db, apartment_id)
    if not apartment:
        raise HTTPException(status_code=404, detail="Квартира не найдена")
    return apartment

@router.get("/stats/overview")
async def get_statistics(db: Session = Depends(get_db)):
    """
    Получить общую статистику по базе
    """
    return crud.get_statistics(db)

@router.post("/{apartment_id}/refresh")
async def refresh_apartment(
    apartment_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Запустить обновление конкретной квартиры (фоново)
    """
    apartment = crud.get_apartment(db, apartment_id)
    if not apartment:
        raise HTTPException(status_code=404, detail="Квартира не найдена")
    
    # Добавляем задачу в фон
    background_tasks.add_task(refresh_apartment_task, apartment_id)
    
    return {"message": f"Обновление квартиры {apartment_id} запущено"}

async def refresh_apartment_task(apartment_id: int):
    """Фоновая задача для обновления квартиры"""
    # Здесь будет логика перепарсинга конкретной квартиры
    logger.info(f"Обновление квартиры {apartment_id}")
    # TODO: реализовать