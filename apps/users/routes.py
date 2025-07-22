from apps.users import blueprint
from flask_login import login_required, current_user, login_user
from flask import render_template, request, redirect, url_for, jsonify
from apps.authentication.models import Users
from apps.exceptions.exception import InvalidUsage





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
        users = Users.query.all()
        if not users:
            return render_template('users/index.html', **context, users=None)    
        return render_template('users/index.html', **context, users=users)
    
    elif request.method == 'PUT':
        data = request.get_json()
        user = Users.query.filter_by(id=data['id']).first()
        
        if not user:
            raise InvalidUsage('Usuário não encontrado.', status_code=404)
        
        print(f'\n\n\n {data} ')
        user.save()
        return jsonify({'message': 'User updated successfully'}), 200    
    