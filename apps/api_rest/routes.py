from apps.api_rest import blueprint
from flask import jsonify,request,send_from_directory
from flask_login import login_required, current_user
# from flask_socketio import emit
from apps.authentication.models import Users
from apps.models import Entidades
from apps.travel.models import TecnicosViagens, db, GastosViagens, RegistroViagens,DocumentosViagens
from apps.exceptions.exception import InvalidUsage
from apps.api_rest.services import validade_user_travel
from apps.utils.fuctions_for_date import convert_to_datetime
from werkzeug.utils import secure_filename
from flask_socketio import emit

from werkzeug.exceptions import BadRequest
from datetime import datetime, timedelta
import os 

import locale

locale.setlocale(locale.LC_ALL, 'pt_BR.UTF-8')  # Define a localidade para português do Brasil
UPLOAD_FOLDER = 'uploads/documentos'
ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg', 'png'}

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
        # verificar se vem via calendar
        
        is_calendar = request.args.get('calendar', 'false')
        
        if is_calendar == 'true':
            travel = validade_user_travel(integer, validade=False, break_ex = False)
        else: 
            travel = validade_user_travel(integer)

        # Monta dados básicos da viagem

        if isinstance(travel, dict):
            if travel.get('success', False) == False:
                raise InvalidUsage(travel.get('message'), status_code=travel.get('status_code'))
        
        travel_data = {
            "id": travel.id,
            "tipo_viagem": travel.tipo_viagem,
            "status": travel.status,
            "descricao": travel.descricao,
            "data_inicio": travel.data_inicio.strftime('%d/%m/%Y %H:%M') if travel.data_inicio else None,
            "local_viagem": travel.local_viagem,
            
            "data_fim": travel.data_fim.strftime('%d/%m/%Y %H:%M') if travel.data_fim else None,
            "entidade_destino": (
                Entidades.query.with_entities(Entidades.nome)
                .filter_by(id=travel.entidade_destino)
                .scalar()
                if travel.entidade_destino else None
            ),
            "entidade_id": travel.entidade_destino,
        }

        # Se for consulta via calendário, inclui técnicos relacionados
        if is_calendar == 'true':
            # Faz join para evitar N+1 queries
            tecnicos_viagem = (
                db.session.query(TecnicosViagens, Users)
                .join(Users, TecnicosViagens.tecnico == Users.id)
                .filter(TecnicosViagens.viagem == travel.id)
                .all()
            )

            travel_data["tecnicos"] = [
                {
                    "id_user": tec.id,
                    "username": user.username,
                    "atribuito": tec.atribuito,
                    "relatorio": tec.n_intranet
                }
                for tec, user in tecnicos_viagem
            ]

            
        return jsonify({'success': True, 'message': 'Viagem encontrada.', 'data': travel_data}), 200
    
    except ValueError as e:
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
        expenses = GastosViagens.query.filter_by(viagem=int(integer)).all()
        
        if expenses:
            for expense in expenses:
                if expense.arquivo is not None and expense.arquivo != '':
                    # Remover o arquivo do sistema de arquivos
                    try:
                        file = DocumentosViagens.query.filter_by(id=expense.arquivo).first() 
                        if os.path.exists(file.arquivo):
                            os.remove(file.arquivo)
                            
                        if file:
                            db.session.delete(file)
                            db.session.commit()
                            
                    except Exception as e:
                        raise InvalidUsage(message=f"Erro ao remover o arquivo associado: {e}", status_code=500)
        GastosViagens.query.filter_by(viagem=int(integer)).delete()            

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
        travel = validade_user_travel(integer, validade=False)

        if isinstance(travel, dict):
            if not travel.get('success', False):
                return jsonify(travel)
        
        travel.status = 'Concluída'
        
        db.session.commit()
        
        return jsonify({"success": True, "message": "Viagem concluída com sucesso."}), 200
    
    except ValueError as e:
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
    
    data_fim = data.get('data_fim', None)
    
    status = data.get('status', None)
    
    if data_inicio is not None or data_inicio != "":
        data_inicio = convert_to_datetime(data.get('data_inicio'))
        
    if data_fim is not None or data_fim != "":    
        data_fim = convert_to_datetime(data.get('data_fim'))
    
    
    try: 
        travel.entidade_destino = entidade_destino if entidade_destino is not None and entidade_destino != "" else travel.entidade_destino
        travel.tipo_viagem = tipo_viagem if tipo_viagem is not None else travel.tipo_viagem
        travel.descricao = descricao if descricao is not None and descricao != "" else travel.descricao
        travel.data_inicio = data_inicio if data_inicio is not None else travel.data_inicio
        travel.data_fim = data_fim if data_fim is not None else travel.data_fim
        travel.status = status if status is not None else travel.status
        db.session.commit()
        return jsonify({"success": True, "message": "Viagem atualizada com sucesso."}), 200
    
    except Exception as e:
        db.session.rollback()
        raise InvalidUsage(f'Erro ao atualizar viagem: {str(e)}', status_code=500)
        

