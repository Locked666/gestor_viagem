from apps.api_rest import blueprint
from flask import jsonify,request
from flask_login import login_required, current_user
from apps.authentication.models import Users
from apps.models import Entidades


@blueprint.route('/entidade', methods = ['GET'])
@login_required

def get_entidades():
    q = request.args.get('q', '')
    resultados = Entidades.query.filter(Entidades.nome.ilike(f"%{q}%")).all()
    return jsonify([
        {"id": e.id, "nome": e.nome}
        for e in resultados
    ])
