#!/usr/bin/env python3
"""
Скрипт для очистки базы данных
"""
import sys
from pathlib import Path

# Добавляем путь
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app.models import Apartment
from app.parser.photo_downloader import delete_apartment_photos

def clear_database(confirm=True):
    """Очищает базу данных"""
    print("="*60)
    print("ОЧИСТКА БАЗЫ ДАННЫХ")
    print("="*60)
    
    db = SessionLocal()
    
    try:
        # Считаем записи
        count = db.query(Apartment).count()
        active = db.query(Apartment).filter(Apartment.is_active == True).count()
        inactive = db.query(Apartment).filter(Apartment.is_active == False).count()
        
        print(f"📊 Всего записей: {count}")
        print(f"✅ Активных: {active}")
        print(f"⏳ Неактивных: {inactive}")
        
        if count == 0:
            print("📭 База данных уже пуста")
            return
        
        if confirm:
            response = input(f"❓ Удалить ВСЕ {count} записей? (yes/no): ")
            if response.lower() != 'yes':
                print("❌ Операция отменена")
                return
        
        # Удаляем фото для всех квартир
        apartments = db.query(Apartment).all()
        for apt in apartments:
            delete_apartment_photos(apt.id)
        
        # Удаляем все записи
        db.query(Apartment).delete()
        db.commit()
        
        print(f"✅ Успешно удалено {count} записей")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        db.rollback()
    finally:
        db.close()

def clear_inactive_only(confirm=True):
    """Удаляет только неактивные записи"""
    print("="*60)
    print("ОЧИСТКА НЕАКТИВНЫХ ЗАПИСЕЙ")
    print("="*60)
    
    db = SessionLocal()
    
    try:
        # Считаем неактивные записи
        inactive = db.query(Apartment).filter(Apartment.is_active == False).all()
        inactive_count = len(inactive)
        active = db.query(Apartment).filter(Apartment.is_active == True).count()
        
        print(f"📊 Активных записей: {active}")
        print(f"📊 Неактивных записей: {inactive_count}")
        
        if inactive_count == 0:
            print("📭 Нет неактивных записей")
            return
        
        if confirm:
            response = input(f"❓ Удалить {inactive_count} неактивных записей? (yes/no): ")
            if response.lower() != 'yes':
                print("❌ Операция отменена")
                return
        
        # Удаляем фото для неактивных квартир
        for apt in inactive:
            delete_apartment_photos(apt.id)
            db.delete(apt)
            print(f"🗑️ Удалена квартира ID={apt.id}")
        
        db.commit()
        
        print(f"✅ Успешно удалено {inactive_count} неактивных записей")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Очистка базы данных")
    parser.add_argument('--all', action='store_true', help="Удалить все записи")
    parser.add_argument('--inactive', action='store_true', help="Удалить только неактивные")
    parser.add_argument('--force', action='store_true', help="Без подтверждения")
    
    args = parser.parse_args()
    
    if args.all:
        clear_database(confirm=not args.force)
    elif args.inactive:
        clear_inactive_only(confirm=not args.force)
    else:
        print("Использование: python clear_db.py --all или --inactive")