import os
from pathlib import Path
from dotenv import load_dotenv

# Загружаем .env файл
env_path = Path(__file__).parent / '.env'
load_dotenv(env_path)

class Config:
    # Используем АБСОЛЮТНЫЙ путь к базе в папке backend
    BACKEND_DIR = Path(__file__).parent
    DATABASE_URL = f"sqlite:///{BACKEND_DIR}/cian_apartments.db"
    
    # Остальные настройки...
    PARSER_START_PAGE = int(os.getenv("PARSER_START_PAGE", "1"))
    PARSER_END_PAGE = int(os.getenv("PARSER_END_PAGE", "3"))
    PARSER_LOCATION = os.getenv("PARSER_LOCATION", "Москва")
    PHOTOS_PATH = os.getenv("PHOTOS_PATH", "../static/photos")
    API_TITLE = "CIAN Parser API"
    API_VERSION = "1.0.0"