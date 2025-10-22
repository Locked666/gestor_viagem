from flask import jsonify
from apps.models import db, Entidades
from .authentication.models import Users
from .socketio_instance import socketio
# from apps.travel.models import RegistroViagens
# from apps.exceptions.exception import InvalidUsage




def send_notification(type_notify = None, data: dict | list = None, message: str = None, id_viagem: int = None):
    
    print(f"\n\n> send_notification: type_notify={type_notify}, data={data}, message={message}\n\n")

    # if not data:
    #     return jsonify({'success': False, 'message': 'É necessário enviar os dados da notificação.'})
    
    
    if data:
        entidade_nome = (Entidades.query.with_entities(Entidades.nome)
                                    .filter_by(id=int(data.get('entidade_id',0)))
                                    .scalar()
                                    if (data.get('entidade_id',0)) else None
                            ),
    
#    'tecnicos': ['1', '2', '3', '5', '7'] 

    tecnicos_nome = []
    tecnicos = data.get('tecnicos', [])
    
    if len(tecnicos) >= 0 :
        for tecnico in tecnicos:
            user_nome = (Users.query.with_entities(Users.username)
                                .filter_by(id=int(tecnico))
                                .scalar()
                                if tecnico else None
                            )
            if user_nome:
                tecnicos_nome.append(user_nome)
                
    if type_notify == 'new_travel':
        socketio.emit(type_notify, {
            'message': message if message else 'Uma viagem foi agendada.', 
            'id_viagem': id_viagem,
            'entidade_nome': entidade_nome[0],
            'data_saida': data.get('data_saida', None).strftime('%d/%m/%Y %H:%M') if data.get('data_saida', None) else None,
            'data_retorno': data.get('data_retorno', None).strftime('%d/%m/%Y %H:%M') if data.get('data_retorno', None) else None,
            'tecnicos': tecnicos_nome
            })
        
    elif type_notify == 'delete_travel':
        socketio.emit('new_travel', {
            'message': message if message else 'Uma viagem foi Deletada.', 
            'id_viagem': id_viagem,
            'entidade_nome': entidade_nome[0],
            'data_saida': data.get('data_saida', None).strftime('%d/%m/%Y %H:%M') if data.get('data_saida', None) else None,
            'data_retorno': data.get('data_retorno', None).strftime('%d/%m/%Y %H:%M') if data.get('data_retorno', None) else None,
            'tecnicos': tecnicos_nome
            })  
          
    elif type_notify == 'cancel_travel':
        socketio.emit('new_travel', {
            'message': message if message else 'Uma viagem foi cancelada.', 
            'id_viagem': id_viagem,
            'entidade_nome': entidade_nome[0],
            'data_saida': data.get('data_saida', None).strftime('%d/%m/%Y %H:%M') if data.get('data_saida', None) else None,
            'data_retorno': data.get('data_retorno', None).strftime('%d/%m/%Y %H:%M') if data.get('data_retorno', None) else None,
            'tecnicos': tecnicos_nome
            })    
        
    elif type_notify == 'finish_travel':
        socketio.emit('new_travel', {
            'message': message if message else 'Uma viagem foi Finalizada.', 
            'id_viagem': id_viagem,
            'entidade_nome': entidade_nome[0],
            'data_saida': data.get('data_saida', None).strftime('%d/%m/%Y %H:%M') if data.get('data_saida', None) else None,
            'data_retorno': data.get('data_retorno', None).strftime('%d/%m/%Y %H:%M') if data.get('data_retorno', None) else None,
            'tecnicos': tecnicos_nome
            })    
    elif type_notify == 'edit_travel':
        socketio.emit('new_travel', {
            'message': message if message else 'Uma viagem foi Editada.', 
            'id_viagem': id_viagem,
            'entidade_nome': entidade_nome[0],
            'data_saida': data.get('data_saida', None).strftime('%d/%m/%Y %H:%M') if data.get('data_saida', None) else None,
            'data_retorno': data.get('data_retorno', None).strftime('%d/%m/%Y %H:%M') if data.get('data_retorno', None) else None,
            'tecnicos': tecnicos_nome
            })    

# def send_notification(type_notify: str = None, data: dict | list = None):
    
#     if not data:
#         return jsonify({'success': False, 'message': 'É necessário enviar os dados da notificação.'})
#     # user = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
#     # viagem = db.Column(db.Integer, db.ForeignKey('registro_viagens.id'), nullable=True)
#     # tipo = db.Column(db.String(50), nullable=False, comment= "tipo de notificação, ex: altered, new_travel, canceled")
#     # mensagem = db.Column(db.String(255), nullable=False)
#     # is_read = db.Column(db.Boolean, default=False)
#     # timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())
    
#     match type_notify:
        
#         case 'new_travel':
            
#             entidade_nome = (Entidades.query.with_entities(Entidades.nome)
#                                 .filter_by(id=int(data.get('entidade_id',0)))
#                                 .scalar()
#                                 if (data.get('entidade_id',0)) else None
#                             ),
            
#             tecnicos = data.get('tecnicos', [])
            
#             if len(tecnicos) >= 0 :
#                 for tecnico in tecnicos:
                    
#                     insert_notify =  Notify(
#                         user =  
#                     )
    
    
    
    
    
#     pass