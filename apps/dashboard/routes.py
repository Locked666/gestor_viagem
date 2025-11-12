from apps.dashboard import blueprint
from apps.exceptions. exception import InvalidUsage
from flask_login import login_required, current_user, login_user
from flask import render_template, request, redirect, url_for, jsonify
from apps.dashboard.services import (get_travel_statistics_user,
                                     get_diaries_last_12_months, 
                                     get_travels_last_12_months,get_statistics_card_edit_travel)



@blueprint.route('/get/user/cards', methods=['GET'])
@login_required
def user_cards():
    
    statistics = get_travel_statistics_user(current_user.id)
    
    return jsonify(statistics)


@blueprint.route('/get/user/graphics', methods=['GET'])
@login_required
def user_graphic():
    
    statistics = {}
    
    statistics_daily = get_diaries_last_12_months(current_user.id)
    statistics_travels = get_travels_last_12_months(current_user.id)
    
    statistics['graphic_daily'] = statistics_daily
    statistics['graphic_travels'] = statistics_travels
    
    
    return jsonify(statistics)


@blueprint.route('dashboard/cards/travels', methods=['GET'])
@login_required
def get_cards_travels():
    
    data = request.get_json()
    
    if not data: 
        raise InvalidUsage('É necessário Conter o json', status_code = 400)
    
    if 'travel_id' not in data:
        raise InvalidUsage('É necessário Conter o id a viagem', status_code = 400)
    
    travel_id = data.get('travelId','')
    
    if not travel_id:
        raise InvalidUsage('ID da viagem é obrigatório', status_code=400)
    
    statistics = get_statistics_card_edit_travel(travel_id)