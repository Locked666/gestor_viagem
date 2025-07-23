from apps.users import blueprint
from flask_login import login_required, current_user, login_user
from flask import render_template, request, redirect, url_for, jsonify
from apps.authentication.models import Users,db
from apps.models import RegistroViagens
from sqlalchemy import and_
from apps.exceptions.exception import InvalidUsage
from apps.users.validation import validadion_user





@blueprint.route('/users', methods=['GET', 'POST', 'PUT', 'DELETE'])
@login_required
def index():
    context = {
        'segment': 'users',
        'title': 'Users'
    }
    
    if current_user.admin is False:
         return render_template('error/403.html', **context)
    
    
    if request.method == 'GET':
        if request.args.get('search'):
            search_query = request.args.get('search')
            users = Users.query.filter(Users.username.ilike(f'%{search_query}%')).all()
        else:
            users = Users.query.all()
        
        if not users:
            return render_template('users/index.html', **context, users=None)    
        return render_template('users/index.html', **context, users=users)
    
    
    elif request.method == 'PUT':
        data = request.get_json()
        
        validadion_user(data)
        
        if data.get('user_id', None) == None or data.get('user_id') == 0:
            raise InvalidUsage(message = 'Parametro ID é obrigatório', status_code=402)
        
        user = Users.query.filter_by(id=data['user_id']).first()
        user_email = Users.query.filter(
            and_(
                Users.email == data['email'],
                Users.id != data['user_id']
            )
        ).first()

        user_name = Users.query.filter(
            and_(
                Users.username == data['username'],
                Users.id != data['user_id']
            )
        ).first()
        
        
        if user_name: 
            raise InvalidUsage(message = "Nome de Usuário Já cadastrado", status_code = 400)
        
        if user_email :
            raise InvalidUsage(message = "E-mail Já cadastrado", status_code = 400)

        if not user:
            raise InvalidUsage(message = 'Usuário não encontrado.', status_code=404)
        
        if data.get('admin', None) is not None and not current_user.admin:
            raise InvalidUsage(message ='Apenas administradores podem alterar o status de administrador.', status_code=403)
        
        if not current_user.admin and data['user_id'] != current_user.id:
            raise InvalidUsage(message ='Você não pode alterar o status de outro usuário.', status_code=403)
        
        user_email = Users.query.filter_by(email=data.get('email')).first()
        
        if user_email and user_email.id != user.id:
            raise InvalidUsage('Email já cadastrado.', status_code=422)
        print(data)
        
        try: 
            
            user.username = data.get('username', user.username).strip()
            user.email = data.get('email', user.email)
            user.setor = data.get('setor', user.setor)
            user.active = True if data.get('active', False) == True else False
            user.diaria = True if data.get('diaria', False) == True else False 
            
            user.admin = True if  data.get('admin', False) == True else False
            
            user.save()    
        except InvalidUsage as e:
            return jsonify({'error': str(e)}), e.status_code
        
        
        return jsonify({'success': True,'message': 'Usuário Atualizado com Sucesso'}), 200    
    
    elif request.method == 'POST':
        
        data = request.get_json()
        
        validadion_user(data)

        user_email = Users.query.filter_by(email=data['email']).first()
        user_name = Users.query.filter_by(username=data['username']).first()

        if user_name:
            raise InvalidUsage(message = "Nome de Usuário Já cadastrado", status_code = 400)
        
        if user_email :
            raise InvalidUsage(message = "E-mail Já cadastrado", status_code = 400)
        
        try:
            data['password'] = data['username'].strip()
            data['username'] = data['username'].strip()
            new_user = Users(**data)
            db.session.add(new_user)
            db.session.commit()
        
            return jsonify({'success': True, 'message': f'Usuário inserido com sucesso: {new_user.id}'}), 200
        except ValueError as e: 
            raise InvalidUsage(message= f"Ocorreu um erro ao salvar o usuário:\n{e}", status_code=500)
    
    elif request.method == 'DELETE' :
        data = request.get_json()
        if data.get('user_id', None) == None:
            raise InvalidUsage(message = "É necessário o ID do usuário.", status_code= 500)
        
        
        user_viagens =  RegistroViagens.query.filter_by(usuario = data['user_id']).first()
        
        if user_viagens:
            raise InvalidUsage(message = "Existe Viagens vinculadas a esse usuário\n Não é possivel excluir", status_code = 400)
        try:
            user_delete =  Users.query.filter_by(id = data['user_id']).first()
            if not user_delete:
                raise InvalidUsage(message = "Usuário não encontrado", status_code= 404)
            
            db.session.delete(user_delete)
            db.session.commit()
            return jsonify({'success' : True, 'message' : "Usuário Excluido com sucesso !!"}), 200
        except Exception as e: 
            db.session.rollback()
            raise InvalidUsage(message= f"Não foi possivel excluir o usuário\n {e}", status_code= 500)
    
    else : 
        raise InvalidUsage(message= "Method Invalid", status_code= 400)
 
@blueprint.route('users/reset_password', methods = ['GET'])
@login_required
def reset_password():
    # if current_user.unauthorized():
    #     return render_template('error/403.html')
    return render_template('users/reset-password.html')
                
            
        
        
         