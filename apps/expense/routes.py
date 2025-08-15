from apps.expense import blueprint
from flask_login import login_required, current_user, login_user
from flask import render_template, request, redirect, url_for, jsonify

from apps.travel.models import RegistroViagens ,TecnicosViagens ,db
from sqlalchemy import and_
from apps.exceptions.exception import InvalidUsage
from apps.authentication.models import Users
from apps.models import Entidades

from apps.api_rest.services import validade_user_travel
from apps.utils.fuctions_for_date import convert_to_datetime



@blueprint.route('/expense', methods = ['POST', 'PUT', 'GET'])
@login_required
def expense():
    
    return jsonify({'success': True, 'message': 'expense.'})

