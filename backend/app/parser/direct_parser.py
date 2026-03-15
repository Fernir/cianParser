import requests
import logging
import time
import random
import re
import json
import shutil
import signal
import threading
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path
from bs4 import BeautifulSoup
from .. import crud
from .photo_downloader import download_photos_for_apartment
from config import Config
from .geocoder import Geocoder

logger = logging.getLogger(__name__)
_parser_running = True

class HtmlCianParser:
    """
    Парсер CIAN через HTML - полный парсинг всех параметров
    """
    
    def __init__(self, db_session: Session):
        self.db = db_session
        self.stats = {
            "processed": 0,
            "new": 0,
            "updated": 0,
            "errors": 0
        }
        
        # Заголовки как у реального браузера
        self.session = requests.Session()
        self._update_headers()
        
        # Определяем путь к папке с фото
        self.photos_dir = Path(Config.PHOTOS_PATH)
        if not self.photos_dir.is_absolute():
            self.photos_dir = Path(__file__).parent.parent.parent.parent / self.photos_dir

        self.geocoder = Geocoder()  # Добавляем геокодер
        
        
    def _update_headers(self):
        """Обновляет заголовки сессии"""
        user_agents = [
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ]
        
        self.session.headers.update({
            'User-Agent': random.choice(user_agents),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0',
        })
    
    def clear_database(self):
        """Очищает базу данных и удаляет все фото перед парсингом"""
        try:
            from app.models import Apartment
            
            # Сначала удаляем все фото
            self._delete_all_photos()
            
            # Затем очищаем базу
            count = self.db.query(Apartment).count()
            if count > 0:
                self.db.query(Apartment).delete()
                self.db.commit()
                logger.info(f"🗑️ База данных очищена: удалено {count} записей")
            else:
                logger.info("📭 База данных уже пуста")
                
        except Exception as e:
            logger.error(f"❌ Ошибка при очистке базы: {e}")
            self.db.rollback()
    
    def _delete_all_photos(self):
        """Удаляет все фото из папки static/photos"""
        try:
            photos_path = Path(Config.PHOTOS_PATH)
            logger.info(f"🔍 Путь к фото для удаления: {photos_path}")
            logger.info(f"📁 Абсолютный путь: {photos_path.absolute()}")
            logger.info(f"📁 Существует: {photos_path.exists()}")
            
            # Проверим права доступа
            if photos_path.exists():
                logger.info(f"📁 Права доступа: {oct(photos_path.stat().st_mode)[-3:]}")
                
                # Посмотрим все содержимое папки
                all_contents = list(photos_path.glob("*"))
                logger.info(f"📊 Всего элементов в папке: {len(all_contents)}")
                
                for item in all_contents:
                    if item.is_dir():
                        logger.info(f"   📁 Папка: {item.name}")
                    else:
                        logger.info(f"   📄 Файл: {item.name}")
                
                # Теперь ищем папки с фото
                apartment_dirs = list(photos_path.glob("apartment_*"))
                logger.info(f"🔍 Найдено папок apartment_*: {len(apartment_dirs)}")
                
                for dir_path in apartment_dirs:
                    logger.info(f"   🗑️ Будет удалена: {dir_path}")
                    photos = list(dir_path.glob("*.jpg")) + list(dir_path.glob("*.jpeg")) + list(dir_path.glob("*.png"))
                    logger.info(f"      Фото в папке: {len(photos)}")
                
                photo_count = 0
                for dir_path in apartment_dirs:
                    photos = list(dir_path.glob("*.jpg")) + list(dir_path.glob("*.jpeg")) + list(dir_path.glob("*.png"))
                    photo_count += len(photos)
                    try:
                        shutil.rmtree(dir_path)
                        logger.info(f"   ✅ Удалена папка: {dir_path}")
                    except Exception as e:
                        logger.error(f"   ❌ Ошибка при удалении {dir_path}: {e}")
                
                if apartment_dirs:
                    logger.info(f"🗑️ Удалено {len(apartment_dirs)} папок с фото, всего {photo_count} фотографий")
                else:
                    logger.info("📭 Папка apartment_* не найдена")
                    
                # Проверим еще вариант с маленькой буквы
                apartment_dirs_lower = list(photos_path.glob("Apartment_*"))
                if apartment_dirs_lower:
                    logger.info(f"🔍 Найдено папок Apartment_* (с большой буквы): {len(apartment_dirs_lower)}")
                    
            else:
                logger.info(f"📁 Папка с фото не существует, создаем: {photos_path}")
                photos_path.mkdir(parents=True, exist_ok=True)
                
        except Exception as e:
            logger.error(f"❌ Ошибка при удалении фото: {e}")
            import traceback
            traceback.print_exc()

    def mark_inactive_apartments(self, active_urls: List[str]):
        """
        Помечает как неактивные квартиры, которых нет в текущей выгрузке
        """
        try:
            from app.models import Apartment
            
            # Получаем все активные квартиры из БД
            all_active = self.db.query(Apartment).filter(
                Apartment.is_active == True
            ).all()
            
            marked_count = 0
            for apt in all_active:
                if apt.url not in active_urls:
                    apt.is_active = False
                    marked_count += 1
                    logger.info(f"📌 Квартира ID={apt.id} помечена как неактивная (URL: {apt.url})")
            
            if marked_count > 0:
                self.db.commit()
                logger.info(f"✅ Помечено как неактивные: {marked_count} квартир")
            else:
                logger.info("📭 Нет устаревших квартир")
            
        except Exception as e:
            logger.error(f"❌ Ошибка при отметке неактивных квартир: {e}")
            self.db.rollback()

    def delete_inactive_apartments(self):
        """
        Полностью удаляет неактивные квартиры из БД и их фото
        """
        try:
            from app.models import Apartment
            from .photo_downloader import delete_apartment_photos
            
            # Находим все неактивные квартиры
            inactive = self.db.query(Apartment).filter(
                Apartment.is_active == False
            ).all()
            
            if not inactive:
                logger.info("📭 Нет неактивных квартир для удаления")
                return 0
            
            deleted_count = 0
            for apt in inactive:
                # Удаляем фото
                delete_apartment_photos(apt.id)
                
                # Удаляем запись из БД
                self.db.delete(apt)
                deleted_count += 1
                logger.info(f"🗑️ Удалена неактивная квартира ID={apt.id}")
            
            self.db.commit()
            logger.info(f"✅ Удалено неактивных квартир: {deleted_count}")
            return deleted_count
            
        except Exception as e:
            logger.error(f"❌ Ошибка при удалении неактивных квартир: {e}")
            self.db.rollback()
            return 0

    def parse_apartments(
        self, 
        rooms: Tuple[int, ...] = (1, 2), 
        pages: int = 3,
        clear_db: bool = False,
        download_photos: bool = True
    ) -> Dict[str, int]:
        """
        Парсит квартиры с HTML страниц
        """

        def check_interrupted():
            """Проверяет, не был ли прерван процесс"""
            if not _parser_running:
                raise KeyboardInterrupt()
            return True
        
        logger.info("=" * 60)
        logger.info("ЗАПУСК HTML ПАРСЕРА CIAN (ПОЛНЫЙ ПАРСИНГ)")
        if clear_db:
            logger.info("🧹 РЕЖИМ: Полная очистка (база + фото) перед парсингом")
        if download_photos:
            logger.info("📸 РЕЖИМ: Загрузка фотографий")
        logger.info("=" * 60)
        
        if clear_db:
            self.clear_database()
            self.stats = {"processed": 0, "new": 0, "updated": 0, "errors": 0}
        
        total_apartments = 0
        active_urls = []  # Список для сбора активных URL
        
        try: 
            for page in range(1, pages + 1):
                try:
                    check_interrupted()
                except KeyboardInterrupt:
                    logger.info("⏸️ Парсинг прерван пользователем")
                    break

                logger.info(f"Загрузка страницы {page}...")
                
                try:
                    url = self._build_search_url(page, rooms)
                    logger.info(f"URL: {url}")
                    
                    time.sleep(random.uniform(2, 4))
                    
                    response = self.session.get(url, timeout=30)
                    
                    if response.status_code == 200:
                        apartments = self._parse_search_page(response.text)
                        
                        if apartments:
                            logger.info(f"✅ Найдено {len(apartments)} квартир на странице {page}")
                            total_apartments += len(apartments)
                            
                            for idx, apt in enumerate(apartments, 1):
                                logger.info(f"Обработка квартиры {idx}/{len(apartments)}")
                                
                                # Добавляем URL в список активных
                                if apt.get('url'):
                                    active_urls.append(apt['url'])
                                
                                # Получаем детальную информацию о квартире
                                detailed_apt = self._parse_detail_page(apt.get('detail_url'))
                                if detailed_apt:
                                    apt.update(detailed_apt)
                                
                                self._process_apartment(apt, download_photos)
                                
                                if idx < len(apartments):
                                    time.sleep(random.uniform(1, 2))
                        else:
                            logger.warning(f"⚠️ Нет квартир на странице {page}")
                    else:
                        logger.error(f"❌ Ошибка HTTP {response.status_code} на странице {page}")
                        
                        if response.status_code == 403:
                            logger.warning("Получен 403, обновляем заголовки...")
                            self._update_headers()
                    
                except Exception as e:
                    logger.error(f"❌ Ошибка на странице {page}: {e}")
                    self.stats["errors"] += 1
                    continue

        except KeyboardInterrupt:
            logger.info("⏸️ Парсинг прерван пользователем")
        
        # Помечаем неактивные квартиры (которых нет в active_urls)
        if not clear_db:  # Не помечаем, если была полная очистка
            self.mark_inactive_apartments(active_urls)
        
        logger.info("=" * 60)
        logger.info("ПАРСИНГ ЗАВЕРШЕН")
        logger.info(f"Всего найдено: {total_apartments}")
        logger.info(f"Обработано: {self.stats['processed']}")
        logger.info(f"Новых: {self.stats['new']}")
        logger.info(f"Обновлено: {self.stats['updated']}")
        logger.info(f"Ошибок: {self.stats['errors']}")
        logger.info("=" * 60)
        
        return self.stats
    
    def _build_search_url(self, page: int, rooms: Tuple[int, ...]) -> str:
        """Формирует URL для поиска"""
        base_url = "https://www.cian.ru/cat.php"
        
        params = {
            "deal_type": "rent",
            "engine_version": "2",
            "offer_type": "flat",
            "p": page,
            "region": "1",
            "type": "4",
        }
        
        for i, room in enumerate(rooms, 1):
            params[f"room{i}"] = room
        
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"{base_url}?{query_string}"
    
    def _parse_search_page(self, html: str) -> List[Dict[str, Any]]:
        """Парсит страницу поиска"""
        apartments = []
        soup = BeautifulSoup(html, 'html.parser')
        
        cards = soup.find_all('article', {'data-name': 'CardComponent'})
        logger.info(f"Найдено карточек: {len(cards)}")
        
        for card in cards:
            try:
                apartment = self._parse_card_basic(card)
                if apartment:
                    apartments.append(apartment)
            except Exception as e:
                logger.error(f"Ошибка при парсинге карточки: {e}")
                continue
        
        return apartments
    
    def _normalize_price(self, price_text: str) -> int:
        """
        Нормализует цену из текста
        Примеры:
        "125 000 ₽/мес." -> 125000
        "125&nbsp;000&nbsp;₽" -> 125000
        "125 000" -> 125000
        "125000" -> 125000
        """
        if not price_text:
            return 0
        
        logger.debug(f"💰 Нормализация цены: '{price_text}'")
        
        # Заменяем HTML сущности на пробелы
        price_text = price_text.replace('&nbsp;', ' ')
        price_text = price_text.replace('&thinsp;', ' ')
        
        # Убираем все, кроме цифр и точек (для десятичных)
        # Но для рублей десятичных обычно нет, так что просто цифры
        price_digits = re.sub(r'[^\d]', '', price_text)
        
        if not price_digits:
            logger.warning(f"⚠️ Нет цифр в строке: '{price_text}'")
            return 0
        
        price = int(price_digits)
        logger.debug(f"💰 Цифры: {price}")
        
        # Нормализация
        if price < 1000:
            logger.warning(f"⚠️ Подозрительно маленькая цена: {price}")
            # Проверяем, нет ли в исходном тексте "тыс"
            if 'тыс' in price_text.lower() or 'т' in price_text.lower():
                price = price * 1000
                logger.debug(f"💰 Умножаем на 1000 (было 'тыс'): {price}")
            elif price < 100:
                # Скорее всего это тысячи (125 -> 125000)
                price = price * 1000
                logger.debug(f"💰 Умножаем на 1000 (предположительно): {price}")
        
        # Проверка на слишком большую цену
        if price > 10000000:
            logger.warning(f"⚠️ Слишком большая цена: {price}")
            # Возможно это копейки
            if price > 100000000:
                price = price // 100
                logger.debug(f"💰 Делим на 100: {price}")
        
        return price
    
    def _parse_card_basic(self, card) -> Optional[Dict[str, Any]]:
        """Парсит базовую информацию из карточки"""
        try:
            url_elem = card.find('a', href=True)
            if not url_elem:
                return None
            
            url = url_elem.get('href', '')
            if url.startswith('/'):
                url = f"https://www.cian.ru{url}"
            
            # Извлекаем ID из URL
            cian_id = None
            match = re.search(r'/(\d+)/', url)
            if match:
                cian_id = match.group(1)
            
            # Заголовок
            title_elem = card.find('span', {'data-mark': 'OfferTitle'})
            title = title_elem.text.strip() if title_elem else ''
            
            # Подзаголовок
            subtitle_elem = card.find('span', {'data-mark': 'OfferSubtitle'})
            subtitle = subtitle_elem.text.strip() if subtitle_elem else ''
            
            # Основные характеристики
            rooms_count = 1
            total_meters = None
            floor = None
            floors_count = None
            
            if subtitle:
                rooms_match = re.search(r'(\d+)[\- ]комн', subtitle)
                if rooms_match:
                    rooms_count = int(rooms_match.group(1))
                
                area_match = re.search(r'(\d+(?:[.,]\d+)?)\s*м²', subtitle)
                if area_match:
                    total_meters = float(area_match.group(1).replace(',', '.'))
                
                floor_match = re.search(r'(\d+)/(\d+)\s*этаж', subtitle)
                if floor_match:
                    floor = int(floor_match.group(1))
                    floors_count = int(floor_match.group(2))
            
            price_elem = card.find('span', {'data-mark': 'MainPrice'})
            if not price_elem:
                price_elem = card.find('span', class_=re.compile('.*price.*'))

            price = 0

            if price_elem:
                price_text = price_elem.get_text(strip=True)
                price = self._normalize_price(price_text)
            
            # Адрес
            address_info = self._parse_address_basic(card)
            
            # Фото
            photo_urls = self._parse_photos(card)
            
            # Автор
            author_info = self._parse_author_basic(card)
            
            apartment = {
                'url': url,
                'detail_url': url,  # Для перехода на детальную страницу
                'cian_id': cian_id,
                'title': title,
                'price': price,
                'rooms_count': rooms_count,
                'total_meters': total_meters,
                'floor': floor,
                'floors_count': floors_count,
                'photo_urls': photo_urls,
                **address_info,
                **author_info
            }
            
            return apartment
            
        except Exception as e:
            logger.error(f"Ошибка при парсинге карточки: {e}")
            return None
    
    def _parse_address_basic(self, card) -> Dict[str, Any]:
        """Парсит базовую информацию об адресе"""
        result = {
            'district': None,
            'street': None,
            'house_number': None,
            'underground': None,
            'underground_time': None
        }
        
        # Метро
        metro_elem = card.find('div', {'data-name': 'SpecialGeo'})
        if metro_elem:
            metro_link = metro_elem.find('a')
            if metro_link:
                result['underground'] = metro_link.text.strip()
            
            time_elem = metro_elem.find('div', class_=re.compile('.*remoteness.*'))
            if time_elem:
                time_text = time_elem.text.strip()
                time_match = re.search(r'(\d+)\s*мин', time_text)
                if time_match:
                    result['underground_time'] = f"{time_match.group(1)} мин"
        
        # Полный адрес
        address_labels = card.find_all('a', {'data-name': 'GeoLabel'})
        if address_labels:
            address_parts = [a.text.strip() for a in address_labels]
            
            for part in address_parts:
                if part in ['ЦАО', 'САО', 'ВАО', 'ЮАО', 'ЗАО', 'СЗАО', 'СВАО', 'ЮВАО', 'ЮЗАО']:
                    result['district'] = part
                elif 'улица' in part or 'проспект' in part or 'шоссе' in part:
                    result['street'] = part
        
        return result
    
    def _parse_author_basic(self, card) -> Dict[str, Any]:
        """Парсит базовую информацию об авторе"""
        result = {
            'author_type': None,
            'author': None
        }
        
        author_block = card.find('div', {'data-name': 'BrandingLevelWrapper'})
        if not author_block:
            author_block = card.find('div', class_=re.compile('.*contact.*'))
        
        if author_block:
            type_elem = author_block.find('span', class_=re.compile('.*textTransform__uppercase.*'))
            if type_elem:
                result['author_type'] = type_elem.text.strip()
            
            name_elem = author_block.find('span', class_=re.compile('.*fontWeight_bold.*'))
            if name_elem:
                result['author'] = name_elem.text.strip()
        
        return result
    
    def _parse_photos(self, card) -> List[str]:
        """Парсит URL фотографий"""
        photos = []
        
        gallery = card.find('div', {'data-name': 'Gallery'})
        if gallery:
            img_tags = gallery.find_all('img')
            for img in img_tags:
                src = img.get('src', '')
                if src and 'images.cdn-cian.ru' in src:
                    full_url = re.sub(r'-\d\.jpg', '-1.jpg', src)
                    if full_url not in photos:
                        photos.append(full_url)
        
        return photos[:10]
    
    def _parse_detail_page(self, url: str) -> Optional[Dict[str, Any]]:
        """Парсит детальную страницу квартиры"""
        try:
            logger.info(f"Загрузка детальной страницы: {url}")
            time.sleep(random.uniform(1, 2))
            
            try:
                response = self.session.get(url, timeout=30)
            except KeyboardInterrupt:
                logger.info("⏸️ Запрос прерван пользователем")
                raise  # Пробрасываем дальше для обработки
            except Exception as e:
                logger.error(f"Ошибка при запросе {url}: {e}")
                return None
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Ищем JSON-LD данные
                json_ld = soup.find('script', {'type': 'application/ld+json'})
                json_data = {}
                if json_ld:
                    try:
                        json_data = json.loads(json_ld.string)
                    except:
                        pass
                
                # Ищем скрипты с данными
                scripts = soup.find_all('script', type='application/json')
                offer_data = {}
                for script in scripts:
                    try:
                        data = json.loads(script.string)
                        if isinstance(data, dict) and 'offer' in data:
                            offer_data = data.get('offer', {})
                            break
                    except:
                        pass
                
                # Собираем все данные
                apartment = {}
                
                # Из JSON-LD
                if json_data:
                    apartment['description'] = json_data.get('description')
                    apartment['title'] = json_data.get('name')
                    
                    # Фото
                    if json_data.get('image'):
                        if isinstance(json_data['image'], list):
                            apartment['photo_urls'] = json_data['image']
                    
                    # Координаты
                    if json_data.get('geo'):
                        geo = json_data['geo']
                        if isinstance(geo, dict):
                            apartment['latitude'] = geo.get('latitude')
                            apartment['longitude'] = geo.get('longitude')
                
                # Характеристики
                features = self._parse_features(soup)
                apartment.update(features)
                
                # Условия аренды
                # conditions = self._parse_conditions(soup)
                # apartment.update(conditions)
                
                # Автор
                author_info = self._parse_author_detail(soup)
                apartment.update(author_info)
                
                # Даты
                dates = self._parse_dates(soup)
                apartment.update(dates)
                
                # Удаляем None значения
                apartment = {k: v for k, v in apartment.items() if v is not None}
                
                return apartment
                
        except Exception as e:
            logger.error(f"Ошибка при парсинге детальной страницы {url}: {e}")
            return None
    
    def _parse_features(self, soup) -> Dict[str, Any]:
        """Парсит характеристики квартиры"""
        result = {}
        
        # Ищем блок с характеристиками
        specs_section = soup.find('div', {'data-name': 'ObjectFactoids'})
        if specs_section:
            items = specs_section.find_all('div', {'data-name': 'ObjectFactoidsItem'})
            for item in items:
                text = item.text.strip()
                if 'Общая площадь' in text:
                    match = re.search(r'(\d+(?:[.,]\d+)?)', text)
                    if match:
                        result['total_meters'] = float(match.group(1).replace(',', '.'))
                elif 'Жилая площадь' in text:
                    match = re.search(r'(\d+(?:[.,]\d+)?)', text)
                    if match:
                        result['living_meters'] = float(match.group(1).replace(',', '.'))
                elif 'Площадь кухни' in text:
                    match = re.search(r'(\d+(?:[.,]\d+)?)', text)
                    if match:
                        result['kitchen_meters'] = float(match.group(1).replace(',', '.'))
                elif 'Этаж' in text:
                    match = re.search(r'(\d+)\s*из\s*(\d+)', text)
                    if match:
                        result['floor'] = int(match.group(1))
                        result['floors_count'] = int(match.group(2))
        
        # Ищем блок "О квартире"
        about_section = soup.find('div', {'data-name': 'OfferSummaryInfoGroup'})
        if about_section:
            items = about_section.find_all('div', {'data-name': 'OfferSummaryInfoItem'})
            for item in items:
                labels = item.find_all('p')
                if len(labels) >= 2:
                    key = labels[0].text.strip()
                    value = labels[1].text.strip()
                    
                    if 'Тип жилья' in key:
                        result['building_class'] = value
                    elif 'Санузел' in key:
                        result['bathroom'] = value
                    elif 'Вид из окон' in key:
                        result['windows'] = value
                    elif 'Ремонт' in key:
                        result['renovation_type'] = value
                    elif 'Год постройки' in key:
                        try:
                            result['building_year'] = int(value)
                        except:
                            pass
                    elif 'Тип дома' in key:
                        result['building_type'] = value
                    elif 'Парковка' in key:
                        result['parking'] = value
        
        # Ищем удобства
        amenities_section = soup.find('div', {'data-name': 'FeaturesLayout'})
        if amenities_section:
            amenities = []
            items = amenities_section.find_all('div', {'data-name': 'FeaturesItem'})
            for item in items:
                text = item.find('span')
                if text:
                    amenities.append(text.text.strip())
            
            if amenities:
                result['amenities'] = amenities
        
        return result
    
    def _parse_conditions(self, soup) -> Dict[str, Any]:
        """Парсит условия аренды"""
        result = {}
        
        aside = soup.find('div', {'data-name': 'OfferCardAside'})
        if aside:
            # Ищем цену
            price_elem = aside.find('div', {'data-testid': 'price-amount'})
            if price_elem:
                price_text = price_elem.text.strip()
                match = re.search(r'(\d+)', price_text.replace(' ', ''))
                if match:
                    result['price'] = int(match.group(1))
            
            # Ищем условия
            facts = aside.find_all('div', {'data-name': 'OfferFactItem'})
            for fact in facts:
                spans = fact.find_all('span')
                if len(spans) >= 2:
                    key = spans[0].text.strip()
                    value = spans[1].text.strip()
                    
                    if 'Залог' in key:
                        match = re.search(r'(\d+)', value.replace(' ', ''))
                        if match:
                            result['deposit'] = int(match.group(1))
                    elif 'Комиссия' in key:
                        result['commission'] = value
                    elif 'Предоплата' in key:
                        result['prepayment'] = value
                    elif 'Срок аренды' in key:
                        result['lease_term'] = value
        
        return result
    
    def _parse_author_detail(self, soup) -> Dict[str, Any]:
        """Парсит детальную информацию об авторе"""
        result = {}
        
        author_section = soup.find('div', {'data-name': 'SubscriptionAuthorBrand'})
        if not author_section:
            author_section = soup.find('div', {'data-name': 'AgencyBrandingAsideCardComponent'})
        
        if author_section:
            # Тип автора
            type_elem = author_section.find('span', class_=re.compile('.*textTransform__uppercase.*'))
            if type_elem:
                result['author_type'] = type_elem.text.strip()
            
            # Имя
            name_elem = author_section.find('div', {'data-name': 'SubscriptionAuthorName'})
            if name_elem:
                name_link = name_elem.find('a')
                if name_link:
                    result['author'] = name_link.text.strip()
            
            # ID автора
            name_link = author_section.find('a', href=re.compile(r'/agents/\d+'))
            if name_link:
                match = re.search(r'/agents/(\d+)', name_link.get('href', ''))
                if match:
                    result['author_id'] = match.group(1)
            
            # Рейтинг
            rating_elem = author_section.find('span', {'data-name': 'SubscriptionAuthorDignity'})
            if rating_elem:
                match = re.search(r'(\d+[.,]\d+)', rating_elem.text)
                if match:
                    result['author_rating'] = float(match.group(1).replace(',', '.'))
            
            # Статистика
            stats = author_section.find_all('dd')
            if len(stats) >= 2:
                try:
                    result['author_deals_count'] = int(stats[1].text.strip())
                except:
                    pass
        
        return result
    
    def _parse_dates(self, soup) -> Dict[str, Any]:
        """Парсит даты публикации"""
        result = {}
        
        meta_section = soup.find('div', {'data-name': 'OfferMetaData'})
        if meta_section:
            date_elem = meta_section.find('div', {'data-testid': 'metadata-updated-date'})
            if date_elem:
                date_text = date_elem.text.strip()
                # Парсим дату
                today = datetime.now()
                if 'сегодня' in date_text:
                    result['last_check_date'] = today
                elif 'вчера' in date_text:
                    from datetime import timedelta
                    result['last_check_date'] = today - timedelta(days=1)
                else:
                    # Пробуем распарсить конкретную дату
                    match = re.search(r'(\d{2})\.(\d{2})\.(\d{4})', date_text)
                    if match:
                        try:
                            day, month, year = map(int, match.groups())
                            result['published_date'] = datetime(year, month, day)
                        except:
                            pass
        
        return result
    
    def _process_apartment(self, apartment_data: Dict[str, Any], download_photos: bool = True):
        """Сохраняет квартиру в БД и загружает фото"""
        try:
            self.stats["processed"] += 1
            
            if not apartment_data.get('url'):
                logger.warning("Пропуск: нет URL")
                return
            
            # Извлекаем URL фото из данных
            photo_urls = apartment_data.pop('photo_urls', [])
            
            # Убираем служебные поля
            fields_to_remove = ['detail_url']
            for field in fields_to_remove:
                apartment_data.pop(field, None)
            
            # Добавляем служебные поля
            apartment_data['last_check_date'] = datetime.now()
            apartment_data['is_active'] = True
            apartment_data['photo_count'] = len(photo_urls)
            
            # Сохраняем в БД
            apartment, is_new = crud.create_or_update_apartment(self.db, apartment_data)
            
            # Если нет координат - пытаемся получить их по адресу
            if not apartment.latitude or not apartment.longitude:
                address = self.geocoder.format_address(apartment_data)
                logger.info(f"📍 Получение координат для: {address}")
                
                coords = self.geocoder.get_coordinates(address)
                if coords:
                    lat, lon = coords
                    crud.update_apartment(
                        self.db,
                        apartment.id,
                        {
                            'latitude': lat,
                            'longitude': lon,
                            'coordinates': f"{lat},{lon}"
                        }
                    )
                    logger.info(f"✅ Координаты добавлены: {lat}, {lon}")
            
            # Загружаем фото если нужно
            if download_photos and photo_urls and (is_new or not apartment.photo_paths):
                logger.info(f"📸 Загрузка {len(photo_urls)} фото для квартиры {apartment.id}")
                photo_paths = download_photos_for_apartment(apartment.id, photo_urls)
                
                if photo_paths:
                    crud.update_apartment(
                        self.db,
                        apartment.id,
                        {
                            'photo_paths': ','.join(photo_paths),
                            'photo_count': len(photo_paths),
                            'main_photo': photo_paths[0] if photo_paths else None
                        }
                    )
                    logger.info(f"✅ Загружено {len(photo_paths)} фото")
            
            if is_new:
                self.stats["new"] += 1
                logger.info(f"➕ Добавлена квартира ID={apartment.id}, цена={apartment.price}")
            else:
                self.stats["updated"] += 1
                logger.info(f"🔄 Обновлена квартира ID={apartment.id}, цена={apartment.price}")
            
        except Exception as e:
            logger.error(f"❌ Ошибка при сохранении: {e}")
            logger.error(f"Данные: {list(apartment_data.keys())}")
            self.stats["errors"] += 1
            import traceback
            traceback.print_exc()