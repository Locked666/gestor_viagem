from apps.travel import blueprint
from flask_login import login_required, current_user
from flask import render_template, request, redirect, url_for, jsonify

from apps.travel.models import RegistroViagens ,TecnicosViagens ,db, GastosViagens
from sqlalchemy import and_
from apps.exceptions.exception import InvalidUsage
from apps.authentication.models import Users
from apps.models import Entidades, Parametros
from apps.finance.models import MovFinanceira
from apps.socketio_instance import socketio
from apps.notify import send_notification

from apps.api_rest.services import validade_user_travel
from apps.utils.fuctions_for_date import convert_to_datetime, calcular_diarias
import locale
from datetime import datetime
locale.setlocale(locale.LC_ALL, 'pt_BR.UTF-8')  # Define a localidade para português do Brasil


@blueprint.route('/travel', methods = ['GET', 'POST'])
@login_required
def index():
    if request.method == 'GET':
        context = {
            'segment': 'travel',
            'title': 'Viagens'
        }
        
        message_code = request.args.get('message')
        if message_code == '403':
            context['message'] = 'Você não tem permissão para editar esta viagem.'
        
        if message_code == '404':
            context['message'] = 'Viagem não encontrada.'    
        
        
        travels = RegistroViagens.query.filter(
            RegistroViagens.ativo == True,
            ~RegistroViagens.status.in_(["Concluída", "Cancelada"])
        ).order_by(RegistroViagens.id.desc()).all()

        # print(f'\n\n\n{travels}\n\n\n')

        # travels = travels.join(TecnicosViagens, TecnicosViagens.viagem == RegistroViagens.id).filter(TecnicosViagens.tecnico == current_user.id)
        if not travels:
            return render_template('travel/index.html', **context, travels=None)
        
        for travel in travels:
            travel.data_inicio_convert = travel.data_inicio.strftime('%d/%m/%Y %H:%M') if travel.data_inicio else None
            travel.entidade_nome = Entidades.query.filter_by(id=travel.entidade_destino).first().nome if travel.entidade_destino else None
        
        
        return render_template('travel/index.html', **context, travels=travels)
    
    if request.method == 'POST':

        data =  request.get_json()
        
        if not data:
            raise InvalidUsage(message='Nenhum dado foi enviado', status_code=400)
        
        filter_date_start = data.get('filterDateStart', None)
        filter_date_end = data.get('filterDateEnd', None)
        filter_status_travel = data.get('filterStatusTravel', None)
        filter_entity_id = data.get('filterEntityId', None)
        filter_completed = data.get('filterCompleted', False)
        filter_canceled = data.get('filterCanceled', False)
        filter_my_travel = data.get('filterMyTravel', True)
        filter_description = data.get('filterDescription', None)
        
        
        # Comece com o filtro base
        query = RegistroViagens.query.filter(RegistroViagens.ativo == True)
 
        if filter_date_start:
            query = query.filter(RegistroViagens.data >= filter_date_start)
            
        if filter_date_end:
            query = query.filter(RegistroViagens.data <= filter_date_end)
       
        if filter_entity_id:
            query = query.filter(RegistroViagens.entidade_destino == filter_entity_id)
            
        if filter_description:
            query = query.filter(RegistroViagens.descricao.ilike(f'%{filter_description}%'))
        

        status = []
        
        if filter_status_travel == 'todos':
            
            status.append('Agendada')
            status.append('Em Andamento')
            
            if filter_completed:
                status.append("Concluída")
                
            if filter_canceled:
                status.append("Cancelada") 
        else:
            status.append(filter_status_travel)            
                
        query = query.filter(RegistroViagens.status.in_(status))        
        query = query.order_by(RegistroViagens.id.desc())        
        
        if filter_my_travel:
            query = query.join(TecnicosViagens, TecnicosViagens.viagem == RegistroViagens.id).filter(TecnicosViagens.tecnico == current_user.id)
            
        travels = query.all()
        
        
        
        data = []
        
        for travel in travels: 
            travel.data_inicio_convert = travel.data_inicio.strftime('%d/%m/%Y %H:%M') if travel.data_inicio else None
            travel.entidade_nome = Entidades.query.filter_by(id=travel.entidade_destino).first().nome if travel.entidade_destino else None
            
            data.append({
                'id': travel.id,
                'entidade_nome': travel.entidade_nome,
                'data_inicio_convert': travel.data_inicio_convert,
                'tipo_viagem': travel.tipo_viagem,
                'descricao': travel.descricao,
                'status': travel.status,
                'isAdmin': current_user.admin
            })
        
        try: 
            
            if len(data) == 0:
                return jsonify({'success': False, 'message': "Nenhum registro encontrado verifique o filtro utilizado", 'titleToast':'Notificação', 'iconToast':'notifications', 'typeToast': 'info'}), 404
            
            return jsonify({'success': True, 'message': "Filtro aplicado" ,'data': data}), 200
        
        except Exception as e:
            print(f"Error filtering travels: {str(e)}")
            raise InvalidUsage(message=str(e), status_code=500)



