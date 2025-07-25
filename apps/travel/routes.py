from apps.travel import blueprint
from flask_login import login_required, current_user, login_user
from flask import render_template, request, redirect, url_for, jsonify
from apps.models import RegistroViagens,GastosViagens,db
from sqlalchemy import and_
from apps.exceptions.exception import InvalidUsage
from apps.authentication.models import Users
from apps.users.validation import validadion_user, validadion_password
from apps.authentication.util import verify_pass,hash_pass


@blueprint.route('/travel', methods = ['GET'])
@login_required
def index():
    context = {
        'segment': 'travel - ',
        'title': 'Viagens'
    }
    
    return render_template('travel/index.html', **context)



@blueprint.route('/travel/add', methods = ['GET','POST'])
@login_required
def add_travel():
    tecnicos = Users.query.filter_by(diaria= True, active = True).all()
    context = {
        'segment': 'travel',
        'title': 'Viagens'
    }

    return render_template('travel/add-travel.html', **context, tecnicos = tecnicos)


