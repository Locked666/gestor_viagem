from flask import jsonify
from flask_login import current_user
from apps.exceptions.exception import InvalidUsage
from apps.travel.models import GastosViagens, RegistroViagens,db
from apps.authentication.models import Users
from apps.utils.fuctions_for_date import convert_to_datetime


# validar Dados
def validade_data_expense(data, current_method = 'POST', event = 'include'):
    
    print(f"\n\n\n{data}\n\n\n")
    
    # Tipo de status validos para o Gasto
    type_status_expense = ['Pendente', 'Aprovado', 'Rejeitado', 'Parcial']
    
    # Tipo de Gasto Validos]
    type_expense_valid =  ['Alimentação', 'Combustível', 'Estadia', 'Outros']
    
    id_travel= data.get('id_viagem', None)
    
    id_user= data.get('tecnico_user', None)
    
    if id_travel is None or id_travel == '': 
        raise InvalidUsage(message='o Id da viagem não pode ser vazio ou null', status_code=400)

    # Status do Gasto
    status_expense  = data.get('status', None)
    
    # motivo parcial ou rejeitado. 
    reason_expense = data.get('motivo', None)
    
    # valor atual do gasto após alteração. 
    value_current =  data.get('valor_atual', None)
    
    # tipo do  Gasto
    type_expense = data.get('tipo', None)
    
    # Valor do Gasto. 
    value_expense = data.get('valor', None)
    
    if current_method == 'POST':
        if value_expense is None or value_expense == "": 
            raise InvalidUsage(message="O Valor do Gasto Não pode ser null ou Vazio", status_code=400)
    
    
    if type_expense is None or type_expense == "": 
        raise InvalidUsage(message="Tipo do Gasto não pode ser Null ou Vazio", status_code=400)
    
    if status_expense is None or status_expense == "": 
        raise InvalidUsage(message='Status do gasto não pode ser Vazio', status_code=400)
    
    
    if type_expense not in type_expense_valid:
        raise InvalidUsage(message="Tipo do Gasto não é Valido", status_code=400)
    
    if status_expense not in type_status_expense:
        raise InvalidUsage(message="Status do Gasto Não é valido", status_code=400)
    
    match status_expense: 
        case 'Parcial':
            if reason_expense is None or reason_expense == "":
                raise InvalidUsage(message="Quando o status é parcial, deve conter o Motivo ", status_code=400)
            
            if current_method == 'PUT': 
                if value_current is None or value_current == "": 
                    raise InvalidUsage(message="Quando o status for Parcial, deve conter o valor atual", status_code=400) 
        
        case 'Rejeitado': 
            if reason_expense is None or reason_expense == "":
                raise InvalidUsage(message="Quando o status é Rejeitado, deve conter o Motivo ", status_code=400) 


# Adicionar Gasto Após validado. 

def include_data_expense(data):
   
    user_id = 0
    
    if current_user.admin: 
        if data.get('tecnico_user', None) is not None and data.get('tecnico_user', None) !="":
            user_id = int(data['tecnico_user'])
        else: 
            user_id = current_user.id
    else: 
        user_id = current_user.id                
                 
    user = Users.query.filter_by(id = int(user_id)).first()
    travel = RegistroViagens.query.filter_by(id = int(data['id_viagem'])).first()
    
    try:
        new_expense =  GastosViagens(
            viagem = travel.id ,
            tecnico = user.id ,
            data_gasto = convert_to_datetime(data['data_gasto']), 
            tipo_gasto = data['tipo'] ,
            n_documento = data.get('n_documento', None)  ,
            tipo_documento = data.get('tipo_documento', None) ,
            descricao = data.get('descricao', None),
            valor = float(data['valor']),
            arquivo = data.get('arquivo', None)  ,
            ativo = data.get('ativo', None) if data.get('ativo', None) is not None or data.get('ativo', None) != "" else True ,
            estorno = data.get('estorno', None) if data.get('estorno', None) is not None or data.get('estorno', None) != "" else False   ,
            status = data['status'] ,
            motivo = data.get('motivo', None) ,
            valor_atual = data.get('valor_atual', None),
            usuario = current_user.id
            
        )
        db.session.add(new_expense)
        db.session.commit()
        
        return jsonify({'success': True, 'message': "Gasto Adicionado com sucesso.", "id": new_expense.id})
        
    except Exception as e: 
        db.session.rollback()
        raise InvalidUsage(message=f"Ocorreu um erro ao adicionar o Gasto:\n{e}", status_code=500)    