# Adicionar Travel / agenda
@blueprint.route('/travel/add', methods = ['GET','POST'])
@login_required
def add_travel():
    if request.method == 'GET':
        tecnicos = Users.query.filter_by(diaria= True, active = True).all()
        
        date_start = request.args.get('date_start', None)
        date_end = request.args.get('date_end', date_start)
        
        
        # print(f'\n\n{date_start}\n\n')
        
        if date_start is not None and date_start != "":
            # Converte 'YY-mm-dd' para 'yyyy-MM-ddThh:mm' com hora padrão 07:30
            try:
                date_start_obj = datetime.strptime(date_start, "%Y-%m-%d")
                date_start_convert = date_start_obj.strftime("%Y-%m-%dT07:30")
                
                date_end_obj = datetime.strptime(date_end, "%Y-%m-%d")
                date_end_convert = date_end_obj.strftime("%Y-%m-%dT17:30")
                
            except Exception:
                date_start_convert = None
                date_end_convert = None
        else:
            date_start_convert = None
            date_end_convert = None
        
        context = {
            'segment': 'travel',
            'title': 'Adicionar - Viagens'
        }

        return render_template('travel/add-travel.html', **context, tecnicos = tecnicos, date_start = date_start_convert, date_end = date_end_convert)
    
    elif request.method == 'POST':
        data = request.get_json()

        data['data_saida'] = convert_to_datetime(data.get('data_saida'))
        data['data_retorno'] = convert_to_datetime(data.get('data_retorno'))
        
        try:
            new_travel =  RegistroViagens(
                entidade_destino = data.get('entidade_id', 0),
                data_inicio = data.get('data_saida', None),
                data_fim = data.get('data_retorno', None),
                dia_todo = True if data.get('dia_todo', False) else False,
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
            tecnicos_nome = []
            if len(tecnicos) >= 0 :
                for tecnico in tecnicos:
                    user_nome = (Users.query.with_entities(Users.username)
                                        .filter_by(id=int(tecnico))
                                        .scalar()
                                        if tecnico else None
                                    )
                    if user_nome:
                        tecnicos_nome.append(user_nome)
            
            entidade_nome = (Entidades.query.with_entities(Entidades.nome)
                                .filter_by(id=int(data.get('entidade_id',0)))
                                .scalar()
                                if (data.get('entidade_id',0)) else None
                            ),
                        
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
            
            send_notification('new_travel', data, message=f'Nova viagem foi agendada', id_viagem=new_travel.id)
            
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
        travel.data_fim_convert = travel.data_fim.strftime('%d/%m/%Y %H:%M') if travel.data_fim else None
        
        travel.data_inicio_convert_iso = travel.data_inicio.strftime("%Y-%m-%dT%H:%M") if travel.data_inicio else None
        travel.data_fim_convert_iso = travel.data_fim.strftime("%Y-%m-%dT%H:%M") if travel.data_fim else None
        
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

        finance_for_travel = MovFinanceira.query.filter(
            and_(MovFinanceira.viagem==id_viagem, 
                 MovFinanceira.tecnico==current_user.id
                 )).all()
        
        for finance in finance_for_travel:
            finance.data_lanc_convert = finance.data_lanc.strftime('%d/%m/%Y %H:%M') if finance.data_lanc else None
            finance.valor_convert = locale.currency(finance.valor, grouping=True) if finance.valor else locale.currency(0, grouping=True)
            finance.tipo_full = 'Crédito' if finance.tipo == 'C' else 'Débito' if finance.tipo == 'D' else 'N/A'
            

        info_tec_in_travel =  TecnicosViagens.query.filter_by(viagem=id_viagem, tecnico = current_user.id).first()
        valor_atual_diaria = db.session.query(Parametros.valor_diaria).first()[0]
        
        if info_tec_in_travel:
            info_tec_in_travel.data_inicio_convert = info_tec_in_travel.data_inicio.strftime("%Y-%m-%dT%H:%M") if info_tec_in_travel.data_inicio else travel.data_inicio_convert_iso
            info_tec_in_travel.data_fim_convert = info_tec_in_travel.data_fim.strftime("%Y-%m-%dT%H:%M") if info_tec_in_travel.data_fim else travel.data_fim_convert_iso
            info_tec_in_travel.n_diaria = info_tec_in_travel.n_diaria if info_tec_in_travel.n_diaria else calcular_diarias(travel.data_inicio, travel.data_fim)
            # info_tec_in_travel.v_diaria_convert = locale.currency(0, grouping=True)
            info_tec_in_travel.v_diaria_convert = locale.currency(info_tec_in_travel.v_diaria, grouping=True) if info_tec_in_travel.v_diaria else locale.currency((float(valor_atual_diaria)*float(calcular_diarias(travel.data_inicio, travel.data_fim))), grouping=True)
           

        context = {
                'segment': 'travel',
                'title': 'Editar - Viagens'
            }

        
        return render_template('travel/edit-travel.html', **context,
                               travel  = travel,
                               tecnicos=tec_travel,
                               expenses = expenses_for_travel, 
                               totalizado = totais, 
                               finance = finance_for_travel,
                               info_tec_in_travel = info_tec_in_travel
                            )

    elif request.method == 'PUT':
        
        data = request.get_json()
        
        id_viagem = data.get('id_viagem', None)
        
        if not id_viagem: 
            return InvalidUsage(message='ID da viagem é obrigatório', status_code=400)
        
        travel = validade_user_travel(id_viagem)

        try:

            tecnico_of_travel = data['tecnico_user']  if data.get('tecnico_user', None) is not None and data.get('tecnico_user', None) != '' else current_user.id

            tecnico_travel = TecnicosViagens.query.filter_by(viagem=id_viagem, tecnico=tecnico_of_travel).first()

            if tecnico_travel == None:
                raise InvalidUsage(message='Técnico não encontrado para esta viagem', status_code=403)
            
            

            
            if data.get('valor_total', 0.0) is not None and data.get('valor_total', 0.6) != "":

                try:
                    valor_atual_diaria = db.session.query(Parametros.valor_diaria).first()[0]
                    valor_diaria_informado = data.get('valor_total', 0.0)
                    valor_quantidade_informado = case_json(data, 'quantidade_diarias', 0.0)
                    
                    if isinstance(valor_diaria_informado, str):
                        valor_diaria_informado = float(valor_diaria_informado.replace(',','.').replace('R$','').strip())
                    
                    calc_valor_diaria = (float(valor_atual_diaria) * float(valor_quantidade_informado))
                    if (float(calc_valor_diaria)) != (float(valor_diaria_informado)): 
                        return jsonify({'success': False, 'message': f'Valor total das diárias informado: {valor_diaria_informado}, difere do valor calculado: {calc_valor_diaria}'})                         
                    
                except ValueError as e: 
                    return jsonify({'success': False, 'message': f"Ocorreu um erro ao realizar calculo: {e}"}), 500
                
            tecnico_travel.atribuito =  True 
            
            tecnico_travel.data_inicio = case_json(data, 'data_saida', tecnico_travel.data_inicio, date_iso=True)
            tecnico_travel.data_fim = case_json(data, 'data_retorno', tecnico_travel.data_fim, date_iso=True)
            # tecnico_travel.dia_todo = case_json(data, 'dia_todo', tecnico_travel.dia_todo)
            
            tecnico_travel.dia_todo = True if data.get('dia_todo', False) else False
            tecnico_travel.n_diaria = case_json(data, 'quantidade_diarias', tecnico_travel.n_diaria)
            
            
            tecnico_travel.n_intranet = case_json(data, 'codigo_relatorio', tecnico_travel.n_intranet)
            tecnico_travel.v_diaria = valor_diaria_informado if data.get('valor_total', None) else tecnico_travel.v_diaria  #case_json(data, 'valor_total', tecnico_travel.v_diaria)
            db.session.commit()
            
            return jsonify({'success': True, 'message': 'Viagem editada com sucesso.'}), 200
        
        except ValueError as e:
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


