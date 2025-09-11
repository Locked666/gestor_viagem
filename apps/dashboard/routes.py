from apps.dashboard import blueprint
from flask_login import login_required, current_user, login_user
from flask import render_template, request, redirect, url_for, jsonify
from apps.dashboard.services import get_travel_statistics_user



@blueprint.route('/user', methods=['GET'])
@login_required
def user():
    

    statistics = get_travel_statistics_user(current_user.id)
    
    return jsonify(statistics)
        