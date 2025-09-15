from flask import jsonify
from flask_login import current_user
from apps.exceptions.exception import InvalidUsage
from apps.travel.models import GastosViagens, RegistroViagens,db
from apps.authentication.models import Users
from apps.utils.fuctions_for_date import convert_to_datetime
from datetime import datetime






def get_daily_travels(data):

    month =  data.get('filtroCompetencias', None)
    date_start = data.get('filtroDataInicio', None)
    date_end = data.get('filtroDataFim', None)

    user = data.get('filtroUser', None)

    if user: 
        try: 
            if int(user) != current_user.id and current_user.admin is False: 
                raise InvalidUsage(message="Usuário Não possui permissão para emitir esse relatório", status_code=403)
        except Exception as e: 
            raise InvalidUsage(message=f"Ocorreu um erro ao executar o processo: {e}", status_code=500)    

    if date_start: 
        date_start = datetime.strftime(date_start, "%Y-%m-%d")

    if date_end:
        date_end = datetime.strftime(date_end, "%Y-%m-%d")
        
    
    print(f'\n\n\n{month}\n\n\n')
    print(f'\n\n\n{date_start}\n\n\n')
    print(f'\n\n\n{date_end}\n\n\n')
    print(f'\n\n\n{user}\n\n\n')



    pass

