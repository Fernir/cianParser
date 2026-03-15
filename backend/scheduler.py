"""
Планировщик для автоматического запуска парсера
"""
import time
import logging
import schedule
import sys
import signal
import argparse
import threading
from pathlib import Path
from datetime import datetime

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('parser_scheduler.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Добавляем путь к backend
backend_dir = Path(__file__).parent.absolute()
sys.path.insert(0, str(backend_dir))

# Флаг для graceful shutdown
running = True
current_thread = None

def signal_handler(sig, frame):
    """Обработчик сигналов для graceful shutdown"""
    global running
    logger.info("\n🛑 Получен сигнал завершения, останавливаем планировщик...")
    running = False
    
    # Принудительно завершаем текущий поток, если он есть
    global current_thread
    if current_thread and current_thread.is_alive():
        logger.info("⏸️ Ожидаем завершения текущей задачи...")
        # Даем время на завершение
        time.sleep(2)

# Регистрируем обработчики сигналов
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

def run_parser_in_thread(clear_first: bool = False):
    """Запускает парсер в отдельном потоке"""
    global current_thread
    
    def target():
        try:
            run_parser(clear_first)
        except Exception as e:
            logger.error(f"Ошибка в потоке парсера: {e}")
    
    current_thread = threading.Thread(target=target)
    current_thread.daemon = True
    current_thread.start()
    
    # Ждем завершения потока с проверкой флага running
    while current_thread.is_alive() and running:
        current_thread.join(timeout=0.5)

def run_parser(clear_first: bool = False):
    """Функция для запуска парсера"""
    if not running:
        return
        
    logger.info("="*60)
    logger.info("ЗАПУСК ПАРСЕРА ПО РАСПИСАНИЮ")
    if clear_first:
        logger.info("🧹 РЕЖИМ: Очистка перед парсингом")
    logger.info("="*60)
    
    try:
        from app.database import SessionLocal
        from app.parser.direct_parser import HtmlCianParser
        
        db = SessionLocal()
        try:
            parser = HtmlCianParser(db)
            stats = parser.parse_apartments(
                rooms=(1, 2),
                pages=3,
                clear_db=clear_first,
                download_photos=True
            )
            logger.info(f"Статистика парсинга: {stats}")
        except KeyboardInterrupt:
            logger.info("⏸️ Парсинг прерван пользователем")
            db.rollback()
        except Exception as e:
            logger.error(f"Ошибка при парсинге: {e}")
            db.rollback()
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Ошибка при запуске парсера: {e}")
        import traceback
        traceback.print_exc()
    
    logger.info("="*60)

def cleanup_inactive():
    """Периодически удаляет неактивные квартиры"""
    if not running:
        return
        
    logger.info("="*60)
    logger.info("🧹 ЗАПУСК ОЧИСТКИ НЕАКТИВНЫХ КВАРТИР")
    logger.info("="*60)
    
    try:
        from app.database import SessionLocal
        from app.parser.direct_parser import HtmlCianParser
        
        db = SessionLocal()
        try:
            parser = HtmlCianParser(db)
            deleted = parser.delete_inactive_apartments()
            logger.info(f"✅ Удалено неактивных квартир: {deleted}")
        except KeyboardInterrupt:
            logger.info("⏸️ Очистка прервана пользователем")
            db.rollback()
        except Exception as e:
            logger.error(f"❌ Ошибка при очистке: {e}")
            db.rollback()
        finally:
            db.close()
    except Exception as e:
        logger.error(f"❌ Ошибка при очистке: {e}")
    
    logger.info("="*60)

def run_parser_with_retry(clear_first: bool = False):
    """Запуск парсера с повтором при ошибке"""
    if not running:
        return
        
    max_retries = 3
    for attempt in range(max_retries):
        if not running:
            break
        try:
            run_parser(clear_first)
            break
        except KeyboardInterrupt:
            logger.info("⏸️ Парсинг прерван пользователем")
            break
        except Exception as e:
            logger.error(f"Попытка {attempt + 1}/{max_retries} не удалась: {e}")
            if attempt < max_retries - 1 and running:
                time.sleep(60)

def main():
    global running
    
    parser = argparse.ArgumentParser(description="Планировщик парсера")
    parser.add_argument('--clear', action='store_true', help="Очищать базу перед каждым парсингом")
    parser.add_argument('--clear-first', action='store_true', help="Очистить базу при первом запуске")
    parser.add_argument('--interval', type=int, default=60, help="Интервал в минутах (по умолчанию 60)")
    parser.add_argument('--cleanup', action='store_true', help="Запустить очистку неактивных и выйти")
    
    args = parser.parse_args()
    
    cleanup_inactive()
    
    logger.info("🕐 Планировщик парсера запущен")
    if args.clear:
        logger.info("🧹 Режим: очистка перед каждым парсингом")
    logger.info("📋 Для остановки нажмите Ctrl+C")
    
    # Запускаем сразу при старте
    logger.info("Запуск первичного парсинга...")
    run_parser_with_retry(clear_first=args.clear_first or args.clear)
    
    # Настраиваем расписание для парсера
    schedule.every(args.interval).minutes.do(
        run_parser_with_retry, 
        clear_first=args.clear
    )
    
    # Очистка неактивных раз в день (в 3 часа ночи)
    schedule.every().day.at("03:00").do(cleanup_inactive)
    
    logger.info(f"📅 Расписание парсера: каждые {args.interval} минут")
    logger.info("📅 Расписание очистки: каждый день в 03:00")
    
    try:
        while running:
            schedule.run_pending()
            # Проверяем флаг running каждые 100мс
            for _ in range(10):  # 10 * 0.1 = 1 секунда
                if not running:
                    break
                time.sleep(0.1)
    except KeyboardInterrupt:
        logger.info("\n🛑 Планировщик остановлен пользователем")
    finally:
        running = False
        logger.info("👋 Завершение работы")

if __name__ == "__main__":
    main()