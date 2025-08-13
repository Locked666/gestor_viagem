from apps.travel import blueprint
from flask_login import login_required, current_user, login_user
from flask import render_template, request, redirect, url_for, jsonify
from datetime import datetime
from apps.travel.models import RegistroViagens ,GastosViagens ,TecnicosViagens ,db
from sqlalchemy import and_
from apps.exceptions.exception import InvalidUsage
from apps.authentication.models import Users
from apps.models import Entidades
from apps.users.validation import validadion_user, validadion_password
from apps.authentication.util import verify_pass,hash_pass
from apps.api_rest.services import validade_user_travel


def convert_to_datetime(dt):
    """
    Converte uma string ISO datetime para objeto datetime.datetime.
    """
    if not dt:
        return None
    try:
        return datetime.fromisoformat(dt)
    except (ValueError, TypeError) as err:
        raise InvalidUsage(f'Formato de data inválido: {err}', status_code=400)


@blueprint.route('/travel', methods = ['GET'])
@login_required
def index():
    context = {
        'segment': 'travel',
        'title': 'Viagens'
    }
    
    message_code = request.args.get('message')
    if message_code == '403':
        context['message'] = 'Você não tem permissão para editar esta viagem.'
    
    if message_code == '404':
        context['message'] = 'Viagem não encontrada.'    
    
    travels = RegistroViagens.query.filter_by(ativo=True).all()
    if not travels:
        return render_template('travel/index.html', **context, travels=None)
    
    for travel in travels:
        travel.data_inicio_convert = travel.data_inicio.strftime('%d/%m/%Y %H:%M') if travel.data_inicio else None
        travel.entidade_nome = Entidades.query.filter_by(id=travel.entidade_destino).first().nome if travel.entidade_destino else None
    
    
    return render_template('travel/index.html', **context, travels=travels)



# Adicionar Travel / agenda
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

        data['data_saida'] = convert_to_datetime(data.get('data_saida'))
        
        try:
            new_travel =  RegistroViagens(
                entidade_destino = data.get('entidade_id', 0),
                data_inicio = data.get('data_saida', None),
                data_fim = data.get('data_fim', None),
                tipo_viagem = data.get('tipo_viagem', None),
                local_viagem = data.get('local_viagem', None),
                descricao = data.get('descricao', ""),
                veiculo = data.get('veiculo', None),
                placa = data.get('placa', None),
                km_inicial = data.get('km_inicial', None),
                km_final = data.get('km_final', None),
                n_combustivel = data.get('n_combustivel', None),
                total_gasto = 0.0,  # Inicialmente zero
                usuario = current_user.id
            )
            db.session.add(new_travel)
            
            db.session.commit()
            tecnicos = data.get('tecnicos', [])
            if len(tecnicos) == 0 :
                raise InvalidUsage(message='É necessário informar pelo menos um técnico', status_code=400)
            
            for tecnico_id in tecnicos:
                tecnico = TecnicosViagens( 
                    viagem = new_travel.id,
                    tecnico = tecnico_id
                )
                db.session.add(tecnico)
            
            
            db.session.commit()
            
            if data.get('envia_email', False):
            # Aqui você pode implementar a lógica para enviar o e-mail
                pass
            
            return jsonify({'success': True, 'message': 'Viagem Agendada com sucesso', 'id': new_travel.id}), 200
        
        except Exception as e: 
            db.session.rollback()
            print(f"Error adding travel: {str(e)}")
            raise InvalidUsage(message=str(e), status_code=500)    
            
        
    else: 
        return redirect('/travel', 302)
        

@blueprint.route('/travel/edit', methods = ['GET', 'PUT'])
@login_required
def edit_travel():
    
    id_viagem =  request.args.get('idTravel')
    
    travel = validade_user_travel(id_viagem, False)
    
    if not travel or isinstance(travel, dict):
        if travel.get('success', True) is False:
            return redirect(url_for('travel_blueprint.index', message=travel.get('status_code', 404)))
    
    tec_travel = TecnicosViagens.query.filter_by(viagem=id_viagem).all()
    
    for tecnico in tec_travel:
        tecnico.username = Users.query.filter_by(id=tecnico.tecnico).first()

    if not id_viagem:
        raise InvalidUsage(message='ID da viagem é obrigatório', status_code=400)
    
    
    
    travel = RegistroViagens.query.filter_by(id=id_viagem).first()
    if not travel:
        return redirect(url_for('travel_blueprint.index', message='404'))
    
    travel.data_inicio_convert = travel.data_inicio.strftime('%d/%m/%Y %H:%M') if travel.data_inicio else None
    travel.entidade_nome = Entidades.query.filter_by(id=travel.entidade_destino).first().nome if travel.entidade_destino else None
    
    
    context = {
            'segment': 'travel',
            'title': 'Editar - Viagens'
        }

    
    return render_template('travel/edit-travel.html', **context, travel  = travel, tecnicos=tec_travel)

