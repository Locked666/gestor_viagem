from apps.reports import blueprint
from flask import redirect, render_template, jsonify, request
from flask_login import current_user
from apps.authentication.models import Users, db
from apps.exceptions.exception import InvalidUsage
from apps.reports.services import get_daily_travels
from datetime import datetime


def get_current_month():
    return datetime.now().month

print(f"\n\n\nCurrent Month: {get_current_month()}\n\n\n")



@blueprint.route('/travel', methods = ['GET', 'POST'])
def reports_travel():
    context= {
        'segment' : 'reports_travel',
        'title': 'Relatorios viagens'
    }

    if request.method == 'GET':
        users_travel = Users.query.filter(Users.active == True, Users.diaria == True).all()



        return render_template("relatorios/index_travel.html", current_month = str(get_current_month()), users_daily = users_travel, **context)
    
    elif request.method == 'POST':

        data = request.get_json()

        report_request = data.get('reportRequest', None)

        if report_request is  None and report_request == "":
            return jsonify({'success': False, 'message': 'reportRequest unknow'})

        match report_request:
            case 'travels':

                return jsonify({'success': True, 'message': 'Utilizado a opção do sistema Travels'})
            case 'daily':
                return jsonify({'success': True, 'message': 'Retornado relatório de diárias' , 'data' : get_daily_travels(data)}) 
                # return jsonify({'success': True, 'message': 'Utilizado a opção do sistema daily'})
            case _:
                return jsonify({'success': False, 'message': 'Opção Não é valida '})

            
