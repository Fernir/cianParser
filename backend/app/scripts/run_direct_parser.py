"""
Скрипт для запуска HTML парсера CIAN с фотографиями
"""
import sys
import argparse
import logging
from pathlib import Path

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

# Добавляем путь к backend
backend_dir = Path(__file__).parent.parent.parent.absolute()
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal, engine, Base
from app.parser.direct_parser import HtmlCianParser
from app.models import Apartment

def parse_args():
    """Парсит аргументы командной строки"""
    parser = argparse.ArgumentParser(description="HTML парсер CIAN с фото")
    parser.add_argument('--clear', action='store_true', 
                       help='Очистить базу и все фото перед парсингом')
    parser.add_argument('--no-photos', action='store_true',
                       help='Не загружать фотографии')
    parser.add_argument('--pages', type=int, default=2,
                       help='Количество страниц для парсинга (по умолчанию 2)')
    parser.add_argument('--rooms', type=str, default='1,2',
                       help='Комнатность (например: 1,2 или 1 или 2)')
    return parser.parse_args()

def main():
    """Основная функция"""
    args = parse_args()
    
    print("\n" + "="*60)
    print("ЗАПУСК HTML ПАРСЕРА CIAN")
    print("="*60 + "\n")
    
    # Парсим комнаты
    rooms = tuple(int(r.strip()) for r in args.rooms.split(','))
    
    print(f"📊 Параметры:")
    print(f"   - Комнаты: {rooms}")
    print(f"   - Страниц: {args.pages}")
    print(f"   - Загрузка фото: {'НЕТ' if args.no_photos else 'ДА'}")
    print(f"   - Очистка БД и фото: {'ДА' if args.clear else 'НЕТ'}")
    print()
    
    # Создаем таблицы
    print("Создание таблиц в базе данных...")
    Base.metadata.create_all(bind=engine)
    print("✅ Таблицы созданы\n")
    
    # Подключаемся к БД
    print("Подключение к БД...")
    db = SessionLocal()
    
    try:
        # Проверяем текущее состояние
        before = db.query(Apartment).count()
        
        # Проверяем наличие фото
        from pathlib import Path
        photos_path = Path(__file__).parent.parent / "static" / "photos"
        photo_folders = list(photos_path.glob("apartment_*")) if photos_path.exists() else []
        photo_count = sum(len(list(f.glob("*.jpg"))) for f in photo_folders)
        
        print(f"📊 Текущих записей в базе: {before}")
        print(f"📸 Папок с фото: {len(photo_folders)}, фото: {photo_count}")
        print()
        
        # Создаем парсер
        print("🚀 Запуск парсера...")
        parser = HtmlCianParser(db)
        
        # Запускаем парсинг
        stats = parser.parse_apartments(
            rooms=rooms,
            pages=args.pages,
            clear_db=args.clear,
            download_photos=not args.no_photos
        )
        
        # Проверяем результат
        after = db.query(Apartment).count()
        new_records = after - before
        
        # Проверяем новые фото
        photo_folders_after = list(photos_path.glob("apartment_*")) if photos_path.exists() else []
        photo_count_after = sum(len(list(f.glob("*.jpg"))) for f in photo_folders_after)
        
        print("\n" + "="*60)
        print("ИТОГОВАЯ СТАТИСТИКА")
        print("="*60)
        print(f"📊 Было записей: {before}")
        print(f"📊 Стало записей: {after}")
        print(f"➕ Добавлено новых: {new_records}")
        print(f"📸 Было папок с фото: {len(photo_folders)}")
        print(f"📸 Стало папок с фото: {len(photo_folders_after)}")
        print(f"📈 Статистика парсера: {stats}")
        
        # Показываем несколько записей
        if after > 0:
            print("\n" + "="*60)
            print("ПОСЛЕДНИЕ ЗАПИСИ")
            print("="*60)
            apartments = db.query(Apartment).order_by(Apartment.id.desc()).limit(5).all()
            for apt in apartments:
                photo_paths = apt.photo_paths.split(',') if apt.photo_paths else []
                print(f"ID: {apt.id}")
                print(f"   Цена: {apt.price} ₽")
                print(f"   Комнат: {apt.rooms_count}")
                print(f"   Район: {apt.district}")
                print(f"   Метро: {apt.underground}")
                print(f"   Фото: {len(photo_paths)} шт.")
                print(f"   URL: {apt.url}")
                print()
        
    except Exception as e:
        print(f"\n❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()
        print("\n✅ Сессия БД закрыта")

if __name__ == "__main__":
    main()