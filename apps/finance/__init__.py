from flask import Blueprint

blueprint = Blueprint(
    'finance_blueprint',
    __name__,
    url_prefix='/'
)