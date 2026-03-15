import logging
from typing import Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

def format_price(price: int) -> str:
    """Форматирует цену с пробелами"""
    return f"{price:,}".replace(",", " ")

def parse_cian_date(date_str: str) -> datetime:
    """Парсит дату в формате Циан"""
    # TODO: реализовать парсинг даты из Циан
    return datetime.now()

def safe_get(data: Dict[str, Any], *keys, default=None):
    """
    Безопасно получает значение из вложенного словаря
    """
    for key in keys:
        try:
            data = data[key]
        except (KeyError, TypeError, IndexError):
            return default
    return data

def clean_text(text: str) -> str:
    """Очищает текст от лишних пробелов и спецсимволов"""
    if not text:
        return ""
    return " ".join(text.strip().split())