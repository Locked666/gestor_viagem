from flask import jsonify, render_template, make_response, url_for
from flask_login import current_user
from sqlalchemy.orm import aliased
from sqlalchemy import and_, not_
from apps.exceptions.exception import InvalidUsage
from apps.travel.models import RegistroViagens,db, TecnicosViagens
from apps.models import Entidades
from apps.authentication.models import Users
from apps.utils.fuctions_for_date import convert_to_datetime
from datetime import datetime, date
import calendar
# from weasyprint import HTML


def print_report_daily_user(data):
    
    template_html = 'relatorios/model_print/relatorio_diarias_user.html'
    
    if not data: 
        raise InvalidUsage(message="Necessário o envio das informações:", status_code=401)
    
    model_html = render_template(template_html, dailys = data)
    
    
    
    
    pass


def get_competence(month: int, year: int = 2025):
    # Verifica se o mês está dentro do intervalo válido
    if not 1 <= month <= 12:
        raise ValueError("Mês inválido. Use um número de 1 a 12.")

    # Lista com nomes dos meses em português (1-based)
    month_names = [
        '',  # índice 0 ignorado
        'janeiro', 'fevereiro', 'março', 'abril',
        'maio', 'junho', 'julho', 'agosto',
        'setembro', 'outubro', 'novembro', 'dezembro'
    ]

    # Obtém o número de dias do mês, considerando anos bissextos
    last_day = calendar.monthrange(year, month)[1]

    date_start = date(year, month, 1).isoformat()
    date_end = date(year, month, last_day).isoformat()

    return {
        'name_month': month_names[month],
        'date_start': datetime.strptime(date_start,"%Y-%m-%d"),
        'date_end': datetime.strptime(date_end,"%Y-%m-%d")
    }

def query_daily_travel(date_start, date_end,db,user):
   
    try:
        # Aliases opcionais para facilitar leitura
        rv = RegistroViagens
        tv = TecnicosViagens
        u = Users
        e = Entidades

        query = (
            db.session.query(
                rv.id,
                rv.entidade_destino,
                e.nome, 
                rv.status,
                rv.tipo_viagem,
                rv.local_viagem,
                rv.descricao,
                tv.tecnico,
                u.username,
                tv.data_inicio,
                tv.data_fim,
                tv.n_diaria,
                tv.v_diaria,
                tv.n_intranet
            )
            .outerjoin(tv, tv.viagem == rv.id)  # LEFT JOIN tecnicos_viagens
            .outerjoin(u, u.id == tv.tecnico)   # LEFT JOIN users
            .outerjoin(e, e.id == rv.entidade_destino)   # LEFT JOIN users
            .filter(
                tv.atribuito == True,
                rv.status != 'Cancelada',
                tv.data_inicio >= date_start,
                tv.data_fim <= date_end,
                tv.tecnico == int(user)
            )
        ).all()
        
        data_daily = []
        total_value_daily = 0.0
        total_quantity_daily = 0
        
        for q in query: 
            lis = {
                'id_viagem': q[0],
                'id_entidade':q[1],
                'nome_entidade': q[2],
                'status_viagem': q[3],
                'tipo_viagem': q[4],
                'local_viagem': q[5],
                'descricao_viagem': q[6],
                'id_tecnico': q[7],
                'nome_tecnico': q[8],
                'data_inicio': q[9].strftime('%d/%m/%Y %H:%M'),
                'data_fim': q[10].strftime('%d/%m/%Y %H:%M'),
                'quantidade_diarias': q[11],
                'valor_diarias': q[12],
                'relatorio_intranet': q[13]               
            }
            data_daily.append(lis)
            total_value_daily += float(q[12])
            total_quantity_daily += 1
            

        return {'total_quantity_daily': total_quantity_daily, 'total_value_daily':total_value_daily, 'data_daily':data_daily }
    except Exception as e:
        raise InvalidUsage(message=f"Ocorreu um erro ao executar a função query_daily_travel: {str(e)}", status_code=500)
      
def get_daily_travels(data):
    compentece = None
    travels = None
    daily = None
    month =  data.get('filtroCompetencias', 0)
    date_start = data.get('filtroDataInicio', None)
    date_end = data.get('filtroDataFim', None)

    user = data.get('filtroUser', None)

    if user: 
        try: 
            if int(user) != current_user.id and current_user.admin is False: 
                raise InvalidUsage(message="Usuário Não possui permissão para emitir esse relatório", status_code=403)
        except Exception as e: 
            raise InvalidUsage(message=f"Ocorreu um erro ao executar o processo: {e}", status_code=500)    

    if month == '0' and date_start is None and date_end is None:
        raise InvalidUsage(message=f"Se a competencia for 0 (todos), deve ser enviado o periodo selecionado", status_code=401)
    
    
    
    if date_start: 
        date_start = datetime.strptime(date_start,"%Y-%m-%d")
        # date_start = datetime.strftime("%Y-%m-%d")

    if date_end:
        date_end = datetime.strptime(date_end,"%Y-%m-%d")
        # date_end = datetime.strftime("%Y-%m-%d")
    
    if month != '0': 
        compentece = get_competence(int(month))    
    
    
    if compentece: 
        daily = query_daily_travel(compentece.get('date_start', date.today()), 
                                   compentece.get('date_end', date.today()),
                                   db, (user if user else current_user.id))
    else :  
        daily = query_daily_travel(date_start, 
                                   date_end,
                                   db, (user if user else current_user.id))    
     
    print(f'\n\n{daily}\n\n')  

    pass