# Expense API 

@blueprint.route('/expense/get/totalizer', methods=['GET'])
@login_required
def get_expense():
    try:
        id_expense = request.args.get('id_gasto')
        id_travel = request.args.get('id_viagem')
        id_user = request.args.get('id_tecnico')

        if not id_travel:
            raise InvalidUsage(message="Obrigatório o id da Viagem", status_code=400)

        if not id_user:
            id_user = current_user.id

        expenses_for_travel = GastosViagens.query.filter_by(
            viagem=id_travel,
            tecnico=id_user
        ).all()

        total = 0.0
        total_estorno = 0.0

        for expense in expenses_for_travel:
            if expense.ativo:
                total += float(expense.valor)
                if expense.estorno:
                    total_estorno += float(expense.valor)

        return jsonify({
            'success': True,
            'message': 'Total Atualizado',
            'total': locale.currency(total, grouping=True),
            'total_estorno': locale.currency(total_estorno, grouping=True)
        })

    except ValueError as e:
        raise InvalidUsage(
            message=f"Ocorreu um erro ao processar as informações: {e}",
            status_code=500
        )
   
    
@blueprint.route('/events/get', methods = ['GET', 'POST'])
@login_required

def get_events_travel():
    
    events = []
    
    date_start = request.args.get('start')
    date_end = request.args.get('end')
    
    # print(f"Data Inicio: {convert_to_datetime(date_start)}")
    # print(f"Data Fim: {convert_to_datetime(date_end)}")
    
    try:

        if request.args.get('filter') == 'true':
            
            travels =  RegistroViagens.query.filter_by(ativo = True).all()
            
                
            filter_scheduled = request.args.get('scheduled') == 'true'
            filter_in_progress = request.args.get('in_progress') == 'true'
            filter_completed = request.args.get('completed') == 'true'
            filter_cancelled = request.args.get('cancelled') == 'true'
            
            filtered_travels = []
            
            for travel in travels:
                if (filter_scheduled and travel.status == 'Agendada') or \
                   (filter_in_progress and travel.status == 'Em Andamento') or \
                   (filter_completed and travel.status == 'Concluída') or \
                   (filter_cancelled and travel.status == 'Cancelada'):
                    filtered_travels.append(travel)
                    
            travels = filtered_travels
        else:
            travels = (
                RegistroViagens.query
                .filter(
                    RegistroViagens.ativo == True,
                    ~RegistroViagens.status.in_(["Concluída", "Cancelada"])
                )
                .all()
            )
        for travel in travels: 
            n_events = {
                "id": travel.id,
                "title": travel.descricao, 
                "start": "",
                "end": "",
                "backgroundColor": ""
                # "start": travel.data_inicio.strftime('%Y-%m-%dT%H:%M') if travel.data_inicio else None,
                # "end": travel.data_fim.strftime('%Y-%m-%d') if travel.data_fim else None,
            }
            
            if travel.dia_todo:
                n_events['start'] = travel.data_inicio.strftime('%Y-%m-%d') if travel.data_inicio else None
                n_events['end'] = (travel.data_fim + timedelta(days=1)).strftime('%Y-%m-%d') if travel.data_fim else None
            else:
                n_events['start'] = travel.data_inicio.strftime('%Y-%m-%dT%H:%M') if travel.data_inicio else None
                n_events['end'] = travel.data_fim.strftime('%Y-%m-%dT%H:%M') if travel.data_fim else None
            
            
            match travel.status:
                case "Agendada": 
                    n_events['backgroundColor'] = 'green'
                    
                case "Em Andamento": 
                    n_events['backgroundColor'] = 'turquoise'
                    
                case "Concluída": 
                    n_events['backgroundColor'] = 'lightseagreen'
                    
                case "Cancelada": 
                    n_events['backgroundColor'] = 'red'
            
            events.append(n_events)
        
        return jsonify(events)
    except Exception as e: 
        raise InvalidUsage(message=f"Ocorreu um erro ao executar a consulta dos eventos {e}", status_code=500)    
    

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS    


