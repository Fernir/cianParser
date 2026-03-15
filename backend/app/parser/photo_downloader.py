import os
import requests
import logging
import shutil
from typing import List
from pathlib import Path
from config import Config

logger = logging.getLogger(__name__)

# Глобальная переменная для пути к фото (устанавливается при инициализации)
PHOTOS_DIR = None

def set_photos_dir(path):
    """Устанавливает глобальный путь к фото"""
    global PHOTOS_DIR
    PHOTOS_DIR = Path(path)
    logger.info(f"📸 Директория для фото установлена: {PHOTOS_DIR}")

def get_photos_dir():
    """Возвращает путь к фото"""
    global PHOTOS_DIR
    if PHOTOS_DIR is None:
        # По умолчанию - папка static/photos в корне проекта
        PHOTOS_DIR = Path(__file__).parent.parent.parent.parent / "static" / "photos"
    return PHOTOS_DIR

def delete_apartment_photos(apartment_id: int) -> int:
    """
    Удаляет все фото для конкретной квартиры
    
    Args:
        apartment_id: ID квартиры
    
    Returns:
        количество удаленных фото
    """
    try:
        photos_dir = get_photos_dir()
        apartment_photo_dir = photos_dir / f"apartment_{apartment_id}"
        
        if not apartment_photo_dir.exists():
            logger.debug(f"📭 Папка с фото не найдена: {apartment_photo_dir}")
            return 0
        
        # Считаем фото
        photos = list(apartment_photo_dir.glob("*.jpg")) + \
                 list(apartment_photo_dir.glob("*.jpeg")) + \
                 list(apartment_photo_dir.glob("*.png")) + \
                 list(apartment_photo_dir.glob("*.webp"))
        
        photo_count = len(photos)
        
        # Удаляем папку
        shutil.rmtree(apartment_photo_dir)
        logger.info(f"🗑️ Удалена папка с фото: {apartment_photo_dir} ({photo_count} фото)")
        
        return photo_count
        
    except Exception as e:
        logger.error(f"❌ Ошибка при удалении фото квартиры {apartment_id}: {e}")
        return 0

def delete_all_photos() -> int:
    """
    Удаляет все фото всех квартир из файловой системы
    
    Returns:
        количество удаленных фото
    """
    try:
        photos_dir = get_photos_dir()
        
        if not photos_dir.exists():
            logger.info(f"📁 Папка с фото не существует: {photos_dir}")
            return 0
        
        # Находим все папки с фото
        apartment_dirs = list(photos_dir.glob("apartment_*"))
        total_photos = 0
        deleted_dirs = 0
        
        for dir_path in apartment_dirs:
            # Считаем фото в папке
            photos = list(dir_path.glob("*.jpg")) + \
                     list(dir_path.glob("*.jpeg")) + \
                     list(dir_path.glob("*.png")) + \
                     list(dir_path.glob("*.webp"))
            
            photo_count = len(photos)
            total_photos += photo_count
            
            # Удаляем папку
            try:
                shutil.rmtree(dir_path)
                deleted_dirs += 1
                logger.debug(f"🗑️ Удалена папка: {dir_path} ({photo_count} фото)")
            except Exception as e:
                logger.error(f"❌ Ошибка при удалении папки {dir_path}: {e}")
        
        if deleted_dirs > 0:
            logger.info(f"🗑️ Удалено {deleted_dirs} папок, всего {total_photos} фото")
        else:
            logger.info("📭 Нет папок с фото для удаления")
        
        return total_photos
        
    except Exception as e:
        logger.error(f"❌ Ошибка при удалении всех фото: {e}")
        return 0

def download_photos_for_apartment(apartment_id: int, photo_urls: List[str], max_photos: int = 5) -> List[str]:
    """
    Загружает фотографии для квартиры
    """
    logger.info(f"📸 НАЧАЛО ЗАГРУЗКИ ФОТО для квартиры {apartment_id}")
    logger.info(f"Получено URL: {len(photo_urls) if photo_urls else 0}")
    
    if not photo_urls:
        logger.warning(f"Нет URL фото для квартиры {apartment_id}")
        return []
    
    # Создаем базовую директорию для фото, если её нет
    base_photo_dir = get_photos_dir()
    logger.info(f"Базовая директория: {base_photo_dir.absolute()}")
    
    try:
        base_photo_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"✅ Директория создана/существует: {base_photo_dir.absolute()}")
    except Exception as e:
        logger.error(f"❌ Не удалось создать директорию: {e}")
        return []
    
    # Создаем папку для конкретной квартиры
    apartment_photo_dir = base_photo_dir / f"apartment_{apartment_id}"
    try:
        apartment_photo_dir.mkdir(exist_ok=True)
        logger.info(f"✅ Папка квартиры: {apartment_photo_dir.absolute()}")
    except Exception as e:
        logger.error(f"❌ Не удалось создать папку квартиры: {e}")
        return []
    
    downloaded_paths = []
    
    # Загружаем не больше max_photos
    for idx, url in enumerate(photo_urls[:max_photos]):
        try:
            # Формируем имя файла
            ext = _get_file_extension(url) or '.jpg'
            filename = f"photo_{idx+1}{ext}"
            filepath = apartment_photo_dir / filename
            
            logger.info(f"Загрузка {idx+1}/{len(photo_urls[:max_photos])}: {filename}")
            
            # Пропускаем, если файл уже существует
            if filepath.exists():
                logger.info(f"⏭️ Фото уже существует: {filename}")
                relative_path = f"/static/photos/apartment_{apartment_id}/{filename}"
                downloaded_paths.append(relative_path)
                continue
            
            # Загружаем фото
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.cian.ru/',
                'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
                'Connection': 'keep-alive',
            }
            
            logger.info(f"📡 Запрос к: {url}")
            
            response = requests.get(
                url, 
                headers=headers,
                timeout=15,
                stream=True
            )
            
            logger.info(f"📊 Статус ответа: {response.status_code}")
            
            if response.status_code == 200:
                # Проверяем размер контента
                content_length = response.headers.get('content-length')
                logger.info(f"📦 Размер: {content_length} байт")
                
                # Сохраняем файл
                with open(filepath, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)
                
                # Проверяем размер сохраненного файла
                file_size = filepath.stat().st_size
                logger.info(f"💾 Сохранено: {file_size} байт")
                
                if file_size > 1000:  # больше 1KB
                    relative_path = f"/static/photos/apartment_{apartment_id}/{filename}"
                    downloaded_paths.append(relative_path)
                    logger.info(f"✅ Успешно загружено: {filename} ({file_size} байт)")
                else:
                    logger.warning(f"⚠️ Файл слишком мал: {file_size} байт")
                    filepath.unlink()  # удаляем пустой файл
            else:
                logger.error(f"❌ Ошибка HTTP {response.status_code} для {url}")
                
        except requests.RequestException as e:
            logger.error(f"❌ Ошибка сети: {e}")
        except Exception as e:
            logger.error(f"❌ Неожиданная ошибка: {e}")
            import traceback
            traceback.print_exc()
    
    logger.info(f"📊 ИТОГ: Загружено {len(downloaded_paths)} из {len(photo_urls[:max_photos])} фото")
    return downloaded_paths

def _get_file_extension(url: str) -> str:
    """
    Определяет расширение файла по URL или заголовкам
    """
    # Пытаемся получить расширение из URL
    path = url.split('?')[0]  # Убираем query параметры
    ext = os.path.splitext(path)[1].lower()
    
    if ext in ['.jpg', '.jpeg', '.png', '.webp', '.gif']:
        return ext
    
    # По умолчанию возвращаем .jpg
    return '.jpg'