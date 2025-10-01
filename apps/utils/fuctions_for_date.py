from datetime import datetime, timedelta
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
    
    
def calcular_diarias(data_saida, data_retorno):
    """
    Calcula a quantidade de diárias com base em data de saída e retorno,
    considerando horários base de entrada (07:30) e saída (17:45).
    
    Parâmetros:
        data_saida (str ou datetime): Data/hora de saída
        data_retorno (str ou datetime): Data/hora de retorno

    Retorna:
        int: Quantidade de diárias
    """
    # Função auxiliar para converter string para datetime
    
    def parse_datetime(data):
        
        if isinstance(data, datetime):
            return data
        elif isinstance(data, str):
            try:
                return datetime.strptime(data, "%d/%m/%Y %H:%M")
            except ValueError:
                raise ValueError(f"Formato inválido: '{data}'. Use 'dd/mm/yyyy HH:MM'.")
        else:
            raise TypeError("Data deve ser uma string no formato 'dd/mm/yyyy HH:MM' ou um objeto datetime.")
    # Converte entradas se necessário
    data_saida = parse_datetime(data_saida)
    data_retorno = parse_datetime(data_retorno)

    # Validação de ordem cronológica
    if data_retorno < data_saida:
        raise ValueError("A data de retorno não pode ser anterior à data de saída.")

    # Horários base
    hora_base_entrada = datetime.strptime("07:30", "%H:%M").time()

    # Ajuste de data de saída para início do dia
    data_saida_ajustada = data_saida.replace(hour=0, minute=0, second=0, microsecond=0)

    # Ajuste da data de retorno
    if data_retorno.time() <= hora_base_entrada:
        # Se retornou até 07:30, não conta o dia do retorno
        data_retorno_ajustada = data_retorno.replace(hour=0, minute=0, second=0, microsecond=0)
    else:
        # Se passou de 07:30, conta o dia seguinte como última diária
        data_retorno_ajustada = (data_retorno + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)

    # Cálculo das diárias
    quantidade_diarias = (data_retorno_ajustada - data_saida_ajustada).days

    return quantidade_diarias

