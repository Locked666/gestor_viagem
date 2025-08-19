from apps.api_rest import blueprint
from flask import jsonify,request
from flask_login import login_required, current_user
from apps.authentication.models import Users
from apps.models import Entidades
from apps.travel.models import TecnicosViagens, db, GastosViagens
from apps.exceptions.exception import InvalidUsage
from apps.api_rest.services import validade_user_travel
from apps.utils.fuctions_for_date import convert_to_datetime


@blueprint.route('/entidade', methods = ['GET'])
@login_required

def get_entidades():
    q = request.args.get('q', '')
    resultados = Entidades.query.filter(Entidades.nome.ilike(f"%{q}%")).all()
    return jsonify([
        {"id": e.id, "nome": e.nome}
        for e in resultados
    ])



### Travell APIs    
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
            "tipo_viagem": travel.tipo_viagem,
            "status": travel.status,
            "descricao": travel.descricao,
            "data_inicio": travel.data_inicio.strftime('%d/%m/%Y %H:%M') if travel.data_inicio else None,
            "entidade_destino": Entidades.query.filter_by(id=travel.entidade_destino).first().nome if travel.entidade_destino else None,
            "entidade_id": travel.entidade_destino,
        }

        
        return jsonify({'success': True, 'message': 'Viagem encontrada.', 'data': travel_data}), 200
    
    except Exception as e:
        raise InvalidUsage(f'Erro ao buscar viagens: {str(e)}', status_code=500)
    
    
@blueprint.route('/travel/delete/<integer>', methods = ['DELETE'])
@login_required
def delete_travel(integer):
    """
    Deleta uma viagem pelo ID.
    """
    try: 
        travel = validade_user_travel(integer)
        
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

@blueprint.route('/travel/finish/<integer>', methods = ['PUT'])  
@login_required    
def finish_travel(integer):
    """
    Conclui uma viagem pelo ID.
    """
    try: 
        travel = validade_user_travel(integer)
        
        travel.status = 'Concluida'
        db.session.commit()
        
        return jsonify({"success": True, "message": "Viagem concluída com sucesso."}), 200
    
    except Exception as e:
        db.session.rollback()
        raise InvalidUsage(f'Erro ao concluir viagem: {str(e)}', status_code=500) 
    
@blueprint.route('/travel/edit', methods = ['GET','PUT'])
@login_required
def edit_travel():
    
    if request.method ==  'GET':
        return jsonify({"success": False, "message": "Método GET não permitido nesta rota."}), 405
    
    data = request.get_json()
    
    id_viagem = data.get('id_viagem', None)
    if not id_viagem:
        raise InvalidUsage(message='ID da viagem é obrigatório', status_code=400)
    
    travel = validade_user_travel(id_viagem)
    
    
    
    entidade_destino = data.get('entidade_destino', None)
    tipo_viagem = data.get('tipo_viagem', None)
    descricao = data.get('descricao', None)
    data_inicio = data.get('data_inicio', None)
    status = data.get('status', None)
    
    if data_inicio is not None or data_inicio != "":
        data_inicio = convert_to_datetime(data.get('data_inicio'))
        print(f"\n\n\nData after conversion: {data['data_inicio']}\n\n\n")
    
    
    try: 
        travel.entidade_destino = entidade_destino if entidade_destino is not None and entidade_destino != "" else travel.entidade_destino
        travel.tipo_viagem = tipo_viagem if tipo_viagem is not None else travel.tipo_viagem
        travel.descricao = descricao if descricao is not None and descricao != "" else travel.descricao
        print(f"\n\n\n{data_inicio}\n\n\n")
        travel.data_inicio = data_inicio if data_inicio is not None else travel.data_inicio
        travel.status = status if status is not None else travel.status
        db.session.commit()
        return jsonify({"success": True, "message": "Viagem atualizada com sucesso."}), 200
    
    except Exception as e:
        db.session.rollback()
        raise InvalidUsage(f'Erro ao atualizar viagem: {str(e)}', status_code=500)
        

# Expense API 

@blueprint.route('/expense/get', methods = ['GET'])
@login_required
def get_expense():
    data = request.get_json()
    
    id_expense = data.get('id_gasto', None)
    id_travel = data.get('id_viagem', None)
    id_user = data.get('id_tecnico', None)
    
    if id_travel is None or id_travel == "": 
        raise InvalidUsage(message="Obrigatório o id da Viagem", status_code=400)
    
    if id_user is None or id_user == "": 
        id_user = current_user.id
    
    
    try:
    
        expense =  GastosViagens.query.filter_by(viagem= id_travel, tecnico = id_user).all()
    
        return jsonify({'success': True, 'message': 'Expenses', 'expense': expense})
    except ValueError as e : 
        raise InvalidUsage(message=f"Ocorreu um erro ao processsar as informations: {e}", status_code=500)    
    
    
    
    
    
    
    
        
          