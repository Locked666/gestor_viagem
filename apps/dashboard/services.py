from apps.travel.models import GastosViagens ,db, DocumentosViagens,TecnicosViagens
from sqlalchemy import and_,func,or_,extract
from apps.exceptions.exception import InvalidUsage
from apps.authentication.models import Users
from apps.models import Entidades
from dateutil.relativedelta import relativedelta

from datetime import date, timedelta,datetime
from calendar import monthrange

# Meses em PT-BR
MESES_COMPLETOS = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

MESES_ABREVIADOS = [
    "J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"
]



def get_travel_statistics_user(user_id):
    
    today = date.today()

    # Primeiro e último dia do mês atual
    first_day_current_month = today.replace(day=1)
    last_day_current_month = today.replace(day=monthrange(today.year, today.month)[1])

    # Primeiro e último dia do mês anterior
    first_day_previous_month = (first_day_current_month - timedelta(days=1)).replace(day=1)
    last_day_previous_month = first_day_current_month - timedelta(days=1)

    # Total de diárias do mês atual
    total_daily_month = db.session.query(
        func.sum(TecnicosViagens.v_diaria)
    ).filter(
        TecnicosViagens.data_inicio >= first_day_current_month,
        TecnicosViagens.data_fim <= last_day_current_month,
        TecnicosViagens.atribuito == True,
        TecnicosViagens.tecnico == user_id
    ).scalar() or 0

    # Total de diárias do mês anterior
    total_daily_previous_month = db.session.query(
        func.sum(TecnicosViagens.v_diaria)
    ).filter(
        TecnicosViagens.data_inicio >= first_day_previous_month,
        TecnicosViagens.data_fim <= last_day_previous_month,
        TecnicosViagens.atribuito == True,
        TecnicosViagens.tecnico == user_id
    ).scalar() or 0

    # Total de viagens do mês atual
    total_travels_current_month = db.session.query(
        func.count(TecnicosViagens.id)
    ).filter(
        TecnicosViagens.data_inicio >= first_day_current_month,
        TecnicosViagens.data_fim <= last_day_current_month,
        TecnicosViagens.atribuito == True,
        TecnicosViagens.tecnico == user_id
    ).scalar() or 0

    # Total de viagens do mês anterior
    total_travels_previous_month = db.session.query(
        func.count(TecnicosViagens.id)
    ).filter(
        TecnicosViagens.data_inicio >= first_day_previous_month,
        TecnicosViagens.data_fim <= last_day_previous_month,
        TecnicosViagens.atribuito == True,
        TecnicosViagens.tecnico == user_id
    ).scalar() or 0
    
    daily_equivalent_previous_month = ((total_daily_month - total_daily_previous_month)/ total_daily_previous_month) * 100

    return {
        "user_id": user_id,
        "total_daily_month": total_daily_month,
        "total_travels_current_month": total_travels_current_month,
        "total_daily_previous_month": total_daily_previous_month,
        "total_travels_previous_month": total_travels_previous_month,
        "first_day_current_month": first_day_current_month.isoformat(),
        "last_day_current_month": last_day_current_month.isoformat(),
        "first_day_previous_month": first_day_previous_month.isoformat(),
        "last_day_previous_month": last_day_previous_month.isoformat(),
        "daily_equivalent_previous_month": daily_equivalent_previous_month
    }



def obter_diarias_ultimos_12_meses(user_id):
    hoje = datetime.today()
    inicio_12_meses = (hoje.replace(day=1) - relativedelta(months=11)).replace(day=1)

    # Query: soma por ano e mês
    resultados = db.session.query(
        func.extract('year', TecnicosViagens.data_inicio).label('ano'),
        func.extract('month', TecnicosViagens.data_inicio).label('mes'),
        func.sum(TecnicosViagens.v_diaria).label('total')
    ).filter(
        TecnicosViagens.data_inicio >= inicio_12_meses,
        TecnicosViagens.atribuito == True,
        TecnicosViagens.tecnico == user_id
    ).group_by(
        'ano', 'mes'
    ).order_by(
        'ano', 'mes'
    ).all()

    # Dicionário: (ano, mês) -> total
    totais_por_mes = {
        (int(r.ano), int(r.mes)): float(r.total or 0)
        for r in resultados
    }

    # Montar os últimos 12 meses
    labels = []
    data = []
    tooltips = []

    for i in range(12):
        data_atual = inicio_12_meses + relativedelta(months=i)
        ano = data_atual.year
        mes = data_atual.month

        total = totais_por_mes.get((ano, mes), 0)

        labels.append(MESES_ABREVIADOS[mes - 1])
        tooltips.append(MESES_COMPLETOS[mes - 1])
        data.append(total)

    return {
        "labels": labels,
        "data": data,
        "tooltips": tooltips
    }