@blueprint.route('/upload', methods=['POST', 'PUT', 'GET'])
@login_required
def upload_file():
    try:
        
        if request.method == 'GET':
   
            absolute_path = os.path.abspath(UPLOAD_FOLDER)

            return jsonify({'success': True, 'message': 'route validade', 'path': absolute_path})

        
        if 'arquivo' not in request.files:
            return jsonify({'status': 'error', 'message': 'Nenhum arquivo enviado'}), 400
        
        arquivo = request.files['arquivo']
        viagem_id = request.form.get('viagemId')
        tipo_documento = request.form.get('tipoDocumento')

        
        #Validações
        if arquivo.filename == '':
            return jsonify({'status': 'error', 'message': 'Nome de arquivo vazio'}), 400
            
        if not allowed_file(arquivo.filename):
            return jsonify({'status': 'error', 'message': 'Tipo de arquivo não permitido'}), 400
        
        # Cria diretório se não existir
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)

        
        # Grava no banco de dados
        novo_documento = DocumentosViagens(
            tipo=tipo_documento,
            data=datetime.now()
        )
        
        db.session.add(novo_documento)
        db.session.commit()
        
        # Gera nome seguro para o arquivo
        filename = secure_filename(f"{viagem_id}_{novo_documento.id}_{tipo_documento}_{arquivo.filename}")
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        # Salva o arquivo
        arquivo.save(filepath)
        
        novo_documento.arquivo = filepath
        db.session.commit()
        
        return jsonify({
            'success': True,
            'documentoId': novo_documento.id,
            'caminho': filepath
        }),200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Erro no processamento do arquivo: {str(e)}'
        }), 500
    
    
@blueprint.route('/file/get/<int:documento_id>', methods=['GET'])
@login_required
def get_documento_file(documento_id):
    """Retorna o arquivo bruto para download/visualização"""
    documento = DocumentosViagens.query.get_or_404(documento_id)
    directory = os.path.dirname(documento.arquivo)
    filename = os.path.basename(documento.arquivo)
    absolute_path = os.path.abspath(UPLOAD_FOLDER)
    # print(f"\n\nDirectory: {absolute_path},\n Filename: {filename}\n\n")
    return send_from_directory(absolute_path, filename, as_attachment=False)


@blueprint.route('/file/get/info/<int:documento_id>', methods=['GET'])
@login_required
def get_documento_info(documento_id):
    """Retorna apenas os metadados do documento"""
    documento = DocumentosViagens.query.get_or_404(documento_id)
    extensao = os.path.splitext(documento.arquivo)[1].lower().strip(".")

    return jsonify({
        'id': documento.id,
        'arquivo': documento.arquivo,
        'tipo': documento.tipo,
        'extensao': extensao
    })


@blueprint.route('/users/technicians', methods=['POST', 'PUT', 'GET'])
@login_required          

def get_technicians():
    """Retorna a lista de técnicos cadastrados"""
    if request.method == 'GET':
        try:
            users = Users.query.filter_by(active=True, diaria = True).all()
            return jsonify({
                'success': True,
                'message': 'Técnicos encontrados',
                'data': [
                    {
                        'id': user.id,
                        'username': user.username,
                    } for user in users
                ]
            }), 200
        except Exception as e:
            raise InvalidUsage(f'Erro ao buscar técnicos: {str(e)}', status_code=500)
    
    elif request.method == 'POST':
        data = request.get_json()
        id_travel = data.get('idTravel', None)
        tecnicos =  data.get('newTechnicians', [])
        
        if not id_travel:
            raise InvalidUsage(message='ID da viagem é obrigatório', status_code=400)
        
        if len(tecnicos) == 0:
            raise InvalidUsage(message='Nenhum técnico selecionado', status_code=400)
        
        
        try:
            for tec in tecnicos:
                existing_entry = TecnicosViagens.query.filter_by(viagem=id_travel, tecnico=tec).first()
                if not existing_entry:
                    novo_tecnico = TecnicosViagens(
                        viagem = id_travel,
                        tecnico = Users.query.get(tec).id,
                        atribuito = False,
                        
                    )
                    db.session.add(novo_tecnico)
                    db.session.commit()
            return jsonify({
                'success': True,
                'message': 'Técnicos da viagem encontrados',
            }), 200
        except Exception as e:
            raise InvalidUsage(f'Erro ao buscar técnicos da viagem: {str(e)}', status_code=500)    
        
        
        
#  integracao com sistema de notificao 


@blueprint.route('/notify/CheckStatus', methods = ['GET'])
def notify_check_status():
    return jsonify({'status': 'ok', 'message': 'API de Notificações está ativa'}), 200        