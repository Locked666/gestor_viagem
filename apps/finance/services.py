from flask import jsonify
from flask_login import current_user
from apps.finance.models import MovFinanceira
# from apps.exceptions.exception import InvalidUsage
from apps.travel.models import  RegistroViagens,db
from apps.authentication.models import Users
from apps.utils.fuctions_for_date import convert_to_datetime

import locale
locale.setlocale(locale.LC_ALL, 'pt_BR.UTF-8')  


FIEL_REQUIRED = ['data_lancamento', 'descricao', 'id_viagem', 'tipo', 'valor']

def validade_data_finance(data, current_method = 'POST', event = 'include'):

    # Tipo de status validos para o Gasto
    type_status_finance = ['Pendente', 'Aprovado', 'Rejeitado', 'Parcial']
    
    # Tipo de Gasto Validos]
    type_finance_valid =  ['C', 'D']
    
    id_travel= data.get('id_viagem', None)
    
    id_user= data.get('tecnico_user', current_user.id)
    

    # Status do Gasto
    status_finance  = data.get('status', None)
    
    # motivo parcial ou rejeitado. 
    reason_finance = data.get('motivo', None)
    
    date_lancamento = data.get('data_lancamento', None)
    
    # descricao do financeiro. 
    description_finance = data.get('descricao', None)
    
    # valor atual do gasto após alteração. 
    value_current =  data.get('valor_atual', None)
    
    # tipo do  Gasto
    type_finance = data.get('tipo', None)
    
    # Valor do Gasto. 
    value_finance = data.get('valor', None)
    
    ## init validadion ##
    if id_travel is None or id_travel == '': 
        return jsonify({'success':False,'message':'o Id da viagem não pode ser vazio ou null'})

    
    if current_method == 'POST':
        if value_finance is None or value_finance == "": 
            return jsonify({'success':False,'message':"O Valor do Financeiro Não pode ser null ou Vazio"})
    
    
    if type_finance is None or type_finance == "": 
        return jsonify({'success':False,'message':"Tipo do Financeiro não pode ser Null ou Vazio"})
    
    if type_finance not in type_finance_valid:
        return jsonify({'success':False,'message':"Tipo do Financeiro não é Valido"})
    
    if description_finance is None or description_finance == "": 
        return jsonify({'success':False,'message':"Descrição do Financeiro não pode ser Null ou Vazio"})
    
    
    if date_lancamento is None or date_lancamento == "":
        return jsonify({'success':False,'message':"Data do Lançamento não pode ser Null ou Vazio"})
    
    
    payload = {
        'id_viagem': id_travel,
        'tecnico_user': id_user if id_user else current_user.id,
        'status': status_finance,
        'data_lancamento': convert_to_datetime(date_lancamento),
        'descricao': description_finance,
        'tipo': type_finance,
        'valor': float(value_finance)
    }
    
    
    return {'success':True,'data':payload}
    
    
    # if status_finance is None or status_finance == "": 
    #     raise InvalidUsage(message='Status do Financeiro não pode ser Vazio', status_code=400)
    
    
    
    
    # if status_finance not in type_status_finance:
    #     raise InvalidUsage(message="Status do Financeiro Não é valido", status_code=400)
    
    # match status_finance: 
    #     case 'Parcial':
    #         if reason_finance is None or reason_finance == "":
    #             raise InvalidUsage(message="Motivo do Financeiro não pode ser null ou vazio", status_code=400)
            
    #         if value_current is None or value_current == "":
    #             raise InvalidUsage(message="Valor Atual do Financeiro não pode ser null ou vazio", status_code=400)
    

def insert_data_finance(data):
    data = data.get('data', {})
    if not data or len(data) == 0:
        return {'success':False,'message':'Nenhum dado para inserir'}
    
       
    user_travel = Users.query.filter_by(id=data.get('tecnico_user', None)).first()
    
    if not user_travel:
        return {'success':False,'message':'Usuário não encontrado para inserir financeiro'}
    
    travel = RegistroViagens.query.filter_by(id=data.get('id_viagem', None)).first()
    if not travel:
        return {'success':False,'message':'Viagem não encontrada para inserir financeiro'}
    
    
    try:
        new_finance = MovFinanceira(
            tecnico = user_travel.id,
            viagem = travel.id,
            data_lanc = data.get('data_lancamento'),
            descricao = data.get('descricao'),
            tipo = data.get('tipo'),
            valor = data.get('valor'),
        )
        
        db.session.add(new_finance)
        db.session.commit()
        # locale.currency(finance.valor, grouping=True) if finance.valor else locale.currency(0, grouping=True)
        return {'success':True,'message':'Financeiro inserido com sucesso','data':{
            'id': new_finance.id,
            'data_lancamento': new_finance.data_lanc.strftime('%d/%m/%Y %H:%M') if new_finance.data_lanc else None,
            'descricao': new_finance.descricao,
            'viagem': new_finance.viagem,
            'tecnico_user': new_finance.tecnico,
            'tipo': "Débito" if new_finance.tipo == 'D' else "Crédito",
            'valor': locale.currency(new_finance.valor, grouping=True) if new_finance.valor else locale.currency(0, grouping=True),
        }}
    except Exception as e:
        db.session.rollback()
        print(f"Error inserting finance: {str(e)}")
        return {'success':False,'message':f'Erro ao inserir financeiro: {str(e)}'}    
    
    
def delete_finance(id_finance):
    if not id_finance:
        return {'success':False,'message':'ID do Financeiro é obrigatório'}
    
    try: 
        finance = MovFinanceira.query.filter_by(id=id_finance).first()
        if not finance:
            return {'success':False,'message':'Financeiro não encontrado'}
        
        db.session.delete(finance)
        db.session.commit()
        return {'success':True,'message':'Financeiro deletado com sucesso'}
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting finance: {str(e)}")
        return {'success':False,'message':f'Erro ao deletar financeiro: {str(e)}'}
        