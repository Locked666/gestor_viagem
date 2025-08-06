from apps.api_rest import blueprint
from flask import jsonify,request
from flask_login import login_required, current_user
from apps.authentication.models import Users
from apps.models import Entidades
from apps.travel.models import RegistroViagens,TecnicosViagens
from apps.exceptions.exception import InvalidUsage



@blueprint.route('/entidade', methods = ['GET'])
@login_required

def get_entidades():
    q = request.args.get('q', '')
    resultados = Entidades.query.filter(Entidades.nome.ilike(f"%{q}%")).all()
    return jsonify([
        {"id": e.id, "nome": e.nome}
        for e in resultados
    ])
    
@blueprint.route('/travel/get/<integer>', methods = ['GET'])    
@login_required
def get_viagens(integer):
    """
    Retorna as viagens do usuário logado.
    """
    
    try: 
        travel = RegistroViagens.query.filter_by(id=int(integer)).first()
        
        if not travel:
            return jsonify({"message": "Nenhuma travel encontrada."}), 404
        
        tec_travel = TecnicosViagens.query.filter_by(viagem=int(integer)).all()
    
        if current_user.id != tec_travel[0].tecnico and not current_user.admin:
            return jsonify({"message": "Sem permissão para acessar essa viagem"}), 403
        
        
        travel_data = {
            "id": travel.id,
            "tipo": travel.tipo_viagem,
            "status": travel.status,
            "descricao": travel.descricao,
            "data_inicio": travel.data_inicio.strftime('%d/%m/%Y %H:%M') if travel.data_inicio else None,
            "entidade_destino": Entidades.query.filter_by(id=travel.entidade_destino).first().nome if travel.entidade_destino else None
        }

        
        return jsonify(travel_data)
    
    except Exception as e:
        raise InvalidUsage(f'Erro ao buscar viagens: {str(e)}', status_code=500)