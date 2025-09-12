from apps.api_rest import blueprint
from flask import jsonify,request
from flask_login import login_required, current_user
from apps.authentication.models import Users
from apps.models import Entidades
from apps.travel.models import RegistroViagens,TecnicosViagens, db
from apps.exceptions.exception import InvalidUsage


def validade_user_travel(travel_id, validade = True, message = 'O Usuário não tem permissão para executar essa ação', break_ex = True):
    """
    Valida se o usuário atual tem permissão para acessar a viagem.
    """
    travel = RegistroViagens.query.filter_by(id=int(travel_id)).first()
        
    if not travel:
        if not validade:
            return {"success":False,"message": "Nenhuma viagem encontrada.", "status_code": 404 }
        
        raise InvalidUsage({"success":False,"message": "Nenhuma viagem encontrada."}, status_code=404)
    
    tec_travel = TecnicosViagens.query.filter_by(viagem=travel_id).all()

    for tecnico in tec_travel:
        tecnico.username = Users.query.filter_by(id=tecnico.tecnico).first()
    
    
    tecnicos = [t.tecnico for t in tec_travel if t.tecnico] 
    
    if current_user.id not in tecnicos and not current_user.admin:
        if not validade:
            if break_ex:
                return {"success":False,"message": message, "status_code": 403,"typeToast":"info", "titleToast": "Permissão Negada", "iconToast": "notifications"}
        if break_ex:
            raise InvalidUsage({"success": False,"message": message }, status_code=403)
    
    return travel

