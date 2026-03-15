from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
from pathlib import Path

from app.api import apartments
from app.database import engine, Base
from config import Config

# Создаем таблицы в БД
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=Config.API_TITLE,
    version=Config.API_VERSION
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[ 
        "http://localhost:3000",  # Next.js dev server
        "http://localhost:5173",  # Vite (на всякий случай)
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ВАЖНО: Правильный путь к статическим файлам
# FastAPI ищет файлы относительно ТЕКУЩЕЙ директории, откуда запущен процесс
# Но мы хотим использовать папку ../static (на уровень выше)

# Получаем абсолютный путь к папке static
current_dir = Path(__file__).parent  # backend/app/
project_root = current_dir.parent.parent  # cianLite/
static_dir = project_root / "static"

print(f"📁 Статические файлы из: {static_dir}")
print(f"📁 Существует: {static_dir.exists()}")

# Создаем папку если её нет
static_dir.mkdir(parents=True, exist_ok=True)

# Монтируем статические файлы
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# Подключаем роутеры
app.include_router(apartments.router, prefix="/api")

@app.get("/")
async def root():
    return {
        "message": "CIAN Parser API",
        "version": Config.API_VERSION,
        "static_dir": str(static_dir),
        "static_exists": static_dir.exists()
    }

@app.get("/health")
async def health():
    return {"status": "ok"}

# Добавим эндпоинт для проверки фото
@app.get("/debug/photos/{apartment_id}")
async def debug_photos(apartment_id: int):
    """Проверяет наличие фото для квартиры"""
    photo_dir = static_dir / "photos" / f"apartment_{apartment_id}"
    
    if not photo_dir.exists():
        return {"error": f"Папка не найдена: {photo_dir}"}
    
    files = list(photo_dir.glob("*.jpg"))
    return {
        "apartment_id": apartment_id,
        "photo_dir": str(photo_dir),
        "exists": photo_dir.exists(),
        "files": [f.name for f in files],
        "urls": [f"/static/photos/apartment_{apartment_id}/{f.name}" for f in files]
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True
    )