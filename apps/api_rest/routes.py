from apps.api_rest import blueprint
from flask import jsonify,request
from flask_login import login_required, current_user
from apps.authentication.models import Users
from apps.models import Entidades
from apps.travel.models import RegistroViagens,TecnicosViagens, db
from apps.exceptions.exception import InvalidUsage
from apps.api_rest.services import validade_user_travel



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
        travel = travel = validade_user_travel(integer)
        
        
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
    
    
@blueprint.route('/travel/delete/<integer>', methods = ['DELETE'])
@login_required
def delete_travel(integer):
    """
    Deleta uma viagem pelo ID.
    """
    try: 
        travel = travel = validade_user_travel(integer)
        
        # Deletar os técnicos associados primeiro
        TecnicosViagens.query.filter_by(viagem=int(integer)).delete()
        
        # Depois deletar a viagem
        db.session.delete(travel)
        db.session.commit()
        
        return jsonify({"success": True,"message": "Viagem deletada com sucesso."}), 200
    
    except Exception as e:
        db.session.rollback()
        raise InvalidUsage(f'Erro ao deletar viagem: {str(e)}', status_code=500)    
    
    
@blueprint.route('/travel/cancel/<integer>', methods = ['PUT'])  
@login_required
def cancel_travel(integer):
    """
    Cancela uma viagem pelo ID.
    """
    try: 
               
        travel = validade_user_travel(integer)
        
        travel.status = 'Cancelada'
        db.session.commit()
        
        return jsonify({"success": True, "message": "Viagem cancelada com sucesso."}), 200
    
    except Exception as e:
        db.session.rollback()
        raise InvalidUsage(f'Erro ao cancelar viagem: {str(e)}', status_code=500)  
    
    