from apps.expense import blueprint
from flask_login import login_required, current_user, login_user
from flask import render_template, request, redirect, url_for, jsonify

from apps.travel.models import RegistroViagens ,TecnicosViagens, GastosViagens ,db
from sqlalchemy import and_
from apps.exceptions.exception import InvalidUsage
from apps.authentication.models import Users
from apps.models import Entidades

# from apps.api_rest.services import validade_user_travel

# from apps.utils.fuctions_for_date import convert_to_datetime

from apps.expense.services import include_data_expense, validade_data_expense




@blueprint.route('/expense', methods = ['POST', 'PUT', 'GET'])
@login_required
def expense():
    
    if request.method == "GET":
        pass
    
    
    if request.method == "POST":    
        data = request.get_json()
        
        validade = validade_data_expense(data)
        expense = include_data_expense(data)
        
        return expense
    return jsonify({'success': True, 'message': 'expense.'})

         
@blueprint.route('/expense/delete', methods=['DELETE'])       
@login_required
def delete_expense():
    if request.method == "DELETE":
        try:
            data =  request.get_json()
            
            id_expense = data.get('id_gasto', None)
            
            if id_expense is None or id_expense == "": 
                raise InvalidUsage(message="O Id do gasto é obrigatório", status_code=400)
            
            expense = GastosViagens.query.filter_by(id = int(id_expense)).first()

            if not expense or expense is None: 
                raise InvalidUsage(message="Gasto Não encontrado", status_code=404)
            
            if expense.status != 'Pendente':
                raise InvalidUsage(message='Não foi possivel realizar a exclusão do Gasto, está diferente de pendente', status_code=400)

            db.session.delete(expense)
            db.session.commit()
            return jsonify({'success': True, 'message':'Gasto Excluido com sucesso.'})
        
        except ValueError as e: 
            db.session.rollback()
            raise InvalidUsage(message=f"Ocorreu um erro ao realizar a exclusão: {e}", status_code=500)    
        
        
        
        
        
            
    

