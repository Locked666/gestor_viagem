from datetime import datetime
from apps.exceptions.exception import InvalidUsage


def convert_to_datetime(dt):
    """
    Converte uma string ISO datetime para objeto datetime.datetime.
    """
    if not dt:
        return None
    try:
        return datetime.fromisoformat(dt)
    except (ValueError, TypeError) as err:
        raise InvalidUsage(f'Formato de data inválido: {err}', status_code=400)
