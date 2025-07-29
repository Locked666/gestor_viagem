from apps.travel import blueprint
from flask_login import login_required, current_user, login_user
from flask import render_template, request, redirect, url_for, jsonify
from apps.travel.models import RegistroViagens,GastosViagens,db
from sqlalchemy import and_
from apps.exceptions.exception import InvalidUsage
from apps.authentication.models import Users
from apps.users.validation import validadion_user, validadion_password
from apps.authentication.util import verify_pass,hash_pass


@blueprint.route('/travel', methods = ['GET'])
@login_required
def index():
    context = {
        'segment': 'travel',
        'title': 'Viagens'
    }
    
    return render_template('travel/index.html', **context)



@blueprint.route('/travel/add', methods = ['GET','POST'])
@login_required
def add_travel():
    if request.method == 'GET':
        tecnicos = Users.query.filter_by(diaria= True, active = True).all()
        context = {
            'segment': 'travel',
            'title': 'Adicionar -Viagens'
        }

        return render_template('travel/add-travel.html', **context, tecnicos = tecnicos)
    
    elif request.method == 'POST':
        data = request.get_json()
        
        
        
        return jsonify({'success': True, 'message': 'Viagem Agendada com sucesso', 'id': 10})
    
    else: 
        return redirect('/travel', 302)
        

@blueprint.route('/travel/edit', methods = ['GET', 'PUT'])
@login_required
def edit_travel():
    
    id_viagem =  request.args.get('idTravel')
    
    if not id_viagem:
        raise InvalidUsage(message='ID da viagem é obrigatório', status_code=400)
    
    
    
    travel = {'id': id_viagem, 'entidade': 25}
    
    context = {
            'segment': 'travel',
            'title': 'Editar - Viagens'
        }

    
    return render_template('travel/edit-travel.html', **context, travel  = travel)

