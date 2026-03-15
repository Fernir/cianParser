import sys
from pathlib import Path

# Добавляем путь к backend в sys.path
backend_dir = Path(__file__).parent.parent / 'backend'
sys.path.append(str(backend_dir))

from app.database import engine, Base
from app.models import Apartment
from backend.config import Config

def init_database():
    """Создает таблицы в базе данных"""
    print(f"Инициализация базы данных: {Config.DATABASE_URL}")
    
    # Создаем все таблицы
    Base.metadata.create_all(bind=engine)
    
    print("✅ База данных успешно инициализирована")
    print(f"📁 Файл БД: {Config.DATABASE_URL.replace('sqlite:///', '')}")

def drop_database():
    """Удаляет все таблицы (осторожно!)"""
    confirm = input("Вы уверены? Это удалит ВСЕ данные! (yes/no): ")
    if confirm.lower() == 'yes':
        Base.metadata.drop_all(bind=engine)
        print("🗑️ Все таблицы удалены")
    else:
        print("❌ Отменено")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Управление базой данных")
    parser.add_argument('--drop', action='store_true', help="Удалить все таблицы")
    
    args = parser.parse_args()
    
    if args.drop:
        drop_database()
    else:
        init_database()