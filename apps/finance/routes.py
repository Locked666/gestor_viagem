from apps.finance import blueprint
from flask import jsonify, request, render_template
from flask_login import login_required
from apps.travel.models import RegistroViagens, db, GastosViagens, TecnicosViagens
from apps.exceptions.exception import InvalidUsage
from apps.finance.services import validade_data_finance, insert_data_finance,delete_finance
from apps.api_rest.services import validade_user_travel
# Define a localidade para português do Brasil

@blueprint.route('/finance', methods=['GET'])
@login_required
def index():
    context = {
        'segment': 'finance',
        'title': 'Financeiro'
    }
    
    return render_template('finance/index.html', **context)
    # return jsonify({'success':True,'message':'Rota de Financeiro'})



@blueprint.route('/finance/get/travel/<int:travel_id>', methods=['GET'])
@login_required
def get_travel_finance(travel_id):
    if not travel_id: 
        raise InvalidUsage('ID da viagem é Obrigatório', status_code=400)
    
    travel = RegistroViagens.query.filter_by(id=travel_id, ativo=True).first()



@blueprint.route('/finance/travel/', methods=['POST'])
@login_required
def add_finance():
    
    data = request.get_json()
    data_va = validade_data_finance(data, current_method='POST', event='include')
    
    if data_va.get('success', False) is False:
        return jsonify(data_va)
    
    travel = validade_user_travel(data.get('id_viagem', None), break_ex=False)
    
    if not travel:
        return jsonify({'success':False,'message':'Viagem não encontrada ou você não tem permissão para adicionar financeiro nesta viagem'})
    

    data_insert = insert_data_finance(data_va)
    
    
    if data_insert.get('success', False) is False:
        return jsonify(data_insert)
    
    
    return jsonify(data_insert)
    
    
    
    
    
    
    # if data_va.get('success', False) is False:
    #     return jsonify(data_va)


@blueprint.route('/finance/travel/delete/<int:id_finance>', methods=['DELETE'])    
@login_required
def finance_delete(id_finance):
    
    if not id_finance:
        return jsonify({'success':False,'message':'ID do Financeiro é obrigatório'})
    data_delete = delete_finance(id_finance)
    return jsonify(data_delete)
    
    pass

    