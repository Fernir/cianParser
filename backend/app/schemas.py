from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

# Базовая схема
class ApartmentBase(BaseModel):
    url: str
    price: int = Field(..., ge=0)
    rooms_count: int = Field(..., ge=1, le=10)
    total_meters: Optional[float] = None
    floor: Optional[int] = None
    floors_count: Optional[int] = None
    district: Optional[str] = None
    street: Optional[str] = None
    underground: Optional[str] = None
    author_type: Optional[str] = None

# Для создания
class ApartmentCreate(ApartmentBase):
    photo_paths: Optional[str] = None

# Для обновления
class ApartmentUpdate(BaseModel):
    price: Optional[int] = None
    is_active: Optional[bool] = None
    photo_paths: Optional[str] = None
    last_check_date: Optional[datetime] = None

# Для ответа API
class ApartmentResponse(ApartmentBase):
    id: int
    photo_paths: Optional[str] = None
    parsed_date: datetime
    last_check_date: datetime
    is_active: bool
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    class Config:
        from_attributes = True  # вместо orm_mode в Pydantic v2

# Для пагинированного ответа
class PaginatedResponse(BaseModel):
    items: List[ApartmentResponse]
    total: int
    page: int
    pages: int
    per_page: int