from apps.travel import blueprint
from flask_login import login_required, current_user
from flask import render_template, request, redirect, url_for, jsonify

from apps.travel.models import RegistroViagens ,TecnicosViagens ,db, GastosViagens
from sqlalchemy import and_
from apps.exceptions.exception import InvalidUsage
from apps.authentication.models import Users
from apps.models import Entidades
from apps.finance.models import MovFinanceira

from apps.api_rest.services import validade_user_travel
from apps.utils.fuctions_for_date import convert_to_datetime
import locale
from datetime import datetime
locale.setlocale(locale.LC_ALL, 'pt_BR.UTF-8')  # Define a localidade para português do Brasil

# from datetime import datetime
# from apps.users.validation import validadion_user, validadion_password
# from apps.authentication.util import verify_pass,hash_pass




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
    
    
    travels = RegistroViagens.query.filter(RegistroViagens.ativo == True).order_by(RegistroViagens.id.desc()).all()

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
        
        date_start = request.args.get('date_start', None)
        
        print(f'\n\n{date_start}\n\n')
        
        if date_start is not None and date_start != "":
            # Converte 'YY-mm-dd' para 'yyyy-MM-ddThh:mm' com hora padrão 07:30
            try:
                date_obj = datetime.strptime(date_start, "%Y-%m-%d")
                date_start_convert = date_obj.strftime("%Y-%m-%dT07:30")
            except Exception:
                date_start_convert = None
        else:
            date_start_convert = None
        
        context = {
            'segment': 'travel',
            'title': 'Adicionar - Viagens'
        }

        return render_template('travel/add-travel.html', **context, tecnicos = tecnicos, date_start = date_start_convert)
    
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
    
    def case_json(payload,key, field, date_iso = False): 
                if data.get(key, None) is not None:
                    if data.get(key, None) != '':
                        if not date_iso:
                            return payload[key]
                        else: 
                            return convert_to_datetime(payload[key])
                return field    
    
    if request.method == 'GET':
        
        id_viagem =  request.args.get('idTravel')
        
        if not id_viagem:
            # raise InvalidUsage(message='ID da viagem é obrigatório', status_code=400)
            return redirect(url_for('travel_blueprint.index', message='404'))
        
        id_user =  request.args.get('idUser')
        
        travel = validade_user_travel(id_viagem, False)
        
        if not travel or isinstance(travel, dict):
            if travel.get('success', True) is False:
                return redirect(url_for('travel_blueprint.index', message=travel.get('status_code', 404)))
        
        tec_travel = TecnicosViagens.query.filter_by(viagem=id_viagem).all()
        
        for tecnico in tec_travel:
            tecnico.username = Users.query.filter_by(id=tecnico.tecnico).first()

        travel = RegistroViagens.query.filter_by(id=id_viagem).first()
        
        if not travel:
            return redirect(url_for('travel_blueprint.index', message='404'))
        
        travel.data_inicio_convert = travel.data_inicio.strftime('%d/%m/%Y %H:%M') if travel.data_inicio else None
        travel.entidade_nome = Entidades.query.filter_by(id=travel.entidade_destino).first().nome if travel.entidade_destino else None
        
        expenses_for_travel = GastosViagens.query.filter_by(viagem=id_viagem, tecnico = current_user.id).all()
        
        for expense in expenses_for_travel:
           expense.data_convert =  expense.data_gasto.strftime('%d/%m/%Y %H:%M') if expense.data_gasto else None

        total = 0.0
        total_estorno = 0.0

        for expense in expenses_for_travel:
            if expense.ativo: 
                 total += float(expense.valor)
                 
                 if expense.estorno:
                     total_estorno += float(expense.valor) 
        
        totais =  {'total': locale.currency(total, grouping=True), 'total_estorno': locale.currency(total_estorno, grouping=True)}     

        finance_for_travel = MovFinanceira.query.filter(and_(MovFinanceira.viagem==id_viagem, MovFinanceira.tecnico==current_user.id)).all()
        
        for finance in finance_for_travel:
            finance.data_lanc_convert = finance.data_lanc.strftime('%d/%m/%Y %H:%M') if finance.data_lanc else None
            finance.valor_convert = locale.currency(finance.valor, grouping=True) if finance.valor else locale.currency(0, grouping=True)
            finance.tipo_full = 'Crédito' if finance.tipo == 'C' else 'Débito' if finance.tipo == 'D' else 'N/A'
            
                        
        
        
        
        context = {
                'segment': 'travel',
                'title': 'Editar - Viagens'
            }

        
        return render_template('travel/edit-travel.html', **context,
                               travel  = travel,
                               tecnicos=tec_travel,
                               expenses = expenses_for_travel, 
                               totalizado = totais, 
                               finance = finance_for_travel
                               )

    elif request.method == 'PUT':
        
        data = request.get_json()
        
        id_viagem = data.get('id_viagem', None)
        
        if not id_viagem: 
            return InvalidUsage(message='ID da viagem é obrigatório', status_code=400)
        
        travel = validade_user_travel(id_viagem)

        try:

            tecnico_of_travel = data['tecnico_user']  if data.get('tecnico_user', None) is not None and data.get('tecnico_user', None) != '' else current_user.id
            
            print(f"\n\n\ntecnico of travel\n{tecnico_of_travel}\n\n\n")
            
            tecnico_travel = TecnicosViagens.query.filter_by(viagem=id_viagem, tecnico=tecnico_of_travel).first()
            
            print(f"\n\n\ntecnico_travel\n{tecnico_travel}\n\n\n")
            if tecnico_travel == None:
                raise InvalidUsage(message='Técnico não encontrado para esta viagem', status_code=404)
            
            tecnico_travel.atribuito =  True 
            
            tecnico_travel.data_inicio = case_json(data, 'data_saida', tecnico_travel.data_inicio, date_iso=True)
            tecnico_travel.data_fim = case_json(data, 'data_retorno', tecnico_travel.data_fim, date_iso=True)
            tecnico_travel.n_diaria = case_json(data, 'quantidade_diarias', tecnico_travel.n_diaria)
            tecnico_travel.v_diaria = case_json(data, 'valor_total', tecnico_travel.v_diaria)
            tecnico_travel.n_intranet = case_json(data, 'codigo_relatorio', tecnico_travel.n_intranet)

            db.session.commit()
            
            return jsonify({'success': True, 'message': 'Viagem editada com sucesso.'}), 200
        
        except Exception as e:
            db.session.rollback()
            raise InvalidUsage(f'Erro ao editar viagem: {str(e)}', status_code=500)
        
        
@blueprint.route('/travel/events', methods = ['GET'])
@login_required
def calendar_events():
    context = {
        'segment': 'calendar',
        'title': 'Viagens'
    }
    
    return render_template('calendar/index.html', **context)