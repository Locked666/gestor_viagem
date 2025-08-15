from flask import Blueprint

blueprint = Blueprint(
    'expense_blueprint',
    __name__,
    url_prefix=''
)
