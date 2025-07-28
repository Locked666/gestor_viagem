from flask import Blueprint

blueprint = Blueprint(
    'apirest_blueprint',
    __name__,
    url_prefix='/api/v1'
)