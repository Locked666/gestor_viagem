from apps.finance import blueprint
from flask import jsonify, request, render_template
from flask_login import login_required, current_user
from apps.travel.models import RegistroViagens, db, GastosViagens, TecnicosViagens
from apps.finance.models import MovFinanceira, MovFinanceiraDetalhe
from apps.exceptions.exception import InvalidUsage




@blueprint.route('/finance', methods=['GET'])
@login_required
def index():
    context = {
        'segment': 'finance',
        'title': 'Financeiro'
    }
    
    return render_template('finance/index.html', **context)



@blueprint.route('/finance/get/travel/<int:travel_id>', methods=['GET'])
@login_required
def get_travel_finance(travel_id):
    if not travel_id: 
        raise InvalidUsage('ID da viagem é Obrigatório', status_code=400)
    
    travel = RegistroViagens.query.filter_by(id=travel_id, ativo=True).first()
    
    